const db = require("../db");

module.exports = (socket) => {
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

      socket.emit("final_ranking_data", res.rows);
    } catch (err) {
      console.error("❌ get_final_ranking error:", err.message);
      socket.emit("final_ranking_data", []);
    }
  });



  socket.on("get_final_result", async ({ activitySessionId, studentId }) => {
    try {
      // 🔥 ดึงคะแนนรวม
      const resultRes = await db.query(`
        SELECT 
          s."Student_Name" AS name,
          qr."Total_Score" AS score,
          qr."Total_Time_Taken" AS time
        FROM "QuizResults" qr
        JOIN "Students" s
          ON s."Student_ID" = qr."Student_ID"
        WHERE qr."ActivitySession_ID" = $1
          AND qr."Student_ID" = $2
      `, [activitySessionId, studentId]);

      if (!resultRes.rows.length) return;

      const { name, score, time } = resultRes.rows[0];

      // 🔥 หาอันดับ
      const rankRes = await db.query(`
        SELECT COUNT(*) + 1 AS rank
        FROM "QuizResults"
        WHERE "ActivitySession_ID" = $1
          AND (
            "Total_Score" > $2
            OR (
              "Total_Score" = $2
              AND "Total_Time_Taken" < $3
            )
          )
      `, [activitySessionId, score, time]);

      const rank = Number(rankRes.rows[0].rank);

      socket.emit("final_result", {
        name,
        score,
        rank,
      });

    } catch (err) {
      console.error("❌ get_final_result error:", err.message);
    }
  });

};
