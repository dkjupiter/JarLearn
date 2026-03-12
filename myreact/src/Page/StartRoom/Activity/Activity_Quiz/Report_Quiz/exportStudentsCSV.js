let XLSX;

export default async function exportQuizReportExcel(report) {
  
  if (!report) return;

  if (!XLSX) {
    const mod = await import("xlsx-js-style");
    XLSX = mod.default;
  }

  const wb = XLSX.utils.book_new();

  /* ================= Scores ================= */

  const scores = buildScoreSheet(report.students);
  const scoreSheet = XLSX.utils.json_to_sheet(scores);

  styleScoreSheet(scoreSheet);

  XLSX.utils.book_append_sheet(wb, scoreSheet, "Scores");


  /* ================= Answers ================= */

  const answers = buildAnswerSheet(report.answerAnalytics);
  const answerSheet = XLSX.utils.json_to_sheet(answers);

  styleAnswerSheet(answerSheet);

  XLSX.utils.book_append_sheet(wb, answerSheet, "Answers");


  /* ================= Overall ================= */

  const overall = buildOverallSheet(report);
  const overallSheet = XLSX.utils.json_to_sheet(overall);

  XLSX.utils.book_append_sheet(wb, overallSheet, "Overall");


  XLSX.writeFile(wb, "quiz_report.xlsx");

}


/* =================================
   Scores Sheet
================================= */

function buildScoreSheet(raw = []) {

  const map = {};
  const qMap = {};
  let qIndex = 1;

  /* build student data */

  raw.forEach(r => {

    if (!qMap[r.Question_ID]) {
      qMap[r.Question_ID] = `Q${qIndex++}`;
    }

    if (!map[r.Student_ID]) {

      map[r.Student_ID] = {
        Student_Number: r.Student_Number,
        Correct: 0,
        Wrong: 0
      };

    }

    const key = qMap[r.Question_ID];

    map[r.Student_ID][key] =
      r.is_correct ? "True" : "False";

    if (r.is_correct)
      map[r.Student_ID].Correct++;
    else
      map[r.Student_ID].Wrong++;

  });

  /* convert to array */

  const rows = Object.values(map).map(s => ({
    ...s,
    Total: s.Correct
  }));

  /* sort by score */

  rows.sort((a, b) => b.Total - a.Total);

  /* add rank */

  rows.forEach((r, i) => {
    r.Rank = i + 1;
  });

  return rows;
}


/* =================================
   Answers Sheet
================================= */
function buildAnswerSheet(data = []) {

  const qMap = {}
  let qIndex = 1

  const rows = []
  let currentQ = null

  /* คำนวณจำนวนคนตอบต่อข้อ */
  const questionTotals = {}

  data.forEach(r => {

    if (!questionTotals[r.Question_ID])
      questionTotals[r.Question_ID] = 0

    questionTotals[r.Question_ID] += Number(r.selected_count)

  })

  data.forEach(r => {

    if (!qMap[r.Question_ID])
      qMap[r.Question_ID] = `Q${qIndex++}`

    const q = qMap[r.Question_ID]

    if (currentQ && currentQ !== q)
      rows.push({})

    const total = questionTotals[r.Question_ID] || 1

    rows.push({

      Question: q,

      Question_Text: r.Question_Text,

      Option_Text: r.Option_Text,

      Correct: r.is_correct ? "True" : "False",

      Selected_Count: r.selected_count,

      Percent: Math.round((Number(r.selected_count) / total) * 100)

    })

    currentQ = q

  })

  return rows
}

/* =================================
   Overall Sheet
================================= */
function buildOverallSheet(report) {

  const students = report.students || []
  const totalQuestions = report.eachQuestion?.length || 0

  const scoreMap = {}

  students.forEach(s => {

    if (!scoreMap[s.Student_ID])
      scoreMap[s.Student_ID] = 0

    if (s.is_correct)
      scoreMap[s.Student_ID]++

  })

  const scores = Object.values(scoreMap)

  const avg = scores.length
    ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2)
    : 0

  const max = scores.length ? Math.max(...scores) : 0
  const min = scores.length ? Math.min(...scores) : 0

  return [

    { Metric: "Total Questions", Value: totalQuestions },
    { Metric: "Total Students", Value: scores.length },
    { Metric: "Average Score", Value: avg },
    { Metric: "Average Time (seconds)", Value: report.overall?.avgTime ?? 0 },
    { Metric: "Max Score", Value: max },
    { Metric: "Min Score", Value: min }

  ]

}

