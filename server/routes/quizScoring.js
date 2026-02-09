const db = require("../db");
const {
  calculateSingleScore,
  calculateMultipleScore,
  calculateOrderingScore,
} = require("../services/scoreCalculator");

module.exports = (socket) => {
  socket.on("calculate_ranking", async ({
    activitySessionId,
    quizId,
    questionId,
    questionType,
    maxTime,
  }) => {
    console.log("🔥 calculate_ranking called:", 
      activitySessionId,
    quizId,
    questionId,
    questionType,
    maxTime,);
    try {
      /* 1️⃣ correct answers */
      const correctRes = await db.query(
        `SELECT "Option_ID"
         FROM "Question_Correct_Options"
         WHERE "Question_ID" = $1`,
        [questionId]
      );
      const correctOptionIds = correctRes.rows.map(r => r.Option_ID);

      /* 2️⃣ student answers */
      const answerRes = await db.query(
        `
        SELECT qa.*, s."Student_Name"
        FROM "QuizAnswers" qa
        JOIN "Students" s
          ON s."Student_ID" = qa."Student_ID"
        WHERE qa."ActivitySession_ID" = $1
          AND qa."Question_ID" = $2
        `,
        [activitySessionId, questionId]
      );

      /* 3️⃣ group by student */
      const byStudent = {};
      for (const row of answerRes.rows) {
        if (!byStudent[row.Student_ID]) {
          byStudent[row.Student_ID] = {
            name: row.Student_Name,
            answers: [],
          };
        }
        byStudent[row.Student_ID].answers.push(row);
      }

      /* 4️⃣ calculate score per student + update QuizResults */
      for (const studentId in byStudent) {
        const { answers } = byStudent[studentId];
        let score = 0;

        const timeSpent =
          answers[0].Time_Spent ?? maxTime;

        if (questionType === "single") {
          score = calculateSingleScore({
            isCorrect: correctOptionIds.includes(answers[0].Choice_ID),
            timeSpent,
            maxTime,
          });
        }

        else if (questionType === "multiple") {
          const selectedIds = answers.map(a => a.Choice_ID);
          const correctCount = selectedIds.filter(id =>
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
          const studentOrder = answers
            .sort((a, b) => (a.Answer_Order ?? 0) - (b.Answer_Order ?? 0))
            .map(a => a.Choice_ID);

          score = calculateOrderingScore({
            correctOrder: correctOptionIds,
            studentOrder,
            maxTime,
            timeSpent,
          });
        }

        /* 🔥 update QuizResults (คะแนนสะสม) */
        await db.query(
          `
          INSERT INTO "QuizResults"
          ("Quiz_ID","Student_ID","ActivitySession_ID","Total_Score","Total_Time_Taken")
          VALUES ($1,$2,$3,$4,$5)
          ON CONFLICT ("Quiz_ID","Student_ID","ActivitySession_ID")
          DO UPDATE SET
            "Total_Score" = "QuizResults"."Total_Score" + EXCLUDED."Total_Score",
            "Total_Time_Taken" = "QuizResults"."Total_Time_Taken" + EXCLUDED."Total_Time_Taken";

          `,
          [quizId, studentId, activitySessionId, score, timeSpent]
        );
      }

      /* 5️⃣ emit Top 5 (Question Ranking) */
      const rankingRes = await db.query(
        `
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
        `,
        [activitySessionId]
      );

      socket.emit("question_ranking", rankingRes.rows);

    } catch (err) {
      console.error("❌ calculate_ranking error:", err.message);
      socket.emit("question_ranking", []);
    }
  });
};