// const db = require("../db");

// module.exports = (socket) => {
//   socket.on("get_quiz_report", async ({ activitySessionId }) => {
//     try {
//       const scoreRes = await db.query(`
//         WITH student_question AS (
//           SELECT
//             qa."Student_ID",
//             qa."Question_ID",
//             CASE
//               WHEN COUNT(*) = (
//                 SELECT COUNT(*)
//                 FROM "Question_Correct_Options"
//                 WHERE "Question_ID" = qa."Question_ID"
//               )
//               AND BOOL_AND(
//                 qa."Choice_ID" IN (
//                   SELECT "Option_ID"
//                   FROM "Question_Correct_Options"
//                   WHERE "Question_ID" = qa."Question_ID"
//                 )
//               )
//               THEN 1 ELSE 0
//             END AS is_correct
//           FROM "QuizAnswers" qa
//           WHERE qa."ActivitySession_ID" = $1
//           GROUP BY qa."Student_ID", qa."Question_ID"
//         )
//         SELECT
//           sq."Student_ID",
//           s."Student_Name",
//           sq."Question_ID",
//           sq.is_correct
//         FROM student_question sq
//         JOIN "Students" s ON s."Student_ID" = sq."Student_ID"
//         ORDER BY sq."Student_ID", sq."Question_ID"
//       `, [activitySessionId]);

//       const eachQuestionRes = await db.query(`
//         WITH student_question AS (
//           SELECT
//             qa."Student_ID",
//             qa."Question_ID",
//             CASE
//               WHEN COUNT(*) = (
//                 SELECT COUNT(*)
//                 FROM "Question_Correct_Options"
//                 WHERE "Question_ID" = qa."Question_ID"
//               )
//               AND BOOL_AND(
//                 qa."Choice_ID" IN (
//                   SELECT "Option_ID"
//                   FROM "Question_Correct_Options"
//                   WHERE "Question_ID" = qa."Question_ID"
//                 )
//               )
//               THEN 1 ELSE 0
//             END AS is_correct
//           FROM "QuizAnswers" qa
//           WHERE qa."ActivitySession_ID" = $1
//           GROUP BY qa."Student_ID", qa."Question_ID"
//         )
//         SELECT
//           q."Question_ID",
//           q."Question_Text",
//           ROUND(AVG(sq.is_correct) * 100) AS correct_percent
//         FROM "Questions" q
//         JOIN "AssignedQuiz" aq ON aq."Quiz_ID" = q."Set_ID"
//         LEFT JOIN student_question sq ON sq."Question_ID" = q."Question_ID"
//         WHERE aq."ActivitySession_ID" = $1
//         GROUP BY q."Question_ID", q."Question_Text"
//         ORDER BY q."Question_ID"
//       `, [activitySessionId]);

//       const answerAnalyticsRes = await db.query(`
//         SELECT
//           q."Question_ID",
//           q."Question_Text",
//           o."Option_Text",
//           CASE
//             WHEN qco."Option_ID" IS NOT NULL THEN true
//             ELSE false
//           END AS is_correct,
//           ROUND(
//             COUNT(qa."Choice_ID") * 100.0
//             / NULLIF(COUNT(DISTINCT qa."Student_ID"), 0)
//           ) AS percent
//         FROM "Questions" q
//         JOIN "QuestionOptions" o ON o."Question_ID" = q."Question_ID"
//         LEFT JOIN "Question_Correct_Options" qco
//           ON qco."Question_ID" = q."Question_ID"
//          AND qco."Option_ID" = o."Option_ID"
//         LEFT JOIN "QuizAnswers" qa
//           ON qa."Choice_ID" = o."Option_ID"
//          AND qa."ActivitySession_ID" = $1
//         GROUP BY
//           q."Question_ID",
//           q."Question_Text",
//           o."Option_Text",
//           qco."Option_ID"
//         ORDER BY q."Question_ID"
//       `, [activitySessionId]);

