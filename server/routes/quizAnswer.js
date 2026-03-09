// const db = require("../db");
// const {
//   calculateSingleScore,
//   calculateMultipleScore,
//   calculateOrderingScore,
// } = require("../services/scoreCalculator");

// module.exports = (io, socket) => {
//   console.log("📝 QuizAnswer socket ready:", socket.id);

//   // 🔒 กัน double submit / race condition
//   const submitLocks = new Set();

//   socket.on("submit_answer", async (payload) => {
//     const {
//       activitySessionId,
//       quizId,
//       questionId,
//       studentId,
//       questionType,
//       choiceIds,
//       timeSpent,
//       currentQuestionIndex,
//       totalQuestions
//     } = payload;

//     const lockKey = `${activitySessionId}-${questionId}-${studentId}`;
//     if (submitLocks.has(lockKey)) {
//       console.warn("⚠️ double submit blocked:", lockKey);
//       return;
//     }
//     submitLocks.add(lockKey);

//     try {
//       if (!activitySessionId || !questionId || !studentId) {
//         throw new Error("Missing required fields");
//       }

//       await db.query("BEGIN");

//       /* ================= CHECK CORRECT ================= */

//       let isCorrect = false;

//       if (questionType === "ordering") {
//         const correctRes = await db.query(`
//           SELECT "Option_ID"
//           FROM "QuestionOptions"
//           WHERE "Question_ID" = $1
//           ORDER BY "Option_ID"
//         `, [questionId]);

//         const correctOrder = correctRes.rows.map(r => Number(r.Option_ID));
//         const studentOrder = choiceIds
//           .sort((a,b)=>a.order-b.order)
//           .map(a => Number(a.optionId));

//         isCorrect =
//           studentOrder.length === correctOrder.length &&
//           studentOrder.every((id,i)=>id===correctOrder[i]);

//       } else {
//         const correctRes = await db.query(`
//           SELECT "Option_ID"
//           FROM "Question_Correct_Options"
//           WHERE "Question_ID" = $1
//         `, [questionId]);

//         const correctOptionIds = correctRes.rows.map(r => Number(r.Option_ID));
//         const selectedIds = choiceIds.map(Number);

//         if (selectedIds.length === 0) isCorrect = false;
//         else if (correctOptionIds.length === 1)
//           isCorrect = selectedIds[0] === correctOptionIds[0];
//         else
//           isCorrect =
//             selectedIds.length === correctOptionIds.length &&
//             selectedIds.every(id => correctOptionIds.includes(id));
//       }

//       socket.emit("answer_result", { questionId, isCorrect });

//       /* ================= UPSERT QUIZ ANSWERS ================= */

//       for (const choice of choiceIds) {
//         const choiceId = questionType === "ordering" ? choice.optionId : choice;
//         const order = questionType === "ordering" ? choice.order : null;

//         await db.query(`
//           INSERT INTO "QuizAnswers"
//           ("ActivitySession_ID","Quiz_ID","Question_ID","Student_ID",
//            "Choice_ID","Is_Correct","Answer_Order","Answered_At","Time_Spent")
//           VALUES ($1,$2,$3,$4,$5,$6,$7,NOW(),$8)
//           ON CONFLICT ("ActivitySession_ID","Question_ID","Student_ID","Choice_ID")
//           DO UPDATE SET
//             "Is_Correct" = EXCLUDED."Is_Correct",
//             "Answer_Order" = EXCLUDED."Answer_Order",
//             "Time_Spent" = EXCLUDED."Time_Spent",
//             "Answered_At" = NOW()
//         `, [
//           activitySessionId, quizId, questionId, studentId,
//           choiceId, isCorrect, order, timeSpent
//         ]);
//       }

//       /* ================= UPDATE PROGRESS ================= */

//       await db.query(`
//         INSERT INTO "QuizProgress"
//         ("ActivitySession_ID","Student_ID","Current_Question","Total_Questions","Updated_At")
//         VALUES ($1,$2,$3,$4,NOW())
//         ON CONFLICT ("ActivitySession_ID","Student_ID")
//         DO UPDATE SET
//           "Current_Question" = GREATEST("QuizProgress"."Current_Question", EXCLUDED."Current_Question"),
//           "Updated_At" = NOW()
//       `, [activitySessionId, studentId, currentQuestionIndex ?? 1, totalQuestions ?? 1]);

//       /* ================= CALCULATE SCORE ================= */

//       let score = 0;

