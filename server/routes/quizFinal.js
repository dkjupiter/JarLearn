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
          AND ta."ActivitySession_ID" = $1
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

  // socket.on("get_final_result", async ({ activitySessionId, studentId }) => {
  //   try {
  //     // 🔥 ดึงคะแนนรวม
  //     const resultRes = await db.query(`
  //       SELECT 
  //         s."Student_Name" AS name,
  //         qr."Total_Score" AS score,
  //         qr."Total_Time_Taken" AS time
  //       FROM "QuizResults" qr
  //       JOIN "Students" s
  //         ON s."Student_ID" = qr."Student_ID"
  //       WHERE qr."ActivitySession_ID" = $1
  //         AND qr."Student_ID" = $2
  //     `, [activitySessionId, studentId]);

  //     if (!resultRes.rows.length) return;

  //     const { name, score, time } = resultRes.rows[0];

  //     // 🔥 หาอันดับ
  //     const rankRes = await db.query(`
  //       SELECT COUNT(*) + 1 AS rank
  //       FROM "QuizResults"
  //       WHERE "ActivitySession_ID" = $1
  //         AND (
  //           "Total_Score" > $2
  //           OR (
  //             "Total_Score" = $2
  //             AND "Total_Time_Taken" < $3
  //           )
  //         )
  //     `, [activitySessionId, score, time]);

  //     const rank = Number(rankRes.rows[0].rank);

  //     socket.emit("final_result", {
  //       name,
  //       score,
  //       rank,
  //     });

  //   } catch (err) {
  //     console.error("❌ get_final_result error:", err.message);
  //   }
  // });



  socket.on("get_final_result", async ({ activitySessionId, studentId }) => {
    try {

      // 🔎 เช็ค mode
      const modeRes = await db.query(`
        SELECT "Mode"
        FROM "AssignedQuiz"
        WHERE "ActivitySession_ID" = $1
      `, [activitySessionId]);

      const mode = modeRes.rows[0]?.Mode || "individual";

      /* ===============================
        👤 INDIVIDUAL MODE
      =============================== */

      if (mode === "individual") {

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
          mode,
          name,
          score,
          rank
        });

      }

      /* ===============================
        👥 TEAM MODE
      =============================== */

      else {

        // 🔹 ดึงคะแนนของตัวเอง
        const playerRes = await db.query(`
          SELECT 
            s."Student_Name" AS name,
            qr."Total_Score" AS score
          FROM "QuizResults" qr
          JOIN "Students" s
            ON s."Student_ID" = qr."Student_ID"
          WHERE qr."ActivitySession_ID" = $1
            AND qr."Student_ID" = $2
        `, [activitySessionId, studentId]);

        if (!playerRes.rows.length) return;

        const { name, score } = playerRes.rows[0];

        // 🔹 หาทีมของ student
        const teamRes = await db.query(`
          SELECT ta."Team_ID", ta."Team_Name"
          FROM "TeamAssignments" ta
          JOIN "TeamMembers" tm
            ON tm."Team_ID" = ta."Team_ID"
          WHERE ta."ActivitySession_ID" = $1
            AND tm."Student_ID" = $2
          LIMIT 1
        `, [activitySessionId, studentId]);

        if (!teamRes.rows.length) return;

        const { Team_ID, Team_Name } = teamRes.rows[0];

        // 🔹 คำนวณคะแนนทีม
        const teamScoreRes = await db.query(`
          SELECT 
            SUM(qr."Total_Score") AS team_score,
            SUM(qr."Total_Time_Taken") AS team_time
          FROM "QuizResults" qr
          JOIN "TeamMembers" tm
            ON tm."Student_ID" = qr."Student_ID"
          WHERE qr."ActivitySession_ID" = $1
            AND tm."Team_ID" = $2
        `, [activitySessionId, Team_ID]);

        const teamScore = Number(teamScoreRes.rows[0].team_score || 0);
        const teamTime = Number(teamScoreRes.rows[0].team_time || 0);

        // 🔹 หาอันดับทีม
        const teamRankRes = await db.query(`
          SELECT COUNT(*) + 1 AS rank
          FROM (
            SELECT 
              ta."Team_ID",
              SUM(qr."Total_Score") AS score,
              SUM(qr."Total_Time_Taken") AS time
            FROM "QuizResults" qr
            JOIN "TeamMembers" tm
              ON tm."Student_ID" = qr."Student_ID"
            JOIN "TeamAssignments" ta
              ON ta."Team_ID" = tm."Team_ID"
              AND ta."ActivitySession_ID" = $1
            WHERE qr."ActivitySession_ID" = $1
            GROUP BY ta."Team_ID"
          ) t
          WHERE 
            t.score > $2
            OR (
              t.score = $2
              AND t.time < $3
            )
        `, [activitySessionId, teamScore, teamTime]);

        const teamRank = Number(teamRankRes.rows[0].rank);

        socket.emit("final_result", {
          mode,
          name,
          score,
          teamName: Team_Name,
          teamScore,
          teamRank
        });

      }

    } catch (err) {
      console.error("❌ get_final_result error:", err.message);
    }
  });
};