//       // const overallRes = await db.query(`
//       //   SELECT
//       //     COUNT(DISTINCT "Question_ID") AS total_question,
//       //     ROUND(AVG("Total_Score")) AS avg_score,
//       //     ROUND(AVG("Total_Time_Taken")) AS avg_time,
//       //     MAX("Total_Score") AS max_score,
//       //     MIN("Total_Score") AS min_score
//       //   FROM "QuizResults"
//       //   WHERE "ActivitySession_ID" = $1
//       // `, [activitySessionId]);
//       const overallRes = await db.query(`
//       SELECT
//   COUNT(q."Question_ID") AS total_question,
//   ROUND(AVG(qr."Total_Score")) AS avg_score,
//   ROUND(AVG(qr."Total_Time_Taken")) AS avg_time,
//   MAX(qr."Total_Score") AS max_score,
//   MIN(qr."Total_Score") AS min_score
// FROM "QuizResults" qr
// JOIN "AssignedQuiz" aq
//   ON aq."ActivitySession_ID" = qr."ActivitySession_ID"
// JOIN "Questions" q
//   ON q."Set_ID" = aq."Quiz_ID"
// WHERE qr."ActivitySession_ID" = $1
// `, [activitySessionId]);

//       const scoreSummaryRes = await db.query(`
//   SELECT
//     qr."Student_ID",
//     s."Student_Name",
//     qr."Total_Score"
//   FROM "QuizResults" qr
//   JOIN "Students" s
//     ON s."Student_ID" = qr."Student_ID"
//   WHERE qr."ActivitySession_ID" = $1
//   ORDER BY qr."Total_Score" DESC
// `, [activitySessionId]);

//       const manyMistakes =
//         eachQuestionRes.rows.filter(
//           (q) => Number(q.correct_percent) < 50
//         ).length;

//       const attention = [];
//       eachQuestionRes.rows.forEach((q, i) => {
//         if (q.correct_percent < 30) {
//           attention.push(`Q${i + 1} ผิดมากผิดปกติ`);
//         }
//       });

//       socket.emit("quiz_report_data", {
//         student: scoreRes.rows,
//         overall: {
//           totalQuestion: Number(overallRes.rows[0]?.total_question ?? 0),
//           avgScore: Number(overallRes.rows[0]?.avg_score ?? 0),
//           avgTime: Number(overallRes.rows[0]?.avg_time ?? 0),
//           maxScore: Number(overallRes.rows[0]?.max_score ?? 0),
//           minScore: Number(overallRes.rows[0]?.min_score ?? 0),
//           manyMistakes,
//           attention,
//         },
//         eachQuestion: eachQuestionRes.rows,
//         answerAnalytics: answerAnalyticsRes.rows,
//         scores: scoreSummaryRes.rows,
//       });

//     } catch (err) {
//       console.error("❌ get_quiz_report error:", err);
//       socket.emit("quiz_report_data", null);
//     }
//   });

//   socket.on("get_finished_quiz_sessions", async ({ classId }) => {
//     try {

//       const res = await db.query(`
//       SELECT
//   asn."ActivitySession_ID",
//   qs."Title" AS quiz_name,
//   asn."Ended_At",
//   COUNT(DISTINCT qa."Student_ID") AS student_count
// FROM "ActivitySessions" asn

// LEFT JOIN "AssignedQuiz" aq
//   ON aq."ActivitySession_ID" = asn."ActivitySession_ID"

// LEFT JOIN "QuestionSets" qs
//   ON qs."Set_ID" = aq."Quiz_ID"

// LEFT JOIN "QuizAnswers" qa
//   ON qa."ActivitySession_ID" = asn."ActivitySession_ID"

// WHERE asn."Class_ID" = $1
//   AND asn."Status" = 'finished'

// GROUP BY
//   asn."ActivitySession_ID",
//   qs."Title",
//   asn."Ended_At"

// ORDER BY asn."Ended_At" DESC;

//     `, [classId]);

//       socket.emit("finished_quiz_sessions_data", res.rows);
//     } catch (err) {
//       console.error("❌ get_finished_quiz_sessions error:", err);
//       socket.emit("finished_quiz_sessions_data", []);
//     }
//   });
// socket.on("get_class_report", async ({ classId }) => {
//   try {

//     // 1️⃣ student count
//     const studentRes = await db.query(`
//       SELECT COUNT(*) AS total_student
//       FROM "Students"
//       WHERE "Class_ID" = $1
//     `, [classId]);

//     const totalStudent = Number(studentRes.rows[0]?.total_student ?? 0);