//       const assignedRes = await db.query(`
//         SELECT "Question_Time"
//         FROM "AssignedQuiz"
//         WHERE "ActivitySession_ID" = $1
//       `, [activitySessionId]);

//       const maxTime = assignedRes.rows[0]?.Question_Time ?? timeSpent;

//       if (questionType === "single")
//         score = calculateSingleScore({ isCorrect, timeSpent, maxTime });

//       else if (questionType === "multiple") {
//         const correctRes = await db.query(`
//           SELECT "Option_ID"
//           FROM "Question_Correct_Options"
//           WHERE "Question_ID" = $1
//         `, [questionId]);

//         const correctIds = correctRes.rows.map(r => Number(r.Option_ID));
//         const selectedIds = choiceIds.map(Number);

//         const correctCount = selectedIds.filter(id => correctIds.includes(id)).length;

//         score = calculateMultipleScore({
//           correctCount,
//           wrongCount: selectedIds.length - correctCount,
//           maxTime,
//           timeSpent
//         });
//       }

//       else if (questionType === "ordering") {
//         const correctRes = await db.query(`
//           SELECT "Option_ID"
//           FROM "QuestionOptions"
//           WHERE "Question_ID" = $1
//           ORDER BY "Option_ID"
//         `, [questionId]);

//         const correctOrder = correctRes.rows.map(r => Number(r.Option_ID));
//         const studentOrder = choiceIds.sort((a,b)=>a.order-b.order).map(a=>Number(a.optionId));

//         score = calculateOrderingScore({ correctOrder, studentOrder, maxTime, timeSpent });
//       }

//       if (!isCorrect) score = 0;

//       /* ================= UPSERT QUIZ RESULTS ================= */

//       await db.query(`
//         INSERT INTO "QuizResults"
//         ("Quiz_ID","Student_ID","ActivitySession_ID",
//          "Total_Score","Total_Time_Taken","Total_Question",
//          "Total_Correct","Total_Incorrct")
//         VALUES ($1,$2,$3,$4,$5,1,$6,$7)
//         ON CONFLICT ("Quiz_ID","Student_ID","ActivitySession_ID")
//         DO UPDATE SET
//           "Total_Score" = "QuizResults"."Total_Score" + EXCLUDED."Total_Score",
//           "Total_Time_Taken" = "QuizResults"."Total_Time_Taken" + EXCLUDED."Total_Time_Taken",
//           "Total_Question" = "QuizResults"."Total_Question" + 1,
//           "Total_Correct" = "QuizResults"."Total_Correct" + EXCLUDED."Total_Correct",
//           "Total_Incorrct" = "QuizResults"."Total_Incorrct" + EXCLUDED."Total_Incorrct"
//       `, [
//         quizId, studentId, activitySessionId,
//         score, timeSpent,
//         isCorrect ? 1 : 0,
//         isCorrect ? 0 : 1
//       ]);

//       /* ================= RANKING ================= */

//       const modeRes = await db.query(`
//         SELECT "Mode"
//         FROM "AssignedQuiz"
//         WHERE "ActivitySession_ID" = $1
//       `, [activitySessionId]);

//       const mode = modeRes.rows[0]?.Mode || "individual";

//       let rankingRes;

//       if (mode === "individual") {
//         rankingRes = await db.query(`
//           SELECT s."Student_Name" AS name,
//                  qr."Total_Score" AS score,
//                  qr."Total_Time_Taken" AS time
//           FROM "QuizResults" qr
//           JOIN "Students" s ON s."Student_ID" = qr."Student_ID"
//           WHERE qr."ActivitySession_ID" = $1
//           ORDER BY score DESC, time ASC
//           LIMIT 5
//         `, [activitySessionId]);
//       } else {
//         rankingRes = await db.query(`
//           SELECT ta."Team_Name" AS name,
//                  SUM(qr."Total_Score") AS score,
//                  SUM(qr."Total_Time_Taken") AS time
//           FROM "QuizResults" qr
//           JOIN "TeamMembers" tm ON tm."Student_ID" = qr."Student_ID"
//           JOIN "TeamAssignments" ta ON ta."Team_ID" = tm."Team_ID"
//           WHERE qr."ActivitySession_ID" = $1
//           GROUP BY ta."Team_Name"
//           ORDER BY score DESC, time ASC
//           LIMIT 5
//         `, [activitySessionId]);
//       }

//       io.to(`activity_${activitySessionId}`).emit("question_ranking", rankingRes.rows);

//       /* ================= EMIT PROGRESS + SUCCESS ================= */

