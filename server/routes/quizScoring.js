// // const db = require("../db");
// // const {
// //   calculateSingleScore,
// //   calculateMultipleScore,
// //   calculateOrderingScore,
// // } = require("../services/scoreCalculator");

// // module.exports = (io, socket) => {
// //   socket.on("calculate_ranking", async ({
// //     activitySessionId,
// //     quizId,
// //     questionId,
// //     questionType,
// //     maxTime,
// //   }) => {
// //     console.log("🔥 calculate_ranking called:", 
// //       activitySessionId,
// //     quizId,
// //     questionId,
// //     questionType,
// //     maxTime,);
// //     try {
// //       /* 1️⃣ correct answers */
// //       const correctRes = await db.query(
// //         `SELECT "Option_ID"
// //          FROM "Question_Correct_Options"
// //          WHERE "Question_ID" = $1`,
// //         [questionId]
// //       );
// //       const correctOptionIds = correctRes.rows.map(r => r.Option_ID);

// //       /* 2️⃣ student answers */
// //       const answerRes = await db.query(
// //         `
// //         SELECT qa.*, s."Student_Name"
// //         FROM "QuizAnswers" qa
// //         JOIN "Students" s
// //           ON s."Student_ID" = qa."Student_ID"
// //         WHERE qa."ActivitySession_ID" = $1
// //           AND qa."Question_ID" = $2
// //         `,
// //         [activitySessionId, questionId]
// //       );

// //       console.log("answerRes rows =", answerRes.rows.length);


// //       /* 3️⃣ group by student */
// //       const byStudent = {};
// //       for (const row of answerRes.rows) {
// //         if (!byStudent[row.Student_ID]) {
// //           byStudent[row.Student_ID] = {
// //             name: row.Student_Name,
// //             answers: [],
// //           };
// //         }
// //         byStudent[row.Student_ID].answers.push(row);
// //       }

// //       /* 4️⃣ calculate score per student + update QuizResults */
// //       for (const studentId in byStudent) {
// //         const { answers } = byStudent[studentId];
// //         let score = 0;

// //         const timeSpent =
// //           answers[0].Time_Spent ?? maxTime;

// //         /* ================= SINGLE ================= */
// //         if (questionType === "single") {

// //           const correctRes = await db.query(
// //             `
// //             SELECT "Option_ID"
// //             FROM "Question_Correct_Options"
// //             WHERE "Question_ID" = $1
// //             `,
// //             [questionId]
// //           );

// //           const correctOptionIds =
// //             correctRes.rows.map(r => Number(r.Option_ID));

// //           score = calculateSingleScore({
// //             isCorrect: correctOptionIds.includes(Number(answers[0].Choice_ID)),
// //             timeSpent,
// //             maxTime,
// //           });
// //         }

// //         /* ================= MULTIPLE ================= */
// //         else if (questionType === "multiple") {

// //           const correctRes = await db.query(
// //             `
// //             SELECT "Option_ID"
// //             FROM "Question_Correct_Options"
// //             WHERE "Question_ID" = $1
// //             `,
// //             [questionId]
// //           );

// //           const correctOptionIds =
// //             correctRes.rows.map(r => Number(r.Option_ID));

// //           const selectedIds =
// //             answers.map(a => Number(a.Choice_ID));

// //           const correctCount =
// //             selectedIds.filter(id =>
// //               correctOptionIds.includes(id)
// //             ).length;

// //           score = calculateMultipleScore({
// //             correctCount,
// //             wrongCount: selectedIds.length - correctCount,
// //             maxTime,
// //             timeSpent,
// //           });
// //         }

// //         /* ================= ORDERING ================= */
// //         else if (questionType === "ordering") {

// //           const studentOrder = answers
// //             .sort((a, b) => a.Answer_Order - b.Answer_Order)
// //             .map(a => Number(a.Choice_ID));

// //           const correctRes = await db.query(
// //             `
// //             SELECT "Option_ID"
// //             FROM "QuestionOptions"
// //             WHERE "Question_ID" = $1
// //             ORDER BY "Option_ID" ASC
// //             `,
// //             [questionId]
// //           );

// //           const correctOrder =
// //             correctRes.rows.map(r => Number(r.Option_ID));

// //           score = calculateOrderingScore({
// //             correctOrder,
// //             studentOrder,
// //             maxTime,
// //             timeSpent,
// //           });
// //         }