//     // 2️⃣ total quiz
//     const quizRes = await db.query(`
//       SELECT COUNT(*) AS total_quiz
//       FROM "ActivitySessions"
//       WHERE "Class_ID" = $1
//         AND "Status" = 'finished'
//     `, [classId]);

//     const totalQuiz = Number(quizRes.rows[0]?.total_quiz ?? 0);


//     // 3️⃣ avg score + time (ไม่มี Full_Score แล้ว)
//     const avgRes = await db.query(`
//       SELECT
//         ROUND(AVG(qr."Total_Score")) AS avg_score,
//         ROUND(AVG(qr."Total_Time_Taken")) AS avg_time
//       FROM "QuizResults" qr
//       JOIN "ActivitySessions" asn
//         ON asn."ActivitySession_ID" = qr."ActivitySession_ID"
//       WHERE asn."Class_ID" = $1
//         AND asn."Status" = 'finished'
//     `, [classId]);

//     const avgScore = Number(avgRes.rows[0]?.avg_score ?? 0);
//     const avgTime = Number(avgRes.rows[0]?.avg_time ?? 0);


//     // 4️⃣ already done
//     const doneRes = await db.query(`
//       WITH total_quiz AS (
//         SELECT COUNT(*) AS quiz_count
//         FROM "ActivitySessions"
//         WHERE "Class_ID" = $1
//           AND "Status" = 'finished'
//       ),
//       student_done AS (
//         SELECT
//           qr."Student_ID",
//           COUNT(DISTINCT qr."ActivitySession_ID") AS done_count
//         FROM "QuizResults" qr
//         JOIN "ActivitySessions" asn
//           ON asn."ActivitySession_ID" = qr."ActivitySession_ID"
//         WHERE asn."Class_ID" = $1
//           AND asn."Status" = 'finished'
//         GROUP BY qr."Student_ID"
//       )
//       SELECT COUNT(*) AS done_student
//       FROM student_done, total_quiz
//       WHERE student_done.done_count = total_quiz.quiz_count
//     `, [classId]);

//     const doneStudent = Number(doneRes.rows[0]?.done_student ?? 0);
//     const alreadyDonePercent =
//       totalStudent === 0
//         ? 0
//         : Math.round((doneStudent / totalStudent) * 100);


//     // 5️⃣ each quiz
//     const eachQuizRes = await db.query(`
//       SELECT
//   asn."ActivitySession_ID",
//   qs."Title",
//   ROUND(
//     AVG(qr."Total_Score") * 100.0 /
//     COUNT(DISTINCT q."Question_ID")
//   ) AS avg_score
// FROM "QuizResults" qr
// JOIN "ActivitySessions" asn
//   ON asn."ActivitySession_ID" = qr."ActivitySession_ID"
// JOIN "AssignedQuiz" aq
//   ON aq."ActivitySession_ID" = asn."ActivitySession_ID"
// JOIN "QuestionSets" qs
//   ON qs."Set_ID" = aq."Quiz_ID"
// JOIN "Questions" q
//   ON q."Set_ID" = qs."Set_ID"
// WHERE asn."Class_ID" = $1
//   AND asn."Status" = 'finished'
// GROUP BY asn."ActivitySession_ID", qs."Title"
// ORDER BY asn."Ended_At"

//     `, [classId]);

//     socket.emit("class_report_data", {
//       overall: {
//         totalStudent,
//         alreadyDone: doneStudent,
//         alreadyDonePercent,
//         totalQuiz,
//         avgScore,
//         avgTime
//       },
//       eachQuiz: eachQuizRes.rows
//     });

//   } catch (err) {
//     console.error("❌ get_class_report error:", err);
//     socket.emit("class_report_data", null);
//   }
// });

// };

const db = require("../db");

