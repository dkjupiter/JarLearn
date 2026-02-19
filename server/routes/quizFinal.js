const db = require("../db");

module.exports = (io, socket) => {
  socket.on("get_final_ranking", async ({ activitySessionId }) => {
    try {

      // 🔎 1️⃣ เช็คว่า session นี้เป็น team หรือ individual
      const modeRes = await db.query(`
        SELECT "Mode"
        FROM "AssignedQuiz"
        WHERE "ActivitySession_ID" = $1
      `, [activitySessionId]);

      const mode = modeRes.rows[0]?.Mode || "individual";

      let result;

      // ==============================
      // 🧑‍🎓 INDIVIDUAL MODE
      // ==============================
      if (mode === "individual") {
        result = await db.query(`
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
        `, [activitySessionId]);
      }

      // ==============================
      // 👥 TEAM MODE
      // ==============================
      else {
        result = await db.query(`
          SELECT
            ta."Team_Name" AS name,
            SUM(qr."Total_Score") AS total_score,
            SUM(qr."Total_Time_Taken") AS total_time
          FROM "QuizResults" qr
          JOIN "TeamMembers" tm
            ON tm."Student_ID" = qr."Student_ID"
          JOIN "TeamAssignments" ta
            ON ta."Team_ID" = tm."Team_ID"
          WHERE qr."ActivitySession_ID" = $1
          GROUP BY ta."Team_Name"
          ORDER BY total_score DESC, total_time ASC
          LIMIT 5
        `, [activitySessionId]);
      }

      io.to(`activity_${activitySessionId}`)
        .emit("final_ranking_data", result.rows);

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
