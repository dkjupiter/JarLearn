import * as XLSX from "xlsx";

export default function exportQuizReportExcel(report) {
  if (!report) return;

  const wb = XLSX.utils.book_new();

  /* ======================
     Sheet 1 – Scores
  ====================== */
  const scoreSheet = XLSX.utils.json_to_sheet(
    buildScoreSheet(report.scores)
  );
  XLSX.utils.book_append_sheet(wb, scoreSheet, "Scores");

  /* ======================
     Sheet 2 – Answers
  ====================== */
  const answerRows = report.answerAnalytics.map((a, i) => ({
    Question: `Q${a.Question_ID}`,
    Question_Text: a.Question_Text,
    Option: a.Option_Text,
    Correct: a.is_correct ? "✔" : "✖",
    Percent: a.percent,
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

  /* ======================
     Sheet 3 – Overall
  ====================== */
  const o = report.overall;
  const overallRows = [
    { Metric: "Total Questions", Value: o.totalQuestion },
    { Metric: "Average Score", Value: o.avgScore },
    { Metric: "Average Time (mins)", Value: o.avgTime },
    { Metric: "Max Score", Value: o.maxScore },
    { Metric: "Min Score", Value: o.minScore },
    { Metric: "Many Mistakes", Value: o.manyMistakes },
    { Metric: "Attention", Value: o.attention.join(" | ") },
  ];
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(overallRows),
    "Overall"
  );

  XLSX.writeFile(wb, "quiz_report.xlsx");
}

/* ======================
   Helper: Sheet 1
====================== */
function buildScoreSheet(raw = []) {
  const map = {};

  raw.forEach((r) => {
    if (!map[r.Student_ID]) {
      map[r.Student_ID] = {
        Student_ID: r.Student_ID,
        Name: r.Student_Name,
        Correct: 0,
        Wrong: 0,
      };
    }

    const key = `Q${r.Question_ID}`;
    map[r.Student_ID][key] = r.is_correct ? "✔" : "✖";

    r.is_correct
      ? map[r.Student_ID].Correct++
      : map[r.Student_ID].Wrong++;
  });

  return Object.values(map).map((s) => ({
    ...s,
    Total: s.Correct,
  }));
}
