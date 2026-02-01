// routes/quizAnalysis.js
const db = require("../db");

module.exports = (socket) => {
  socket.on("get_question_analysis", async ({ activitySessionId, questionId }) => {
    const result = await db.query(`
      SELECT
        qa."Choice_ID",
        COUNT(*) AS count,
        AVG(qa."Time_Spent") AS avg_time
      FROM "QuizAnswers" qa
      WHERE qa."ActivitySession_ID" = $1
        AND qa."Question_ID" = $2
      GROUP BY qa."Choice_ID"
    `, [activitySessionId, questionId]);

    socket.emit("question_analysis_data", result.rows);
  });
};