// //         /* 🔥 update QuizResults (คะแนนสะสม) */
// //         await db.query(
// //           `
// //           INSERT INTO "QuizResults"
// //           ("Quiz_ID","Student_ID","ActivitySession_ID","Total_Score","Total_Time_Taken")
// //           VALUES ($1,$2,$3,$4,$5)
// //           ON CONFLICT ("Quiz_ID","Student_ID","ActivitySession_ID")
// //           DO UPDATE SET
// //             "Total_Score" = "QuizResults"."Total_Score" + EXCLUDED."Total_Score",
// //             "Total_Time_Taken" = "QuizResults"."Total_Time_Taken" + EXCLUDED."Total_Time_Taken";

// //           `,
// //           [quizId, studentId, activitySessionId, score, timeSpent]
// //         );

// //         const totalRes = await db.query(
// //           `
// //           SELECT "Total_Score"
// //           FROM "QuizResults"
// //           WHERE "Quiz_ID" = $1
// //             AND "Student_ID" = $2
// //             AND "ActivitySession_ID" = $3
// //           `,
// //           [quizId, studentId, activitySessionId]
// //         );

// //         const totalScore = totalRes.rows[0]?.Total_Score ?? 0;
        
// //         /* 🔥 ส่งกลับ student ทุกคนใน room */
// //         io.to(`activity_${activitySessionId}`).emit("student_result", {
// //           studentId,
// //           scoreForThis: score,
// //           totalScore,
// //         });

// //         console.log("📤 emitting student_result:", {
// //           studentId,
// //           scoreForThis: score,
// //           totalScore,
// //         });


// //       }

// //       /* 5️⃣ emit Top 5 (Question Ranking) */
// //       const rankingRes = await db.query(
// //         `
// //         SELECT
// //           s."Student_Name" AS name,
// //           qr."Total_Score" AS score,
// //           qr."Total_Time_Taken" AS time
// //         FROM "QuizResults" qr
// //         JOIN "Students" s
// //           ON s."Student_ID" = qr."Student_ID"
// //         WHERE qr."ActivitySession_ID" = $1
// //         ORDER BY score DESC, time ASC
// //         LIMIT 5
// //         `,
// //         [activitySessionId]
// //       );

// //       socket.emit("question_ranking", rankingRes.rows);

// //     } catch (err) {
// //       console.error("❌ calculate_ranking error:", err.message);
// //       socket.emit("question_ranking", []);
// //     }
// //   });
// // };



// const db = require("../db");
// const {
//   calculateSingleScore,
//   calculateMultipleScore,
//   calculateOrderingScore,
// } = require("../services/scoreCalculator");

// module.exports = (io, socket) => {
//   socket.on("calculate_ranking", async ({
//     activitySessionId,
//     quizId,
//     questionId,
//     questionType,
//     maxTime,
//   }) => {
//     console.log("🔥 calculate_ranking called:", 
//       activitySessionId,
//     quizId,
//     questionId,
//     questionType,
//     maxTime,);
//     try {
//       /* 1️⃣ correct answers */
//       const correctRes = await db.query(
//         `SELECT "Option_ID"
//          FROM "Question_Correct_Options"
//          WHERE "Question_ID" = $1`,
//         [questionId]
//       );
//       const correctOptionIds = correctRes.rows.map(r => r.Option_ID);

//       /* 2️⃣ student answers */
//       const answerRes = await db.query(
//         `
//         SELECT qa.*, s."Student_Name"
//         FROM "QuizAnswers" qa
//         JOIN "Students" s
//           ON s."Student_ID" = qa."Student_ID"
//         WHERE qa."ActivitySession_ID" = $1
//           AND qa."Question_ID" = $2
//         `,
//         [activitySessionId, questionId]
//       );

//       console.log("answerRes rows =", answerRes.rows.length);


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

//       // /* 4️⃣ calculate score per student + update QuizResults */
//       // for (const studentId in byStudent) {
//       //   const { answers } = byStudent[studentId];
//       //   let score = 0;

//       //   const timeSpent =
//       //     answers[0].Time_Spent ?? maxTime;

//       //   /* ================= SINGLE ================= */
//       //   if (questionType === "single") {

//       //     const correctRes = await db.query(
//       //       `
//       //       SELECT "Option_ID"
//       //       FROM "Question_Correct_Options"
//       //       WHERE "Question_ID" = $1
//       //       `,
//       //       [questionId]
//       //     );

//       //     const correctOptionIds =
//       //       correctRes.rows.map(r => Number(r.Option_ID));

