const db = require("../db");

module.exports = (socket) => {
  socket.on("get_quiz_report", async ({ activitySessionId }) => {
    try {
      /* =========================
         1️⃣ Student score distribution
      ========================= */
      const studentsRes = await db.query(`
        SELECT
          s."Student_ID",
          s."Student_Name" AS name,
          qr."Total_Score" AS total_score,
          qr."Total_Time_Taken" AS total_time
        FROM "QuizResults" qr
        JOIN "Students" s
          ON s."Student_ID" = qr."Student_ID"
        WHERE qr."ActivitySession_ID" = $1
        ORDER BY total_score DESC
      `, [activitySessionId]);

      /* =========================
         2️⃣ Overall summary
      ========================= */
      const overallRes = await db.query(`
        SELECT
          COUNT(DISTINCT q."Question_ID") AS total_question,
          ROUND(AVG(qr."Total_Score")) AS avg_score,
          ROUND(AVG(qr."Total_Time_Taken")) AS avg_time,
          MAX(qr."Total_Score") AS max_score,
          MIN(qr."Total_Score") AS min_score
        FROM "QuizResults" qr
        JOIN "AssignedQuiz" aq
          ON aq."ActivitySession_ID" = qr."ActivitySession_ID"
        JOIN "Questions" q
          ON q."Set_ID" = aq."Quiz_ID"
        WHERE qr."ActivitySession_ID" = $1
      `, [activitySessionId]);

      /* =========================
         3️⃣ Each Question summary
         (% คนตอบถูก)
      ========================= */
//       const eachQuestionRes = await db.query(`
// WITH student_question AS (
//   SELECT
//     qa."Student_ID",
//     qa."Question_ID",
//     CASE
//       WHEN COUNT(*) = (
//         SELECT COUNT(*)
//         FROM "Question_Correct_Options" qco
//         WHERE qco."Question_ID" = qa."Question_ID"
//       )
//       AND BOOL_AND(
//         qa."Choice_ID" IN (
//           SELECT "Option_ID"
//           FROM "Question_Correct_Options"
//           WHERE "Question_ID" = qa."Question_ID"
//         )
//       )
//       THEN 1 ELSE 0
//     END AS is_correct
//   FROM "QuizAnswers" qa
//   WHERE qa."ActivitySession_ID" = $1
//   GROUP BY qa."Student_ID", qa."Question_ID"
// )

// SELECT
//   q."Question_ID",
//   q."Question_Text",
//   ROUND(AVG(sq.is_correct) * 100) AS correct_percent
// FROM "Questions" q
// JOIN "AssignedQuiz" aq
//   ON aq."Quiz_ID" = q."Set_ID"
// LEFT JOIN student_question sq
//   ON sq."Question_ID" = q."Question_ID"
// WHERE aq."ActivitySession_ID" = $1
// GROUP BY q."Question_ID", q."Question_Text"
// ORDER BY q."Question_ID";
// `, [activitySessionId]);

        /* =========================
   5️⃣ Student answers (ต่อคน ต่อข้อ)
========================= */
const studentAnswersRes = await db.query(`
WITH target_quiz AS (
  SELECT "Quiz_ID"
  FROM "AssignedQuiz"
  WHERE "ActivitySession_ID" = $1
  ORDER BY "AssignedQuiz_ID" DESC
  LIMIT 1
),
student_question AS (
  SELECT
    qa."Student_ID",
    qa."Question_ID",
    CASE
      WHEN COUNT(*) = (
        SELECT COUNT(*)
        FROM "Question_Correct_Options" qco
        WHERE qco."Question_ID" = qa."Question_ID"
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
  q."Question_ID",
  q."Question_Text",
  ROUND(AVG(sq.is_correct) * 100) AS correct_percent
FROM "Questions" q
JOIN target_quiz tq
  ON tq."Quiz_ID" = q."Set_ID"
LEFT JOIN student_question sq
  ON sq."Question_ID" = q."Question_ID"
GROUP BY q."Question_ID", q."Question_Text"
ORDER BY q."Question_ID";

`, [activitySessionId]);



      /* =========================
         4️⃣ Many Mistakes
         (ข้อที่ถูก < 50%)
      ========================= */
      const manyMistakes =
        studentAnswersRes.rows.filter(
          (q) => Number(q.correct_percent) < 50
        ).length;

      /* =========================
         FINAL PAYLOAD
      ========================= */
//       const report = {
//   students: studentsRes.rows,
//   overall: {
//     totalQuestion: Number(overallRes.rows[0]?.total_question ?? 0),
//     avgScore: Number(overallRes.rows[0]?.avg_score ?? 0),
//     avgTime: Number(overallRes.rows[0]?.avg_time ?? 0),
//     maxScore: Number(overallRes.rows[0]?.max_score ?? 0),
//     minScore: Number(overallRes.rows[0]?.min_score ?? 0),
//     manyMistakes,
//   },
//   eachQuestion: eachQuestionRes.rows.map((q) => ({
//     questionId: q.Question_ID,
//     text: q.Question_Text,
//     correctPercent: Number(q.correct_percent ?? 0),
//   })),
// };
        const report = {
  students: studentsRes.rows,
  overall: {
    totalQuestion: Number(overallRes.rows[0]?.total_question ?? 0),
    avgScore: Number(overallRes.rows[0]?.avg_score ?? 0),
    avgTime: Number(overallRes.rows[0]?.avg_time ?? 0),
    maxScore: Number(overallRes.rows[0]?.max_score ?? 0),
    minScore: Number(overallRes.rows[0]?.min_score ?? 0),
    manyMistakes,
  },
  eachQuestion: studentAnswersRes.rows.map((q) => ({
    questionId: q.Question_ID,
    text: q.Question_Text,
    correctPercent: Number(q.correct_percent ?? 0),
  })),
  studentAnswers: studentAnswersRes.rows, // ✅ เพิ่มตรงนี้
};

socket.emit("quiz_report_data", report);


console.log(
  "EachQuestion %",
  studentAnswersRes.rows.map(r => ({
    q: r.Question_ID,
    percent: r.correct_percent
  }))
);

socket.emit("quiz_report_data", report);


    } catch (err) {
      console.error("❌ get_quiz_report error:", err.message);
      socket.emit("quiz_report_data", {
        students: [],
        overall: {},
        eachQuestion: [],
      });
    }
  });
};