//       socket.emit("submit_answer_success", { questionId, studentId });

//       io.emit("quiz_progress_updated", { activitySessionId });

//       socket.emit("check_quiz_finished", { activitySessionId });

//       await db.query("COMMIT");

//     } catch (err) {
//       await db.query("ROLLBACK");
//       console.error("❌ submit_answer error:", err.message);
//       socket.emit("submit_answer_error", { message: err.message });
//     } finally {
//       submitLocks.delete(lockKey);
//     }
//   });

//   /* ================= GET QUIZ PROGRESS ================= */

//   socket.on("get_quiz_progress", async ({ activitySessionId }) => {
//     try {
//       const res = await db.query(`
//         SELECT
//           s."Student_ID",
//           s."Student_Name",
//           COALESCE(qp."Current_Question", 0) AS current_question,
//           COALESCE(qp."Total_Questions", 0) AS total_questions,
//           ROUND(
//             COALESCE(qp."Current_Question",0) * 100.0
//             / NULLIF(qp."Total_Questions",0)
//           ) AS percent
//         FROM public."ActivityParticipants" ap
//         JOIN "Students" s ON s."Student_ID" = ap."Student_ID"
//         LEFT JOIN "QuizProgress" qp
//           ON qp."Student_ID" = ap."Student_ID"
//          AND qp."ActivitySession_ID" = ap."ActivitySession_ID"
//         WHERE ap."ActivitySession_ID" = $1
//           AND ap."Left_At" IS NULL
//         ORDER BY s."Student_Name"
//       `, [activitySessionId]);

//       socket.emit("quiz_progress_data", res.rows);
//     } catch (err) {
//       console.error("❌ get_quiz_progress error:", err.message);
//       socket.emit("quiz_progress_data", []);
//     }
//   });

//   /* ================= CHECK QUIZ FINISHED ================= */

//   socket.on("check_quiz_finished", async ({ activitySessionId }) => {
//     try {
//       const res = await db.query(`
//         SELECT
//           COUNT(*) FILTER (
//             WHERE "Current_Question" >= "Total_Questions"
//           ) AS finished,
//           COUNT(*) AS total
//         FROM "QuizProgress"
//         WHERE "ActivitySession_ID" = $1
//       `, [activitySessionId]);

//       const { finished, total } = res.rows[0];

//       socket.emit("quiz_finished_status", {
//         finished: Number(finished),
//         total: Number(total),
//         isFinished: Number(finished) === Number(total) && total > 0
//       });

//       if (Number(finished) === Number(total) && total > 0) {
//         socket.broadcast.emit("quiz_auto_finished", { activitySessionId });
//       }

//     } catch (err) {
//       console.error("❌ check_quiz_finished error:", err.message);
//     }
//   });

// };

const db = require("../db");
const {
  calculateSingleScore,
  calculateMultipleScore,
  calculateOrderingScore,
} = require("../services/scoreCalculator");

const rankingSnapshot = {};

