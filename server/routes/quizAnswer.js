// const db = require("../db");

// module.exports = (io, socket) => {
//   console.log("📝 QuizAnswer socket ready:", socket.id);

//   /**
//    * payload:
//    * {
//    *   activitySessionId,
//    *   quizId,
//    *   questionId,
//    *   studentId,
//    *   choiceIds: [1,2,3],
//    *   timeSpent: 8
//    * }
//    */
//   socket.on("submit_answer", async (payload) => {
//     const {
//       activitySessionId,
//       quizId,
//       questionId,
//       studentId,
//       choiceIds,
//       timeSpent,
//       currentQuestionIndex,
//       totalQuestions
//     } = payload;

//     try {
//       // 🔐 basic guard
//       if (!activitySessionId || !questionId || !studentId) {
//         throw new Error("Missing required fields");
//       }

//       // 🧹 กันส่งซ้ำ (optional แต่แนะนำ)
//       await db.query(
//         `
//         DELETE FROM "QuizAnswers"
//         WHERE "ActivitySession_ID" = $1
//           AND "Question_ID" = $2
//           AND "Student_ID" = $3
//         `,
//         [activitySessionId, questionId, studentId]
//       );

//       const correctRes = await db.query(
//         `SELECT "Option_ID"
//         FROM "Question_Correct_Options"
//         WHERE "Question_ID" = $1`,
//         [questionId]
//       );

//       const correctOptionIds = correctRes.rows.map(r => Number(r.Option_ID));
//       const selectedIds = choiceIds.map(Number);

//       let isCorrect = false;

//       if (selectedIds.length === 0) {
//         isCorrect = false; // ไม่ตอบ = ผิด
//       }
//       else if (correctOptionIds.length === 1) {
//         // ✅ single choice
//         isCorrect = selectedIds[0] === correctOptionIds[0];
//       }
//       else {
//         // ✅ multiple choice
//         isCorrect =
//           selectedIds.length === correctOptionIds.length &&
//           selectedIds.every(id => correctOptionIds.includes(id));
//       }

//       // 🔁 ส่งผลกลับไปที่นักเรียน
//       socket.emit("answer_result", {
//         questionId,
//         isCorrect,
//         correctOptionIds,
//       });

//       // ✅ insert 1 row ต่อ 1 choice
//       for (const choiceId of choiceIds) {
//         await db.query(
//           `
//           INSERT INTO "QuizAnswers"
//                 (
//                 "ActivitySession_ID",
//                 "Quiz_ID",
//                 "Question_ID",
//                 "Student_ID",
//                 "Choice_ID",
//                 "Answered_At",
//                 "Time_Spent"
//                 )
//                 VALUES ($1,$2,$3,$4,$5,NOW(),$6)
//           `,
//           [
//             activitySessionId,
//             quizId,
//             questionId,
//             studentId,
//             choiceId,
//             timeSpent
//           ]
//         );
//       }

//       // หลัง insert QuizAnswers เสร็จ
//       await db.query(
//         `
//   INSERT INTO "QuizProgress"
//     ("ActivitySession_ID","Student_ID","Current_Question","Total_Questions","Updated_At")
//   VALUES ($1,$2,$3,$4,NOW())
//   ON CONFLICT ("ActivitySession_ID","Student_ID")
//   DO UPDATE SET
//     "Current_Question" = GREATEST(
//       "QuizProgress"."Current_Question",
//       EXCLUDED."Current_Question"
//     ),
//     "Updated_At" = NOW()
//   `,
//         [
//           activitySessionId,
//           studentId,
//           payload.currentQuestionIndex ?? 1,   // 👈 client ส่งมา
//           payload.totalQuestions ?? 1
//         ]
//       );


//       socket.emit("submit_answer_success", {
//         questionId,
//         studentId,
//       });

//       // 🔔 เผื่อครูอยากรู้ว่ามีคนตอบแล้ว
//       // socket.broadcast.emit("student_answered", {
//       //   questionId,
//       // });
//       // 🔔 broadcast progress to teacher
//       io.emit("quiz_progress_updated", {
//         activitySessionId
//       });

//       socket.emit("check_quiz_finished", {
//         activitySessionId
//       });

//     } catch (err) {
//       console.error("❌ submit_answer error:", err.message);
//       socket.emit("submit_answer_error", {
//         message: err.message,
//       });
//     }
//   });