module.exports = (socket) => {

  /* =====================================================
     1️⃣ REPORT ต่อ 1 QUIZ SESSION
  ===================================================== */
  socket.on("get_quiz_report", async ({ activitySessionId }) => {
    try {

      /* ================= Student × Question ================= */
      const scoreRes = await db.query(`
        WITH student_question AS (
          SELECT
            qa."Student_ID",
            qa."Question_ID",
            CASE
              WHEN COUNT(*) = (
                SELECT COUNT(*)
                FROM "Question_Correct_Options"
                WHERE "Question_ID" = qa."Question_ID"
              )
              AND BOOL_AND(
                qa."Choice_ID" IN (
                  SELECT "Option_ID"
                  FROM "Question_Correct_Options"
                  WHERE "Question_ID" = qa."Question_ID"
                )
              )
              THEN 1 ELSE 0
            END AS is_correct
          FROM "QuizAnswers" qa
          WHERE qa."ActivitySession_ID" = $1
          GROUP BY qa."Student_ID", qa."Question_ID"
        )
        SELECT
          sq."Student_ID",
          s."Student_Name",
          sq."Question_ID",
          sq.is_correct
        FROM student_question sq
        JOIN "Students" s ON s."Student_ID" = sq."Student_ID"
        ORDER BY sq."Student_ID", sq."Question_ID"
      `, [activitySessionId]);


      /* ================= Overall Accuracy (ไม่ใช้ Total_Score) ================= */
      const overallRes = await db.query(`
        SELECT
          ROUND(
            AVG(
              CASE
                WHEN qr."Total_Question" = 0 THEN 0
                ELSE qr."Total_Correct" * 100.0 / qr."Total_Question"
              END
            )
          ) AS avg_accuracy,
          ROUND(AVG(qr."Total_Time_Taken")) AS avg_time,
          COUNT(DISTINCT qr."Student_ID") AS total_student
        FROM "QuizResults" qr
        WHERE qr."ActivitySession_ID" = $1
      `, [activitySessionId]);


      /* ================= Ranking (ใช้ Game Score ได้) ================= */
      const scoreSummaryRes = await db.query(`
        SELECT
          qr."Student_ID",
          s."Student_Name",
          qr."Total_Score"
        FROM "QuizResults" qr
        JOIN "Students" s
          ON s."Student_ID" = qr."Student_ID"
        WHERE qr."ActivitySession_ID" = $1
        ORDER BY qr."Total_Score" DESC
      `, [activitySessionId]);

      const eachQuestionRes = await db.query(`
  SELECT
    q."Question_ID",
    q."Question_Text",
    ROUND(AVG(
      CASE
        WHEN qr."Total_Question" = 0 THEN 0
        ELSE qr."Total_Correct" * 100.0 / qr."Total_Question"
      END
    )) AS correct_percent
  FROM "Questions" q
  JOIN "AssignedQuiz" aq ON aq."Quiz_ID" = q."Set_ID"
  LEFT JOIN "QuizResults" qr
    ON qr."ActivitySession_ID" = aq."ActivitySession_ID"
  WHERE aq."ActivitySession_ID" = $1
  GROUP BY q."Question_ID", q."Question_Text"
  ORDER BY q."Question_ID"
`
        , [activitySessionId]);



      socket.emit("quiz_report_data", {
        overall: {
          avgAccuracy: Number(overallRes.rows[0]?.avg_accuracy ?? 0),
          avgTime: Number(overallRes.rows[0]?.avg_time ?? 0),
          totalStudent: Number(overallRes.rows[0]?.total_student ?? 0)
        },
        student: scoreRes.rows,
        scores: scoreSummaryRes.rows,
        eachQuestion: eachQuestionRes.rows
      });

    } catch (err) {
      console.error("❌ get_quiz_report error:", err);
      socket.emit("quiz_report_data", null);
    }
  });


  socket.on("get_finished_quiz_sessions", async ({ classId }) => {
    try {

      const res = await db.query(`
      SELECT
  asn."ActivitySession_ID",
  qs."Title" AS quiz_name,
  asn."Ended_At",
  COUNT(DISTINCT qa."Student_ID") AS student_count
FROM "ActivitySessions" asn

LEFT JOIN "AssignedQuiz" aq
  ON aq."ActivitySession_ID" = asn."ActivitySession_ID"

LEFT JOIN "QuestionSets" qs
  ON qs."Set_ID" = aq."Quiz_ID"

LEFT JOIN "QuizAnswers" qa
  ON qa."ActivitySession_ID" = asn."ActivitySession_ID"

WHERE asn."Class_ID" = $1
  AND asn."Status" = 'finished'

GROUP BY
  asn."ActivitySession_ID",
  qs."Title",
  asn."Ended_At"

ORDER BY asn."Ended_At" DESC;

    `, [classId]);

      socket.emit("finished_quiz_sessions_data", res.rows);
    } catch (err) {
      console.error("❌ get_finished_quiz_sessions error:", err);
      socket.emit("finished_quiz_sessions_data", []);
    }
  });

  /* =====================================================
     2️⃣ REPORT ระดับคลาส (ALL QUIZ COMBINED)
  ===================================================== */
  socket.on("get_class_report", async ({ classId }) => {
    try {

      /* ================= Total Students ================= */
      const studentRes = await db.query(`
        SELECT COUNT(*) AS total_student
        FROM "Students"
        WHERE "Class_ID" = $1
      `, [classId]);

      const totalStudent = Number(studentRes.rows[0]?.total_student ?? 0);


      /* ================= Total Quiz Sessions ================= */
      const quizRes = await db.query(`
        SELECT COUNT(*) AS total_quiz
        FROM "ActivitySessions"
        WHERE "Class_ID" = $1
          AND "Status" = 'finished'
      `, [classId]);

      const totalQuiz = Number(quizRes.rows[0]?.total_quiz ?? 0);


      /* ================= Average Accuracy (ทั้งคลาส) ================= */
      const avgRes = await db.query(`
        SELECT
          ROUND(
            AVG(
              CASE
                WHEN qr."Total_Question" = 0 THEN 0
                ELSE qr."Total_Correct" * 100.0 / qr."Total_Question"
              END
            )
          ) AS avg_accuracy,
          ROUND(AVG(qr."Total_Time_Taken")) AS avg_time
        FROM "QuizResults" qr
        JOIN "ActivitySessions" asn
          ON asn."ActivitySession_ID" = qr."ActivitySession_ID"
        WHERE asn."Class_ID" = $1
          AND asn."Status" = 'finished'
      `, [classId]);

      const avgAccuracy = Number(avgRes.rows[0]?.avg_accuracy ?? 0);
      const avgTime = Number(avgRes.rows[0]?.avg_time ?? 0);


      /* ================= Already Done ================= */
      const doneRes = await db.query(`
        WITH total_quiz AS (
          SELECT COUNT(*) AS quiz_count
          FROM "ActivitySessions"
          WHERE "Class_ID" = $1
            AND "Status" = 'finished'
        ),
        student_done AS (
          SELECT
            qr."Student_ID",
            COUNT(DISTINCT qr."ActivitySession_ID") AS done_count
          FROM "QuizResults" qr
          JOIN "ActivitySessions" asn
            ON asn."ActivitySession_ID" = qr."ActivitySession_ID"
          WHERE asn."Class_ID" = $1
            AND asn."Status" = 'finished'
          GROUP BY qr."Student_ID"
        )
        SELECT COUNT(*) AS done_student
        FROM student_done, total_quiz
        WHERE student_done.done_count = total_quiz.quiz_count
      `, [classId]);

      const doneStudent = Number(doneRes.rows[0]?.done_student ?? 0);
      const alreadyDonePercent =
        totalStudent === 0
          ? 0
          : Math.round((doneStudent / totalStudent) * 100);


      /* ================= Each Quiz (Accuracy %) ================= */
      const eachQuizRes = await db.query(`
        SELECT
          asn."ActivitySession_ID",
          qs."Title",
          ROUND(
            AVG(
              CASE
                WHEN qr."Total_Question" = 0 THEN 0
                ELSE qr."Total_Correct" * 100.0 / qr."Total_Question"
              END
            )
          ) AS avg_accuracy
        FROM "QuizResults" qr
        JOIN "ActivitySessions" asn
          ON asn."ActivitySession_ID" = qr."ActivitySession_ID"
        JOIN "AssignedQuiz" aq
          ON aq."ActivitySession_ID" = asn."ActivitySession_ID"
        JOIN "QuestionSets" qs
          ON qs."Set_ID" = aq."Quiz_ID"
        WHERE asn."Class_ID" = $1
          AND asn."Status" = 'finished'
        GROUP BY asn."ActivitySession_ID", qs."Title"
        ORDER BY asn."Ended_At"
      `, [classId]);


      socket.emit("class_report_data", {
        overall: {
          totalStudent,
          totalQuiz,
          avgAccuracy,
          avgTime,
          alreadyDone: doneStudent,
          alreadyDonePercent
        },
        eachQuiz: eachQuizRes.rows
      });

    } catch (err) {
      console.error("❌ get_class_report error:", err);
      socket.emit("class_report_data", null);
    }
  });

};
