const db = require("../db");

module.exports = (socket) => {
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

      socket.emit("submit_answer_success", {
        questionId,
        studentId,
      });

      // 🔔 เผื่อครูอยากรู้ว่ามีคนตอบแล้ว
      socket.broadcast.emit("student_answered", {
        questionId,
      });

    } catch (err) {
      console.error("❌ submit_answer error:", err.message);
      socket.emit("submit_answer_error", {
        message: err.message,
      });
    }
  });
};
