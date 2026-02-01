// // routes/quizFinal.js
// const db = require("../db");

// module.exports = (socket) => {
//   socket.on("get_final_ranking", async ({ activitySessionId }) => {
//     const result = await db.query(`
//       SELECT
//         qa."Student_ID",
//         SUM(qa."Score") AS total_score,
//         SUM(qa."Time_Spent") AS total_time
//       FROM "QuizAnswers" qa
//       WHERE qa."ActivitySession_ID" = $1
//       GROUP BY qa."Student_ID"
//       ORDER BY total_score DESC, total_time ASC
//     `, [activitySessionId]);

//     socket.emit("final_ranking_data", result.rows);
//   });
// };

const db = require("../db");

module.exports = (socket) => {
  socket.on("get_final_ranking", async ({ activitySessionId }) => {
    try {
      const result = await db.query(
        `
        SELECT
          s."Student_Name" AS name,
          SUM(
            CASE WHEN qa."Is_Correct" THEN 100 ELSE 0 END
          ) AS score,
          MIN(qa."Answered_At") AS first_answer
        FROM "QuizAnswers" qa
        JOIN "Students" s
          ON s."Student_ID" = qa."Student_ID"
        WHERE qa."ActivitySession_ID" = $1
        GROUP BY s."Student_Name"
        ORDER BY score DESC, first_answer ASC
        `,
        [Number(activitySessionId)]
      );

      const finalRanking = result.rows.map(r => ({
        name: r.name,
        score: Number(r.score),
        time: 0, // mock time รวม (ค่อยทำต่อได้)
      }));

      socket.emit("final_ranking_data", finalRanking);

    } catch (err) {
      console.error("❌ get_final_ranking error:", err.message);
      socket.emit("final_ranking_data", []);
    }
  });
};
