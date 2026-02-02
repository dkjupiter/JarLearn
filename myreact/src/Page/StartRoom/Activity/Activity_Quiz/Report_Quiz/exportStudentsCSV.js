// import * as XLSX from "xlsx";

// function exportQuizReportExcel({
//   studentAnswers,
//   eachQuestion,
//   overall,
// }) {
//   if (!studentAnswers || studentAnswers.length === 0) {
//     console.warn("No student answers to export");
//     return;
//   }

//   const wb = XLSX.utils.book_new();

//   /* =====================
//      Sheet 1: Student Answers
//   ===================== */
//   const studentAnswerSheet = XLSX.utils.json_to_sheet(
//     buildStudentAnswerSheet(studentAnswers, eachQuestion)
//   );

//   XLSX.utils.book_append_sheet(
//     wb,
//     studentAnswerSheet,
//     "Student_Answers"
//   );

//   /* =====================
//      Sheet 2: Questions
//   ===================== */
//   const questionSheet = XLSX.utils.json_to_sheet(
//     eachQuestion.map((q, i) => ({
//       Question_No: i + 1,
//       Question_Text: q.text,
//       Correct_Percent: q.correctPercent,
//     }))
//   );
//   XLSX.utils.book_append_sheet(wb, questionSheet, "Questions");

//   /* =====================
//      Sheet 3: Overall
//   ===================== */
//   const overallSheet = XLSX.utils.json_to_sheet([
//     { Metric: "Total Questions", Value: overall.totalQuestion },
//     { Metric: "Average Score", Value: overall.avgScore },
//     { Metric: "Average Time (mins)", Value: overall.avgTime },
//     { Metric: "Max Score", Value: overall.maxScore },
//     { Metric: "Min Score", Value: overall.minScore },
//     { Metric: "Many Mistakes", Value: overall.manyMistakes },
//   ]);
//   XLSX.utils.book_append_sheet(wb, overallSheet, "Overall");

//   /* =====================
//      Export file
//   ===================== */
//   XLSX.writeFile(wb, "quiz_report.xlsx");
// }

// export default exportQuizReportExcel;

// /* =====================
//    Helper
// ===================== */
// function buildStudentAnswerSheet(raw, questions) {
//   const map = {};

//   raw.forEach((r) => {
//     if (!map[r.Student_ID]) {
//       map[r.Student_ID] = {
//         Student_ID: r.Student_ID,
//         Name: r.Student_Name,
//         Correct: 0,
//         Wrong: 0,
//       };
//     }

//     const qIndex = questions.findIndex(
//       (q) => q.questionId === r.Question_ID
//     );

//     const key = `Q${qIndex + 1}`;
//     map[r.Student_ID][key] = r.is_correct ? "✔" : "✖";

//     if (r.is_correct) map[r.Student_ID].Correct++;
//     else map[r.Student_ID].Wrong++;
//   });

//   return Object.values(map).map((s) => ({
//     ...s,
//     Total_Percent: Math.round(
//       (s.Correct / (s.Correct + s.Wrong)) * 100
//     ),
//   }));
// }

import * as XLSX from "xlsx";

export default function exportQuizReportExcel(report) {
  if (!report) return;

   const {
    studentAnswers = [],
    eachQuestion = [],
    overall = {},
    answerAnalytics = [],
  } = report;

  const wb = XLSX.utils.book_new();

  /* ======================
     Sheet 1: Scores
  ====================== */
  const scoreRows = buildScoreSheet(
    report.studentAnswers,
    report.eachQuestion
  );
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(scoreRows),
    "Scores"
  );

  /* ======================
     Sheet 2: Answers
  ====================== */
  if (answerAnalytics.length > 0) {
  const answerRows = answerAnalytics.map((a) => ({
    Question: `Q${a.questionIndex}`,
    Question_Text: a.questionText,
    Option: a.Option_Text,
    Percent: a.percent,
    Correct: a.is_correct ? "✔" : "✖",
    Difficulty:
      a.percent >= 80
        ? "Easy"
        : a.percent >= 50
        ? "Medium"
        : "Hard",
  }));

  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(answerRows),
    "Answers"
  );
}


  /* ======================
     Sheet 3: Overall
  ====================== */
  const o = report.overall ?? {};
  const overallRows = [
    { Metric: "Total Questions", Value: o.totalQuestion },
    { Metric: "Average Score", Value: o.avgScore },
    { Metric: "Average Time (mins)", Value: o.avgTime },
    { Metric: "Max Score", Value: o.maxScore },
    { Metric: "Min Score", Value: o.minScore },
    { Metric: "Many Mistakes", Value: o.manyMistakes },
  ];
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(overallRows),
    "Overall"
  );

  XLSX.writeFile(wb, "quiz_report.xlsx");
} 

function buildScoreSheet(studentAnswers = [], questions = []) {
  if (!studentAnswers.length || !questions.length) return [];
  const map = {};

  studentAnswers.forEach((r) => {
    if (!map[r.Student_ID]) {
      map[r.Student_ID] = {
        Student_ID: r.Student_ID,
        Name: r.Student_Name,
        Correct: 0,
        Wrong: 0,
      };
    }

    const qIndex = questions.findIndex(
      (q) => q.questionId === r.Question_ID
    );
    const key = `Q${qIndex + 1}`;

    map[r.Student_ID][key] = r.is_correct ? "✔" : "✖";

    r.is_correct
      ? map[r.Student_ID].Correct++
      : map[r.Student_ID].Wrong++;
  });

  return Object.values(map).map((s) => ({
    ...s,
    Total_Score: s.Correct,
  }));
}