/* =================================
   Styles
================================= */
function styleScoreSheet(sheet) {

  const range = XLSX.utils.decode_range(sheet["!ref"]);

  for (let R = range.s.r; R <= range.e.r; ++R) {

    for (let C = range.s.c; C <= range.e.c; ++C) {

      const cell = sheet[XLSX.utils.encode_cell({ r: R, c: C })];
      if (!cell) continue;

      /* header */
      if (R === 0) {
        cell.s = {
          font: { bold: true },
          fill: { fgColor: { rgb: "D9D9D9" } },
          alignment: { horizontal: "center" }
        };
      }

      /* correct */
      if (cell.v === "True") {
        cell.s = {
          font: { bold: true },
          fill: { fgColor: { rgb: "C6EFCE" } },
          alignment: { horizontal: "center" }
        };
      }

      /* wrong */
      if (cell.v === "False") {
        cell.s = {
          font: { bold: true },
          fill: { fgColor: { rgb: "FFC7CE" } },
          alignment: { horizontal: "center" }
        };
      }

    }

  }

  sheet["!cols"] = [
    { wch: 15 }, // student
    { wch: 5 },
    { wch: 5 },
    { wch: 5 },
    { wch: 8 },
    { wch: 8 },
    { wch: 8 }
  ];

}

function styleAnswerSheet(sheet) {

  const range = XLSX.utils.decode_range(sheet["!ref"]);
  const merges = []

  let startRow = 1
  let currentQuestion = null

  /* header */
  for (let C = range.s.c; C <= range.e.c; ++C) {
    sheet[XLSX.utils.encode_cell({ r: 0, c: C })].s = {
      font: { bold: true },
      fill: { fgColor: { rgb: "D9D9D9" } },
      alignment: { horizontal: "center" }
    };
  }


  for (let R = 1; R <= range.e.r; ++R) {

    const qCell =
      sheet[XLSX.utils.encode_cell({ r: R, c: 0 })]

    const correctCell =
      sheet[XLSX.utils.encode_cell({ r: R, c: 3 })]

    const percentCell =
      sheet[XLSX.utils.encode_cell({ r: R, c: 5 })]

    if (qCell) {

      if (currentQuestion === null)
        currentQuestion = qCell.v

      if (qCell.v !== currentQuestion) {

        merges.push({
          s: { r: startRow, c: 0 },
          e: { r: R - 2, c: 0 }
        })

        merges.push({
          s: { r: startRow, c: 1 },
          e: { r: R - 2, c: 1 }
        })

        startRow = R
        currentQuestion = qCell.v

      }

      qCell.s = {
        font: { bold: true },
        fill: { fgColor: { rgb: "BDD7EE" } },
        alignment: { vertical: "center", horizontal: "center" }
      }

    }

    if (correctCell) {

      if (correctCell.v === "True") {

        correctCell.s = {
          fill: { fgColor: { rgb: "C6EFCE" } },
          alignment: { horizontal: "center" }
        }

      } else {

        correctCell.s = {
          fill: { fgColor: { rgb: "FFC7CE" } },
          alignment: { horizontal: "center" }
        }

      }

    }

    /* Highlight distractor */

    if (percentCell && percentCell.v >= 30 && correctCell?.v === "False") {

      percentCell.s = {
        fill: { fgColor: { rgb: "F8CBAD" } }
      }

    }

    if (percentCell) {
      percentCell.z = '0"%"'
    }

  }

  merges.push({
    s: { r: startRow, c: 0 },
    e: { r: range.e.r, c: 0 }
  })

  merges.push({
    s: { r: startRow, c: 1 },
    e: { r: range.e.r, c: 1 }
  })

  sheet["!merges"] = merges

  sheet["!cols"] = [
    { wch: 8 },
    { wch: 15 },
    { wch: 12 },
    { wch: 8 },
    { wch: 15 },
    { wch: 10 }
  ]

}