module.exports = (io, socket) => {
  console.log("📝 QuizAnswer socket ready:", socket.id);

  const submitLocks = new Set();

  socket.on("submit_answer", async (payload) => {
    const {
      activitySessionId,
      quizId,
      questionId,
      studentId,
      questionType,
      choiceIds,
      timeSpent,
      currentQuestionIndex,
      totalQuestions
    } = payload;

    const lockKey = `${activitySessionId}-${questionId}-${studentId}`;
    if (submitLocks.has(lockKey)) return;
    submitLocks.add(lockKey);

    try {
      await db.query("BEGIN");

      // 🧹 ลบคำตอบเก่า
      await db.query(
        `
        DELETE FROM "QuizAnswers"
        WHERE "ActivitySession_ID" = $1
          AND "Question_ID" = $2
          AND "Student_ID" = $3
        `,
        [activitySessionId, questionId, studentId]
      );

      /* ================= CHECK CORRECT ================= */

      let isCorrect = false;

      if (questionType === "ordering") {
        console.log("⏱ submit timeSpent =", timeSpent);


        for (const ans of choiceIds) {
          await db.query(
            `
            INSERT INTO "QuizAnswers"
            (
              "ActivitySession_ID",
              "Quiz_ID",
              "Question_ID",
              "Student_ID",
              "Choice_ID",
              "Answer_Order",
              "Answered_At",
              "Time_Spent"
            )
            VALUES ($1,$2,$3,$4,$5,$6,NOW(),$7)
            `,
            [
              activitySessionId,
              quizId,
              questionId,
              studentId,
              ans.optionId,   // 👈 สำคัญ
              ans.order,      // 👈 สำคัญ
              timeSpent
            ]
          );
        }
        const studentOrder = choiceIds
          .sort((a,b) => a.order - b.order)
          .map(a => Number(a.optionId));

        const correctRes = await db.query(`
          SELECT "Option_ID"
          FROM "QuestionOptions"
          WHERE "Question_ID" = $1
          ORDER BY "Option_ID" ASC
        `, [questionId]);

        const correctOrder =
          correctRes.rows.map(r => Number(r.Option_ID));

        console.log("🧠 studentOrder =", studentOrder);
        console.log("✅ correctOrder =", correctOrder);

        isCorrect =
          studentOrder.length === correctOrder.length &&
          studentOrder.every((id,i) => id === correctOrder[i]);

         console.log("🎯 ordering isCorrect =", isCorrect);

        socket.emit("answer_result", {
          questionId,
          isCorrect,
        });

      } else {

        /* =====================================================
          SINGLE / MULTIPLE (ของเดิมเป๊ะ)
        ===================================================== */

        const correctRes = await db.query(
          `SELECT "Option_ID"
          FROM "Question_Correct_Options"
          WHERE "Question_ID" = $1`,
          [questionId]
        );

        const correctOptionIds = correctRes.rows.map(r => Number(r.Option_ID));
        const selectedIds = choiceIds.map(Number);


        if (selectedIds.length === 0) {
          isCorrect = false;
        }
        else if (correctOptionIds.length === 1) {
          isCorrect = selectedIds[0] === correctOptionIds[0];
        }
        else {
          isCorrect =
            selectedIds.length === correctOptionIds.length &&
            selectedIds.every(id => correctOptionIds.includes(id));
        }

        socket.emit("answer_result", {
          questionId,
          isCorrect,
          correctOptionIds,
        });

        for (const choiceId of choiceIds) {
          await db.query(
            `
            INSERT INTO "QuizAnswers"
            (
              "ActivitySession_ID",
              "Quiz_ID",
              "Question_ID",
              "Student_ID",
              "Choice_ID",
              "Answered_At",
              "Time_Spent"
            )
            VALUES ($1,$2,$3,$4,$5,NOW(),$6)
            `,
            [
              activitySessionId,
              quizId,
              questionId,
              studentId,
              choiceId,
              timeSpent
            ]
          );
        }
      }
      /* ================= UPDATE PROGRESS ================= */

      await db.query(`
        INSERT INTO "QuizProgress"
        ("ActivitySession_ID","Student_ID","Current_Question","Total_Questions","Updated_At")
        VALUES ($1,$2,$3,$4,NOW())
        ON CONFLICT ("ActivitySession_ID","Student_ID")
        DO UPDATE SET
          "Current_Question" = GREATEST("QuizProgress"."Current_Question", EXCLUDED."Current_Question"),
          "Updated_At" = NOW()
      `, [activitySessionId, studentId, currentQuestionIndex ?? 1, totalQuestions ?? 1]);

      /* ================= CALCULATE SCORE ================= */

      // const assignedRes = await db.query(`
      //   SELECT "Question_Time","Mode"
      //   FROM "AssignedQuiz"
      //   WHERE "ActivitySession_ID"=$1
      // `, [activitySessionId]);

      // const mode = assignedRes.rows[0]?.Mode || "individual";

      let score = 0;

      // 🔥 ถ้าไม่ได้ตอบเลย ให้ 0 คะแนนทันที
      if (!choiceIds || choiceIds.length === 0) {
        console.log("⚠️ No answer submitted → score = 0");

        score = 0;
      }
      else {

        // maxTime ต้องมี
        const assignedRes = await db.query(`
          SELECT "Timer_Type","Question_Time"
          FROM "AssignedQuiz"
          WHERE "ActivitySession_ID" = $1
        `, [activitySessionId]);

        const maxTime =
          assignedRes.rows[0]?.Question_Time ?? timeSpent;

        if (questionType === "single") {
          score = calculateSingleScore({
            isCorrect,
            timeSpent,
            maxTime,
          });
        }

        else if (questionType === "multiple") {

          const correctRes = await db.query(`
            SELECT "Option_ID"
            FROM "Question_Correct_Options"
            WHERE "Question_ID" = $1
          `, [questionId]);

          const correctOptionIds =
            correctRes.rows.map(r => Number(r.Option_ID));

          const selectedIds = choiceIds.map(Number);

          const correctCount =
            selectedIds.filter(id =>
              correctOptionIds.includes(id)
            ).length;

          score = calculateMultipleScore({
            correctCount,
            wrongCount: selectedIds.length - correctCount,
            maxTime,
            timeSpent,
          });
        }

        else if (questionType === "ordering") {

          const correctRes = await db.query(`
            SELECT "Option_ID"
            FROM "QuestionOptions"
            WHERE "Question_ID" = $1
            ORDER BY "Option_ID" ASC
          `, [questionId]);

          const correctOrder =
            correctRes.rows.map(r => Number(r.Option_ID));

          const studentOrder =
            choiceIds
              .sort((a,b)=>a.order-b.order)
              .map(a=>Number(a.optionId));

          score = calculateOrderingScore({
            correctOrder,
            studentOrder,
            maxTime,
            timeSpent,
          });
        }
      }


      /* ================= UPSERT RESULTS ================= */

      await db.query(`
        INSERT INTO "QuizResults"
        ("Quiz_ID","Student_ID","ActivitySession_ID","Total_Score","Total_Time_Taken")
        VALUES ($1,$2,$3,$4,$5)
        ON CONFLICT ("Quiz_ID","Student_ID","ActivitySession_ID")
        DO UPDATE SET
          "Total_Score"="QuizResults"."Total_Score"+EXCLUDED."Total_Score",
          "Total_Time_Taken"="QuizResults"."Total_Time_Taken"+EXCLUDED."Total_Time_Taken"
      `, [quizId, studentId, activitySessionId, score, timeSpent]);

      /* ================= REALTIME RESULT ================= */

      const totalRes = await db.query(`
        SELECT "Total_Score"
        FROM "QuizResults"
        WHERE "Quiz_ID" = $1
          AND "Student_ID" = $2
          AND "ActivitySession_ID" = $3
      `, [
        quizId,
        studentId,
        activitySessionId
      ]);

      const totalScore = totalRes.rows[0]?.Total_Score ?? 0;

      io.to(`activity_${activitySessionId}`).emit("student_result", {
        studentId,
        scoreForThis: score,
        totalScore
      });

      /* ================= RANKING ================= */

      // let rankingRes;

      // if (mode === "individual") {
      //   rankingRes = await db.query(`
      //     SELECT s."Student_Name" AS name,
      //            qr."Total_Score" AS score,
      //            qr."Total_Time_Taken" AS time
      //     FROM "QuizResults" qr
      //     JOIN "Students" s ON s."Student_ID"=qr."Student_ID"
      //     WHERE qr."ActivitySession_ID"=$1
      //     ORDER BY score DESC, time ASC
      //     LIMIT 5
      //   `, [activitySessionId]);
      // } else {
      //   rankingRes = await db.query(`
      //     SELECT ta."Team_Name" AS name,
      //            SUM(qr."Total_Score") AS score,
      //            SUM(qr."Total_Time_Taken") AS time
      //     FROM "QuizResults" qr
      //     JOIN "TeamMembers" tm ON tm."Student_ID"=qr."Student_ID"
      //     JOIN "TeamAssignments" ta ON ta."Team_ID"=tm."Team_ID"
      //     WHERE qr."ActivitySession_ID"=$1
      //     GROUP BY ta."Team_Name"
      //     ORDER BY score DESC, time ASC
      //     LIMIT 5
      //   `, [activitySessionId]);
      // }

      socket.emit("submit_answer_success", {
        questionId,
        studentId,
      });

      io.emit("quiz_progress_updated", {
        activitySessionId
      });

      socket.emit("check_quiz_finished", {
        activitySessionId
      });

      // rankingSnapshot[activitySessionId] = rankingRes.rows;

      // io.to(`activity_${activitySessionId}`).emit("question_ranking", rankingRes.rows);

      await db.query("COMMIT");

    } catch (err) {

      console.error("❌ submit_answer error:", err.message);
      socket.emit("submit_answer_error", {
        message: err.message,
      });


      await db.query("ROLLBACK");
      console.error("❌ submit_answer error:", err.message);
    } finally {
      submitLocks.delete(lockKey);
    }
  });



  socket.on("check_answer_status", async ({
    activitySessionId,
    questionId,
    studentId,
    questionType
  }) => {

    try {

      // 1️⃣ ดึงคำตอบที่เคยตอบ
      const answerRes = await db.query(`
        SELECT *
        FROM "QuizAnswers"
        WHERE "ActivitySession_ID" = $1
          AND "Question_ID" = $2
          AND "Student_ID" = $3
      `, [activitySessionId, questionId, studentId]);

      if (answerRes.rowCount === 0) {
        return socket.emit("answer_status", {
          alreadyAnswered: false,
          questionId
        });
      }

      const timeSpent = answerRes.rows[0]?.Time_Spent ?? 0;

      // 2️⃣ ดึงเวลาที่กำหนดไว้
      const assignedRes = await db.query(`
        SELECT "Question_Time"
        FROM "AssignedQuiz"
        WHERE "ActivitySession_ID" = $1
      `, [activitySessionId]);

      const maxTime =
        assignedRes.rows[0]?.Question_Time ?? timeSpent;

      let isCorrect = false;
      let scoreForThis = 0;

      /* =====================================================
        🔹 SINGLE / MULTIPLE
      ===================================================== */
      if (questionType === "single" || questionType === "multiple") {

        const correctRes = await db.query(`
          SELECT "Option_ID"
          FROM "Question_Correct_Options"
          WHERE "Question_ID" = $1
        `, [questionId]);

        const correctOptionIds =
          correctRes.rows.map(r => Number(r.Option_ID));

        const selectedIds =
          answerRes.rows.map(r => Number(r.Choice_ID));

        if (questionType === "single") {

          isCorrect =
            selectedIds.length === 1 &&
            selectedIds[0] === correctOptionIds[0];

          scoreForThis = calculateSingleScore({
            isCorrect,
            timeSpent,
            maxTime,
          });

        } else {

          const correctCount =
            selectedIds.filter(id =>
              correctOptionIds.includes(id)
            ).length;

          isCorrect =
            selectedIds.length === correctOptionIds.length &&
            correctCount === correctOptionIds.length;

          scoreForThis = calculateMultipleScore({
            correctCount,
            wrongCount: selectedIds.length - correctCount,
            maxTime,
            timeSpent,
          });
        }
      }

      /* =====================================================
        🔹 ORDERING
      ===================================================== */
      else if (questionType === "ordering") {

        const correctRes = await db.query(`
          SELECT "Option_ID"
          FROM "QuestionOptions"
          WHERE "Question_ID" = $1
          ORDER BY "Option_ID" ASC
        `, [questionId]);

        const correctOrder =
          correctRes.rows.map(r => Number(r.Option_ID));

        const studentOrder =
          answerRes.rows
            .sort((a,b)=>a.Answer_Order-b.Answer_Order)
            .map(r => Number(r.Choice_ID));

        isCorrect =
          studentOrder.length === correctOrder.length &&
          studentOrder.every((id,i)=>id===correctOrder[i]);

        scoreForThis = calculateOrderingScore({
          correctOrder,
          studentOrder,
          maxTime,
          timeSpent,
        });
      }

      // 3️⃣ ดึงคะแนนรวม
      const totalRes = await db.query(`
        SELECT "Total_Score","Total_Time_Taken"
        FROM "QuizResults"
        WHERE "ActivitySession_ID" = $1
          AND "Student_ID" = $2
      `, [activitySessionId, studentId]);

      const totalScore =
        totalRes.rows[0]?.Total_Score ?? 0;

      // 4️⃣ ดึง rank
      const myRankRes = await db.query(`
        SELECT rank FROM (
          SELECT
            s."Student_ID" AS student_id,
            RANK() OVER (
              ORDER BY qr."Total_Score" DESC,
                      qr."Total_Time_Taken" ASC
            ) AS rank
          FROM "QuizResults" qr
          JOIN "Students" s
            ON s."Student_ID" = qr."Student_ID"
          WHERE qr."ActivitySession_ID" = $1
        ) ranked
        WHERE ranked.student_id = $2
      `, [activitySessionId, studentId]);

      const rank =
        myRankRes.rows[0]?.rank ?? null;

      // 5️⃣ ส่งกลับ frontend
      socket.emit("answer_status", {
        alreadyAnswered: true,
        isCorrect,
        scoreForThis,
        totalScore,
        timeSpent,
        rank,
        questionId
      });

    } catch (err) {
      console.error("❌ check_answer_status error:", err.message);
    }

  });


  socket.on("get_quiz_progress", async ({ activitySessionId }) => {
    try {
      const res = await db.query(
        `
        SELECT
          s."Student_ID",
          s."Student_Name",
          COALESCE(qp."Current_Question", 0) AS current_question,
          COALESCE(qp."Total_Questions", 0) AS total_questions,
          ROUND(
            COALESCE(qp."Current_Question",0) * 100.0
            / NULLIF(qp."Total_Questions",0)
          ) AS percent
        FROM public."ActivityParticipants" ap
        JOIN "Students" s
          ON s."Student_ID" = ap."Student_ID"
        LEFT JOIN "QuizProgress" qp
          ON qp."Student_ID" = ap."Student_ID"
          AND qp."ActivitySession_ID" = ap."ActivitySession_ID"
        WHERE ap."ActivitySession_ID" = $1
          AND ap."Left_At" IS NULL
        ORDER BY s."Student_Name";
        `,
        [activitySessionId]
      );

      socket.emit("quiz_progress_data", res.rows);

    } catch (err) {
      console.error("❌ get_quiz_progress error:", err.message);
      socket.emit("quiz_progress_data", []);
    }
  });


  socket.on("check_quiz_finished", async ({ activitySessionId }) => {
    try {
      const res = await db.query(
        `
        SELECT
          COUNT(*) FILTER (
            WHERE "Current_Question" >= "Total_Questions"
          ) AS finished,
          COUNT(*) AS total
        FROM "QuizProgress"
        WHERE "ActivitySession_ID" = $1
        `,
        [activitySessionId]
      );

      const { finished, total } = res.rows[0];

      socket.emit("quiz_finished_status", {
        finished: Number(finished),
        total: Number(total),
        isFinished: Number(finished) === Number(total) && total > 0
      });

      // 🔥 ถ้าจบแล้ว → broadcast ให้ครูทุกคน
      if (Number(finished) === Number(total) && total > 0) {
        socket.broadcast.emit("quiz_auto_finished", {
          activitySessionId
        });
      }

    } catch (err) {
      console.error("❌ check_quiz_finished error:", err.message);
    }
  });

  socket.on("calculate_ranking", async ({ activitySessionId }) => {
    try {

      // 🔹 1. เช็คว่า activity นี้เป็น mode อะไร
      const modeRes = await db.query(`
        SELECT "Mode"
        FROM "AssignedQuiz"
        WHERE "ActivitySession_ID" = $1
      `, [activitySessionId]);

      const mode = modeRes.rows[0]?.Mode || "individual";

      let result;

      // 🔹 2. ถ้าเป็น individual
      if (mode === "individual") {

        result = await db.query(`
          SELECT
            s."Student_ID",
            s."Student_Name" AS name,
            qr."Total_Score" AS score,
            qr."Total_Time_Taken" AS time,
            RANK() OVER (
              ORDER BY qr."Total_Score" DESC,
                      qr."Total_Time_Taken" ASC
            ) AS rank
          FROM "QuizResults" qr
          JOIN "Students" s
            ON s."Student_ID" = qr."Student_ID"
          WHERE qr."ActivitySession_ID" = $1
          ORDER BY
            qr."Total_Score" DESC,
            qr."Total_Time_Taken" ASC,
            s."Student_ID" ASC;
        `, [activitySessionId]);

      } 
      // 🔹 3. ถ้าเป็น team
      else {

        result = await db.query(`
          SELECT
          ta."Team_ID",
          ta."Team_Name" AS name,
          SUM(qr."Total_Score") AS score,
          SUM(qr."Total_Time_Taken") AS time,
          RANK() OVER (
            ORDER BY SUM(qr."Total_Score") DESC,
                    SUM(qr."Total_Time_Taken") ASC
          ) AS rank
        FROM "QuizResults" qr

        JOIN "TeamAssignments" ta
          ON ta."ActivitySession_ID" = qr."ActivitySession_ID"

        JOIN "TeamMembers" tm
          ON tm."Team_ID" = ta."Team_ID"
          AND tm."Student_ID" = qr."Student_ID"

        WHERE qr."ActivitySession_ID" = $1

        GROUP BY ta."Team_ID", ta."Team_Name"

        ORDER BY
          score DESC,
          time ASC,
          ta."Team_ID" ASC;
        `, [activitySessionId]);

      }

      const rows = result.rows;

      // 🔹 4. เก็บ snapshot ไว้ใช้กับ request_my_rank
      rankingSnapshot[activitySessionId] = rows;

      // 🔹 5. เอา top 5 ไปโชว์
      const top5 = rows.slice(0, 5);

      io.to(`activity_${activitySessionId}`)
        .emit("question_ranking", top5);

      // 🔹 6. สั่งให้ไปหน้า ranking
      io.to(`activity_${activitySessionId}`)
        .emit("go_to_ranking");

    } catch (err) {
      console.error("❌ calculate_ranking error:", err.message);
    }
  });


  // socket.on("request_my_rank", async ({ activitySessionId, studentId }) => {
  //   try {

  //     const snapshot = rankingSnapshot[activitySessionId];

  //     if (!snapshot) {
  //       return socket.emit("my_rank_update", {
  //         studentId,
  //         rank: null
  //       });
  //     }

  //     // 🔹 เช็ค mode ก่อน
  //     const modeRes = await db.query(`
  //       SELECT "Mode"
  //       FROM "AssignedQuiz"
  //       WHERE "ActivitySession_ID" = $1
  //     `, [activitySessionId]);

  //     const mode = modeRes.rows[0]?.Mode || "individual";

  //     // let myRank = null;

  //     if (mode === "individual") {

  //       const myData = snapshot.find(
  //         r => Number(r.Student_ID) === Number(studentId)
  //       );

  //       myRank = myData?.rank ?? null;
        

  //     } else {
  //       // 🔥 ถ้าเป็น team ต้องหาทีมก่อน

  //       const teamRes = await db.query(`
  //         SELECT ta."Team_ID"
  //         FROM "TeamAssignments" ta
  //         JOIN "TeamMembers" tm
  //           ON tm."Team_ID" = ta."Team_ID"
  //         WHERE ta."ActivitySession_ID" = $2
  //         AND tm."Student_ID" = $1
  //         LIMIT 1
  //       `, [studentId, activitySessionId]);

  //       const teamId = teamRes.rows[0]?.Team_ID;

  //       if (teamId) {
  //         const myTeamData = snapshot.find(
  //           r => Number(r.Team_ID) === Number(teamId)
  //         );

  //         const teamRank = myTeamData?.rank ?? null;
  //         const teamScore = myTeamData?.score ?? 0;
  //         const teamName = myTeamData?.name ?? null;

  //       }
  //     }

  //     socket.emit("my_rank_update", {
  //       studentId,
  //       teamRank: myRank,
  //       teamScore,
  //       teamName
  //     });

  //   } catch (err) {
  //     console.error("❌ request_my_rank error:", err.message);
  //   }
  // });

  socket.on("request_my_rank", async ({ activitySessionId, studentId }) => {
    try {

      const snapshot = rankingSnapshot[activitySessionId];

      if (!snapshot) {
        return socket.emit("my_rank_update", {
          studentId,
          rank: null
        });
      }

      const modeRes = await db.query(`
        SELECT "Mode"
        FROM "AssignedQuiz"
        WHERE "ActivitySession_ID" = $1
      `, [activitySessionId]);

      const mode = modeRes.rows[0]?.Mode || "individual";

      /* ================= INDIVIDUAL ================= */

      if (mode === "individual") {

        const myData = snapshot.find(
          r => Number(r.Student_ID) === Number(studentId)
        );

        const myRank = myData?.rank ?? null;

        socket.emit("my_rank_update", {
          studentId,
          rank: myRank
        });

      }

      /* ================= TEAM ================= */

      else {

        const teamRes = await db.query(`
          SELECT ta."Team_ID"
          FROM "TeamAssignments" ta
          JOIN "TeamMembers" tm
            ON tm."Team_ID" = ta."Team_ID"
          WHERE ta."ActivitySession_ID" = $2
            AND tm."Student_ID" = $1
          LIMIT 1
        `, [studentId, activitySessionId]);

        const teamId = teamRes.rows[0]?.Team_ID;

        if (!teamId) {
          return socket.emit("my_rank_update", {
            studentId,
            teamRank: null
          });
        }

        const myTeamData = snapshot.find(
          r => Number(r.Team_ID) === Number(teamId)
        );

        const teamRank = myTeamData?.rank ?? null;
        const teamScore = myTeamData?.score ?? 0;
        const teamName = myTeamData?.name ?? null;

        socket.emit("my_rank_update", {
          studentId,
          teamRank,
          teamScore,
          teamName
        });
      }

    } catch (err) {
      console.error("❌ request_my_rank error:", err.message);
    }
  });

  socket.on("end_activity_and_kick_students", ({ activitySessionId, joinCode }) => {

    delete rankingSnapshot[activitySessionId]; // 🔥 สำคัญมาก

    // สั่งนักเรียนทุกคนออกจาก activity room
    io.to(`activity_${activitySessionId}`)
      .emit("force_back_to_lobby");

  });

};