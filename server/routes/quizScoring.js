// // const db = require("../db");
// // const { calculateScore } = require("../services/scoreCalculator");

// // module.exports = (socket) => {
// //   socket.on("calculate_ranking", async ({ activitySessionId, questionId }) => {
// //     const result = await db.query(`
// //       SELECT
// //         "Student_ID",
// //         MIN("Answered_At") AS answered_at
// //       FROM "QuizAnswers"
// //       WHERE "ActivitySession_ID" = $1
// //         AND "Question_ID" = $2
// //       GROUP BY "Student_ID"
// //     `, [activitySessionId, questionId]);

// //     const ranking = result.rows
// //       .sort((a, b) => new Date(a.answered_at) - new Date(b.answered_at))
// //       .slice(0, 5)
// //       .map((r, index) => ({
// //         rank: index + 1,
// //         studentId: r.Student_ID,
// //         score: 100 - index * 10
// //       }));

// //     socket.emit("question_ranking", ranking);
// //   });
// // };

// const db = require("../db");
// const {
//   calculateSingleScore,
//   calculateMultipleScore,
//   calculateOrderingScore,
// } = require("../services/scoreCalculator");

// module.exports = (socket) => {
//   socket.on("calculate_ranking", async ({
//     activitySessionId,
//     questionId,
//     questionType,
//     maxTime,
//   }) => {
//     // 1️⃣ correct answers
//     const correctRes = await db.query(
//       `SELECT "Option_ID"
//        FROM "Question_Correct_Options"
//        WHERE "Question_ID" = $1`,
//       [questionId]
//     );
//     const correctOptionIds = correctRes.rows.map(r => r.Option_ID);

//     // 2️⃣ student answers
//     const answerRes = await db.query(
//       `SELECT *
//        FROM "QuizAnswers"
//        WHERE "ActivitySession_ID" = $1
//          AND "Question_ID" = $2`,
//       [activitySessionId, questionId]
//     );

//     // group by student
//     const byStudent = {};
//     for (const row of answerRes.rows) {
//       if (!byStudent[row.Student_ID]) {
//         byStudent[row.Student_ID] = [];
//       }
//       byStudent[row.Student_ID].push(row);
//     }

//     const results = [];

//     for (const studentId in byStudent) {
//       const answers = byStudent[studentId];
//       let score = 0;

//       if (questionType === "single") {
//         const selected = answers[0].Choice_ID;
//         score = calculateSingleScore({
//           isCorrect: correctOptionIds.includes(selected),
//           timeSpent: 0, // ใส่จริงทีหลัง
//           maxTime,
//         });
//       }

//       if (questionType === "multiple") {
//         const selectedIds = answers.map(a => a.Choice_ID);
//         const correctCount = selectedIds.filter(id =>
//           correctOptionIds.includes(id)
//         ).length;
//         const wrongCount = selectedIds.length - correctCount;

//         score = calculateMultipleScore({
//           correctCount,
//           wrongCount,
//           totalCorrect: correctOptionIds.length,
//         });
//       }

//       if (questionType === "ordering") {
//         const studentOrder = answers
//           .sort((a, b) => a.Answer_Order - b.Answer_Order)
//           .map(a => a.Choice_ID);

//         score = calculateOrderingScore({
//           correctOrder: correctOptionIds,
//           studentOrder,
//         });
//       }

//       results.push({
//         studentId: Number(studentId),
//         score,
//         answeredAt: answers[0].Answered_At,
//       });
//     }

//     results.sort(
//       (a, b) =>
//         b.score - a.score ||
//         new Date(a.answeredAt) - new Date(b.answeredAt)
//     );

//     socket.emit("question_ranking", results.slice(0, 5));
//   });
// };
// const db = require("../db");
// const {
//   calculateSingleScore,
//   calculateMultipleScore,
//   calculateOrderingScore,
// } = require("../services/scoreCalculator");

// module.exports = (socket) => {
//   socket.on("calculate_ranking", async ({
//     activitySessionId,
//     questionId,
//     questionType,
//     maxTime,
//   }) => {
//     try {
//       /* 1️⃣ correct answers */
//       const correctRes = await db.query(
//         `
//         SELECT "Option_ID"
//         FROM "Question_Correct_Options"
//         WHERE "Question_ID" = $1
//         `,
//         [questionId]
//       );
//       const correctOptionIds = correctRes.rows.map(r => r.Option_ID);

//       /* 2️⃣ student answers + join student name */
//       const answerRes = await db.query(
//         `
//         SELECT
//           qa.*,
//           s."Student_Name"
//         FROM "QuizAnswers" qa
//         JOIN "Students" s
//           ON s."Student_ID" = qa."Student_ID"
//         WHERE qa."ActivitySession_ID" = $1
//           AND qa."Question_ID" = $2
//         `,
//         [Number(activitySessionId), Number(questionId)]
//       );

