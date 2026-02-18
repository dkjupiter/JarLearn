const db = require("../db");

module.exports = (io, socket) => {
  socket.on("get_final_ranking", async ({ activitySessionId }) => {
    try {
      const res = await db.query(
        `
        SELECT
          s."Student_Name" AS name,
          qr."Total_Score" AS total_score,
          qr."Total_Time_Taken" AS total_time
        FROM "QuizResults" qr
        JOIN "Students" s
          ON s."Student_ID" = qr."Student_ID"
        WHERE qr."ActivitySession_ID" = $1
        ORDER BY total_score DESC, total_time ASC
        LIMIT 5
        `,
        [activitySessionId]
      );

      io.to(`activity_${activitySessionId}`).emit("final_ranking_data", res.rows);
      console.log("🏁 quiz finished broadcast");

    } catch (err) {
      console.error("❌ get_final_ranking error:", err.message);
      socket.emit("final_ranking_data", []);
    }
  });

  socket.on("finish_quiz_session", async ({ activitySessionId }) => {
    try {
      await db.query(`
      UPDATE "ActivitySessions"
      SET "Status" = 'finished',
          "Ended_At" = NOW()
      WHERE "ActivitySession_ID" = $1
    `, [activitySessionId]);

      socket.emit("quiz_session_finished_success");

    } catch (err) {
      console.error("❌ finish_quiz_session error:", err.message);
    }
  });

};