//   socket.on("get_quiz_progress", async ({ activitySessionId }) => {
//     try {
//       const res = await db.query(
//         `
//       SELECT
//   s."Student_ID",
//   s."Student_Name",
//   COALESCE(qp."Current_Question", 0) AS current_question,
//   COALESCE(qp."Total_Questions", 0) AS total_questions,
//   ROUND(
//     COALESCE(qp."Current_Question",0) * 100.0
//     / NULLIF(qp."Total_Questions",0)
//   ) AS percent
// FROM public."ActivityParticipants" ap
// JOIN "Students" s
//   ON s."Student_ID" = ap."Student_ID"
// LEFT JOIN "QuizProgress" qp
//   ON qp."Student_ID" = ap."Student_ID"
//  AND qp."ActivitySession_ID" = ap."ActivitySession_ID"
// WHERE ap."ActivitySession_ID" = $1
//   AND ap."Left_At" IS NULL   -- เฉพาะคนที่ยังอยู่ในกิจกรรม
// ORDER BY s."Student_Name";

//       `,
//         [activitySessionId]
//       );

//       socket.emit("quiz_progress_data", res.rows);
//     } catch (err) {
//       console.error("❌ get_quiz_progress error:", err.message);
//       socket.emit("quiz_progress_data", []);
//     }
//   });

//   socket.on("check_quiz_finished", async ({ activitySessionId }) => {
//     try {
//       const res = await db.query(
//         `
//         SELECT
//           COUNT(*) FILTER (
//             WHERE "Current_Question" >= "Total_Questions"
//           ) AS finished,
//           COUNT(*) AS total
//         FROM "QuizProgress"
//         WHERE "ActivitySession_ID" = $1
//         `,
//         [activitySessionId]
//       );

//       const { finished, total } = res.rows[0];

//       socket.emit("quiz_finished_status", {
//         finished: Number(finished),
//         total: Number(total),
//         isFinished: Number(finished) === Number(total) && total > 0
//       });

//       // 🔥 ถ้าจบแล้ว → broadcast ให้ครูทุกคน
//       if (Number(finished) === Number(total) && total > 0) {
//         socket.broadcast.emit("quiz_auto_finished", {
//           activitySessionId
//         });
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