//       /* 3️⃣ group by student */
//       const byStudent = {};
//       for (const row of answerRes.rows) {
//         if (!byStudent[row.Student_ID]) {
//           byStudent[row.Student_ID] = {
//             name: row.Student_Name,
//             answers: [],
//           };
//         }
//         byStudent[row.Student_ID].answers.push(row);
//       }

//       /* 4️⃣ calculate score per student */
//       const results = [];
//       const timeSpent = answers[0].Time_Spent ?? maxTime;

//       for (const studentId in byStudent) {
//         const { name, answers } = byStudent[studentId];
//         let score = 0;

//         if (questionType === "single") {
//           const selected = answers[0].Choice_ID;
//           score = calculateSingleScore({
//             isCorrect: correctOptionIds.includes(selected),
//             timeSpent, // ต่อจริงค่อยใส่
//             maxTime,
//           });
//         }

//         if (questionType === "multiple") {
//           const selectedIds = answers.map(a => a.Choice_ID);
//           const correctCount = selectedIds.filter(id =>
//             correctOptionIds.includes(id)
//           ).length;
//           const wrongCount = selectedIds.length - correctCount;

//           score = calculateMultipleScore({
//             correctCount,
//             wrongCount,
//             totalCorrect: correctOptionIds.length,
//           });
//         }

//         if (questionType === "ordering") {
//           const studentOrder = answers
//             .sort((a, b) => a.Answer_Order - b.Answer_Order)
//             .map(a => a.Choice_ID);

//           score = calculateOrderingScore({
//             correctOrder: correctOptionIds,
//             studentOrder,
//           });
//         }

//         results.push({
//           name,
//           score,
//           time: timeSpent, // mock time (ถ้าจะใช้จริง → คำนวณจาก Answered_At)
//           answeredAt: answers[0].Answered_At,
//         });
//       }

//       /* 5️⃣ sort + top 5 */
//       results.sort(
//         (a, b) =>
//           b.score - a.score ||
//           new Date(a.answeredAt) - new Date(b.answeredAt)
//       );

//       socket.emit("question_ranking", results.slice(0, 5));

//     } catch (err) {
//       console.error("❌ calculate_ranking error:", err.message);
//       socket.emit("question_ranking", []);
//     }
//   });
// };

const db = require("../db");
const {
  calculateSingleScore,
  calculateMultipleScore,
  calculateOrderingScore,
} = require("../services/scoreCalculator");

module.exports = (socket) => {
  socket.on("calculate_ranking", async ({
    activitySessionId,
    questionId,
    questionType,
    maxTime,
  }) => {
    try {
      // 1️⃣ correct answers
      const correctRes = await db.query(
        `SELECT "Option_ID"
         FROM "Question_Correct_Options"
         WHERE "Question_ID" = $1`,
        [questionId]
      );
      const correctOptionIds = correctRes.rows.map(r => r.Option_ID);

      // 2️⃣ student answers
      const answerRes = await db.query(
        `
        SELECT
    qa.*,
    s."Student_Name"
  FROM "QuizAnswers" qa
  JOIN "Students" s
    ON s."Student_ID" = qa."Student_ID"
  WHERE qa."ActivitySession_ID" = $1
    AND qa."Question_ID" = $2
    `,
        [activitySessionId, questionId]
      );

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


      const results = [];
      
      for (const studentId in byStudent) {
        const {name, answers} = byStudent[studentId];
        let score = 0;
        const timeSpent =
                            answers[0].Time_Spent !== null && answers[0].Time_Spent !== undefined
                                ? answers[0].Time_Spent
                                : maxTime;


        if (questionType === "single") {
          const selected = answers[0].Choice_ID;
          score = calculateSingleScore({
            isCorrect: correctOptionIds.includes(selected),
            timeSpent, // เดี๋ยวแก้ด้านล่าง
            maxTime,
          });
        }

        else if (questionType === "multiple") {
          const selectedIds = answers.map(a => a.Choice_ID);
          const correctCount = selectedIds.filter(id =>
            correctOptionIds.includes(id)
          ).length;
          const wrongCount = selectedIds.length - correctCount;

          score = calculateMultipleScore({
            correctCount,
            wrongCount,
            totalCorrect: correctOptionIds.length,
          });
        }

        else if (questionType === "ordering") {
          const studentOrder = answers
            .sort((a, b) => (a.Answer_Order ?? 0) - (b.Answer_Order ?? 0))
            .map(a => a.Choice_ID);

          score = calculateOrderingScore({
            correctOrder: correctOptionIds,
            studentOrder,
          });
        }

        console.log('answers[0].Time_Spent = ', answers[0].Time_Spent);
        console.log(score);
        results.push({
          name,
          studentId: Number(studentId),
          score,
          time: timeSpent,
          answeredAt: answers[0].Answered_At,
        });
      }

      results.sort(
        (a, b) =>
          b.score - a.score ||
          new Date(a.answeredAt) - new Date(b.answeredAt)
      );

      socket.emit("question_ranking", results.slice(0, 5));
    } catch (err) {
      console.error("❌ calculate_ranking error:", err.message);
    }
  });
};
