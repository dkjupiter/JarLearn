const db = require("../db");

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
      choiceIds,
      timeSpent,
      currentQuestionIndex,
      totalQuestions
    } = payload;

    try {
      // 🔐 basic guard
      if (!activitySessionId || !questionId || !studentId) {
        throw new Error("Missing required fields");
      }

      // 🧹 กันส่งซ้ำ (optional แต่แนะนำ)
      await db.query(
        `
        DELETE FROM "QuizAnswers"
        WHERE "ActivitySession_ID" = $1
          AND "Question_ID" = $2
          AND "Student_ID" = $3
        `,
        [activitySessionId, questionId, studentId]
      );

      const correctRes = await db.query(
        `SELECT "Option_ID"
        FROM "Question_Correct_Options"
        WHERE "Question_ID" = $1`,
        [questionId]
      );

      const correctOptionIds = correctRes.rows.map(r => Number(r.Option_ID));
      const selectedIds = choiceIds.map(Number);

      let isCorrect = false;

      if (selectedIds.length === 0) {
        isCorrect = false; // ไม่ตอบ = ผิด
      }
      else if (correctOptionIds.length === 1) {
        // ✅ single choice
        isCorrect = selectedIds[0] === correctOptionIds[0];
      }
      else {
        // ✅ multiple choice
        isCorrect =
          selectedIds.length === correctOptionIds.length &&
          selectedIds.every(id => correctOptionIds.includes(id));
      }

      // 🔁 ส่งผลกลับไปที่นักเรียน
      socket.emit("answer_result", {
        questionId,
        isCorrect,
        correctOptionIds,
      });

      // ✅ insert 1 row ต่อ 1 choice
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

      // หลัง insert QuizAnswers เสร็จ
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
          payload.currentQuestionIndex ?? 1,   // 👈 client ส่งมา
          payload.totalQuestions ?? 1
        ]
      );


      socket.emit("submit_answer_success", {
        questionId,
        studentId,
      });

      // 🔔 เผื่อครูอยากรู้ว่ามีคนตอบแล้ว
      // socket.broadcast.emit("student_answered", {
      //   questionId,
      // });
      // 🔔 broadcast progress to teacher
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
      FROM "Students" s
      LEFT JOIN "QuizProgress" qp
        ON qp."Student_ID" = s."Student_ID"
       AND qp."ActivitySession_ID" = $1
      ORDER BY s."Student_Name"
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

};