//       //     score = calculateSingleScore({
//       //       isCorrect: correctOptionIds.includes(Number(answers[0].Choice_ID)),
//       //       timeSpent,
//       //       maxTime,
//       //     });
//       //   }

//       //   /* ================= MULTIPLE ================= */
//       //   else if (questionType === "multiple") {

//       //     const correctRes = await db.query(
//       //       `
//       //       SELECT "Option_ID"
//       //       FROM "Question_Correct_Options"
//       //       WHERE "Question_ID" = $1
//       //       `,
//       //       [questionId]
//       //     );

//       //     const correctOptionIds =
//       //       correctRes.rows.map(r => Number(r.Option_ID));

//       //     const selectedIds =
//       //       answers.map(a => Number(a.Choice_ID));

//       //     const correctCount =
//       //       selectedIds.filter(id =>
//       //         correctOptionIds.includes(id)
//       //       ).length;

//       //     score = calculateMultipleScore({
//       //       correctCount,
//       //       wrongCount: selectedIds.length - correctCount,
//       //       maxTime,
//       //       timeSpent,
//       //     });
//       //   }

//       //   /* ================= ORDERING ================= */
//       //   else if (questionType === "ordering") {

//       //     const studentOrder = answers
//       //       .sort((a, b) => a.Answer_Order - b.Answer_Order)
//       //       .map(a => Number(a.Choice_ID));

//       //     const correctRes = await db.query(
//       //       `
//       //       SELECT "Option_ID"
//       //       FROM "QuestionOptions"
//       //       WHERE "Question_ID" = $1
//       //       ORDER BY "Option_ID" ASC
//       //       `,
//       //       [questionId]
//       //     );

//       //     const correctOrder =
//       //       correctRes.rows.map(r => Number(r.Option_ID));

//       //     score = calculateOrderingScore({
//       //       correctOrder,
//       //       studentOrder,
//       //       maxTime,
//       //       timeSpent,
//       //     });
//       //   }

//       //   /* 🔥 update QuizResults (คะแนนสะสม) */
//       //   await db.query(
//       //     `
//       //     INSERT INTO "QuizResults"
//       //     ("Quiz_ID","Student_ID","ActivitySession_ID","Total_Score","Total_Time_Taken")
//       //     VALUES ($1,$2,$3,$4,$5)
//       //     ON CONFLICT ("Quiz_ID","Student_ID","ActivitySession_ID")
//       //     DO UPDATE SET
//       //       "Total_Score" = "QuizResults"."Total_Score" + EXCLUDED."Total_Score",
//       //       "Total_Time_Taken" = "QuizResults"."Total_Time_Taken" + EXCLUDED."Total_Time_Taken";

//       //     `,
//       //     [quizId, studentId, activitySessionId, score, timeSpent]
//       //   );

//       //   const totalRes = await db.query(
//       //     `
//       //     SELECT "Total_Score"
//       //     FROM "QuizResults"
//       //     WHERE "Quiz_ID" = $1
//       //       AND "Student_ID" = $2
//       //       AND "ActivitySession_ID" = $3
//       //     `,
//       //     [quizId, studentId, activitySessionId]
//       //   );

//       //   const totalScore = totalRes.rows[0]?.Total_Score ?? 0;
        
//       //   /* 🔥 ส่งกลับ student ทุกคนใน room */
//       //   io.to(`activity_${activitySessionId}`).emit("student_result", {
//       //     studentId,
//       //     scoreForThis: score,
//       //     totalScore,
//       //   });

//       //   console.log("📤 emitting student_result:", {
//       //     studentId,
//       //     scoreForThis: score,
//       //     totalScore,
//       //   });


//       // }

//       /* 5️⃣ emit Top 5 (Question Ranking) */
//       const rankingRes = await db.query(
//         `
//         SELECT
//           s."Student_Name" AS name,
//           qr."Total_Score" AS score,
//           qr."Total_Time_Taken" AS time
//         FROM "QuizResults" qr
//         JOIN "Students" s
//           ON s."Student_ID" = qr."Student_ID"
//         WHERE qr."ActivitySession_ID" = $1
//         ORDER BY score DESC, time ASC
//         LIMIT 5
//         `,
//         [activitySessionId]
//       );

//       socket.emit("question_ranking", rankingRes.rows);

//     } catch (err) {
//       console.error("❌ calculate_ranking error:", err.message);
//       socket.emit("question_ranking", []);
//     }
//   });
// };