module.exports = (io, socket) => {
  console.log("📝 QuizAnswer socket ready:", socket.id);

  /**
   * payload:
   * {
   *   activitySessionId,
   *   quizId,
   *   questionId,
   *   studentId,
   *   choiceIds: [1,2,3],
   *   timeSpent: 8
   * }
   */
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

    try {
      if (!activitySessionId || !questionId || !studentId) {
        throw new Error("Missing required fields");
      }

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

      /* =====================================================
        🔥 ORDERING (เพิ่มตรงนี้อย่างเดียว)
      ===================================================== */

      let isCorrect = false;


      if (questionType === "ordering") {
        console.log("⏱ submit timeSpent =", timeSpent);

        isCorrect =
          studentOrder.length === correctOrder.length &&
          studentOrder.every((id, i) => id === correctOrder[i]);

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
              "Is_Correct",
              "Answer_Order",
              "Answered_At",
              "Time_Spent"
            )
            VALUES ($1,$2,$3,$4,$5,$6,$7,NOW(),$8)
            `,
            [
              activitySessionId,
              quizId,
              questionId,
              studentId,
              ans.optionId,
              isCorrect,
              ans.order,
              timeSpent
            ]
          );
        }
        const studentOrder = choiceIds
          .sort((a, b) => a.order - b.order)
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

        console.log("🎯 isCorrect =", isCorrect);

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
              "Is_Correct",
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
              choiceId,
              isCorrect,
              timeSpent
            ]
          );
        }
      }

      /* =====================================================
        PROGRESS (ของเดิมเป๊ะ)
      ===================================================== */

      await db.query(
        `
        INSERT INTO "QuizProgress"
          ("ActivitySession_ID","Student_ID","Current_Question","Total_Questions","Updated_At")
        VALUES ($1,$2,$3,$4,NOW())
        ON CONFLICT ("ActivitySession_ID","Student_ID")
        DO UPDATE SET
          "Current_Question" = GREATEST(
            "QuizProgress"."Current_Question",
            EXCLUDED."Current_Question"
          ),
          "Updated_At" = NOW()
        `,
        [
          activitySessionId,
          studentId,
          currentQuestionIndex ?? 1,
          totalQuestions ?? 1
        ]
      );

      //-------------------------------------------------------------------------------------------------------------------
      /* =====================================================
        🔥 CALCULATE SCORE IMMEDIATELY
      ===================================================== */

      let score = 0;

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
            .sort((a, b) => a.order - b.order)
            .map(a => Number(a.optionId));

        score = calculateOrderingScore({
          correctOrder,
          studentOrder,
          maxTime,
          timeSpent,
        });
      }


      /* 🔥 update QuizResults (คะแนนสะสม) */
      const isCorrectInt = isCorrect ? 1 : 0;


      await db.query(
        `
  INSERT INTO "QuizResults"
  (
    "Quiz_ID",
    "Student_ID",
    "ActivitySession_ID",
    "Total_Score",
    "Total_Time_Taken",
    "Total_Question",
    "Total_Correct",
    "Total_Incorrct"
  )
  VALUES ($1,$2,$3,$4,$5,1,$6,$7)
  ON CONFLICT ("Quiz_ID","Student_ID","ActivitySession_ID")
  DO UPDATE SET
    "Total_Score" =
      "QuizResults"."Total_Score" + EXCLUDED."Total_Score",

    "Total_Time_Taken" =
      "QuizResults"."Total_Time_Taken" + EXCLUDED."Total_Time_Taken",

    "Total_Question" =
      "QuizResults"."Total_Question" + 1,

    "Total_Correct" =
      "QuizResults"."Total_Correct" + $6,

    "Total_Incorrct" =
      "QuizResults"."Total_Incorrct" + $7
  `,
        [
          quizId,
          studentId,
          activitySessionId,
          score,
          timeSpent,
          isCorrectInt,              // $6
          isCorrectInt ? 0 : 1       // $7
        ]
      );

      // 🔥 ส่ง ranking ใหม่ทันที
      //   const rankingRes = await db.query(`
      //   SELECT
      //     s."Student_Name" AS name,
      //     qr."Total_Score" AS score,
      //     qr."Total_Time_Taken" AS time
      //   FROM "QuizResults" qr
      //   JOIN "Students" s
      //     ON s."Student_ID" = qr."Student_ID"
      //   WHERE qr."ActivitySession_ID" = $1
      //   ORDER BY score DESC, time ASC
      //   LIMIT 5
      // `, [activitySessionId]);

      // 🔎 เช็ค mode
      const modeRes = await db.query(`
  SELECT "Mode"
  FROM "AssignedQuiz"
  WHERE "ActivitySession_ID" = $1
`, [activitySessionId]);

      const mode = modeRes.rows[0]?.Mode || "individual";

      let rankingRes;

      // ================= INDIVIDUAL =================
      if (mode === "individual") {
        rankingRes = await db.query(`
    SELECT
      s."Student_Name" AS name,
      qr."Total_Score" AS score,
      qr."Total_Time_Taken" AS time
    FROM "QuizResults" qr
    JOIN "Students" s
      ON s."Student_ID" = qr."Student_ID"
    WHERE qr."ActivitySession_ID" = $1
    ORDER BY score DESC, time ASC
    LIMIT 5
  `, [activitySessionId]);
      }

      // ================= TEAM =================
      else {
        rankingRes = await db.query(`
    SELECT
      ta."Team_Name" AS name,
      SUM(qr."Total_Score") AS score,
      SUM(qr."Total_Time_Taken") AS time
    FROM "QuizResults" qr
    JOIN "TeamMembers" tm
      ON tm."Student_ID" = qr."Student_ID"
    JOIN "TeamAssignments" ta
      ON ta."Team_ID" = tm."Team_ID"
    WHERE qr."ActivitySession_ID" = $1
    GROUP BY ta."Team_Name"
    ORDER BY score DESC, time ASC
    LIMIT 5
  `, [activitySessionId]);
      }


      /* 🔥 ดึงคะแนนรวม */
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

      const totalScore =
        totalRes.rows[0]?.Total_Score ?? 0;

      /* 🔥 emit กลับ room */
      io.to(`activity_${activitySessionId}`).emit(
        "student_result",
        {
          studentId,
          scoreForThis: score,
          totalScore,
        }
      );

      console.log("📤 student_result emitted:", {
        studentId,
        score,
        totalScore
      });

      io.to(`activity_${activitySessionId}`).emit(
        "question_ranking",
        rankingRes.rows
      );

      //-------------------------------------------------------------------------------------------------------------------

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

    } catch (err) {
      console.error("❌ submit_answer error:", err.message);
      socket.emit("submit_answer_error", {
        message: err.message,
      });
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
  AND ap."Left_At" IS NULL   -- เฉพาะคนที่ยังอยู่ในกิจกรรม
ORDER BY s."Student_Name";
`
        ,
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

};