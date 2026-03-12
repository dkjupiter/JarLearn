let XLSX

export default async function exportClassReportExcel(report) {
  if (!report) return

  console.log("EXPORT DATA", report)

  if (!XLSX) {
    const mod = await import("xlsx-js-style")
    XLSX = mod.default
  }

  const {
    scores = [],
    quizSummary = [],
    quizAnswers = [],
    overall = {}
  } = report || {}

  const wb = XLSX.utils.book_new()

  /* ================= Students Summary ================= */

  const studentMap = {}
  const quizSet = new Set()
  const seen = new Set()

  scores.forEach(r => {

    const cleanTitle = r.quiz_title.replace(/[:\\/?*\[\]]/g, "")
    const quizKey = `${cleanTitle}_${r.ActivitySession_ID}`

    const uniqueKey =
      `${r.Student_Number}_${r.ActivitySession_ID}`

    if (seen.has(uniqueKey)) return
    seen.add(uniqueKey)

    quizSet.add(quizKey)

    if (!studentMap[r.Student_Number]) {
      studentMap[r.Student_Number] = {
        Student_Number: r.Student_Number,
        totalCorrect: 0,
        totalQuestion: 0
      }
    }

    studentMap[r.Student_Number][quizKey] =
      `${r.correct}/${r.total_question}`

    studentMap[r.Student_Number].totalCorrect += r.correct
    studentMap[r.Student_Number].totalQuestion += r.total_question

  })

  const quizList = [...quizSet]

  const studentRows = Object.values(studentMap).map(s => {

    quizList.forEach(q => {
      s[q] = s[q] ?? null
    })

    s.Avg_Score =
      s.totalQuestion
        ? Math.round((s.totalCorrect / s.totalQuestion) * 100)
        : null

    delete s.totalCorrect
    delete s.totalQuestion

    return s
  })

  studentRows.sort((a, b) => b.Avg_Score - a.Avg_Score)

  const sheet1 = XLSX.utils.json_to_sheet(studentRows)

  /* ⭐ format Avg_Score เป็น % */

  const range1 = XLSX.utils.decode_range(sheet1["!ref"])

  for (let R = 1; R <= range1.e.r; R++) {

    const cell =
      sheet1[XLSX.utils.encode_cell({
        r: R,
        c: range1.e.c
      })]

    if (cell) cell.z = '0"%"'

  }

  XLSX.utils.book_append_sheet(
    wb,
    sheet1,
    "Students Summary"
  )



  /* ================= Quiz Summary ================= */

  const quizRows = quizSummary.map(q => {

    const avg = q.avg_score ?? 0

    return {
      Quiz: q.quiz_title,
      Students: q.student_count,
      Avg_Score: Math.round(avg),
      Difficulty:
        avg >= 80 ? "Easy" :
          avg >= 50 ? "Medium" : "Hard"
    }

  })

  const sheet2 = XLSX.utils.json_to_sheet(quizRows)

  /* ⭐ format Avg_Score เป็น % */

  const range2 = XLSX.utils.decode_range(sheet2["!ref"])

  for (let R = 1; R <= range2.e.r; R++) {

    const cell = sheet2[XLSX.utils.encode_cell({
      r: R,
      c: 2 // column Avg_Score
    })]

    if (cell) cell.z = '0"%"'

  }

  XLSX.utils.book_append_sheet(
    wb,
    sheet2,
    "Quiz Summary"
  )



  /* ================= Quiz Question Analysis ================= */

  const quizMap = {}

  quizAnswers.forEach(r => {

    const cleanTitle = r.quiz_title.replace(/[:\\/?*\[\]]/g, "")
    const quizKey = `${cleanTitle} (#${r.ActivitySession_ID})`

    if (!quizMap[quizKey])
      quizMap[quizKey] = []

    quizMap[quizKey].push(r)

  })


  Object.entries(quizMap).forEach(([quizKey, sessionData], i) => {

    const rows = buildAnswerSheet(sessionData)

    const sheet = XLSX.utils.json_to_sheet(rows)

    styleAnswerSheet(sheet)

    XLSX.utils.book_append_sheet(
      wb,
      sheet,
      safeSheetName(quizKey, i)
    )

  })



  /* ================= Overall ================= */

  const overallRows = [

    { Metric: "Total Students", Value: overall.total_student ?? 0 },

    { Metric: "Total Quiz", Value: overall.total_quiz ?? 0 },

    { Metric: "Average Accuracy", Value: overall.avg_accuracy ?? 0 },

    { Metric: "Average Time", Value: overall.avg_time ?? 0 }

  ]

  const sheetLast = XLSX.utils.json_to_sheet(overallRows)

  const range3 = XLSX.utils.decode_range(sheetLast["!ref"])

  for (let R = 1; R <= range3.e.r; R++) {

    const cell =
      sheetLast[XLSX.utils.encode_cell({
        r: R,
        c: 1
      })]

    if (R === 3 && cell) cell.z = '0"%"'

  }

  XLSX.utils.book_append_sheet(
    wb,
    sheetLast,
    "Overall"
  )


  XLSX.writeFile(wb, "class_report.xlsx")
}

/* ================= Question Analysis Builder ================= */

// function buildAnswerSheet(data = []) {

//     const qMap = {}
//     let qIndex = 1

//     const rows = []
//     let currentQ = null

//     const questionTotals = {}

//     data.forEach(r => {

//         if (!questionTotals[r.Question_ID])
//             questionTotals[r.Question_ID] = 0

//         questionTotals[r.Question_ID] += Number(r.selected_count)

//     })

//     data.forEach(r => {

//         if (!qMap[r.Question_ID])
//             qMap[r.Question_ID] = `Q${qIndex++}`

//         const q = qMap[r.Question_ID]

//         if (currentQ && currentQ !== q)
//             rows.push({})

//         const total = questionTotals[r.Question_ID] || 1

//         const percent =
//             Math.round((Number(r.selected_count) / total) * 100)

//         // const difficulty =
//         //     percent >= 80 ? "Easy" :
//         //         percent >= 50 ? "Medium" : "Hard"

//         rows.push({

//             Question: q,
//             Question_Text: r.Question_Text,
//             Option: r.Option_Text,
//             Correct: r.is_correct ? 1 : 0,
//             Selected: r.selected_count,
//             Percent: percent,
//             // Difficulty: difficulty

//         })

//         currentQ = q

//     })

//     return rows
// }

function buildAnswerSheet(data = []) {

  const qMap = {}
  let qIndex = 1

  const rows = []
  let currentQ = null

  const questionTotals = {}

  /* total answers per question */

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

    const percent =
      Math.round((Number(r.selected_count) / total) * 100)

    rows.push({

      Question: q,
      Question_Text: r.Question_Text,
      Option_Text: r.Option_Text,
      Correct: r.is_correct ? "True" : "False",
      Selected_Count: r.selected_count,
      Percent: percent

    })

    currentQ = q

  })

  return rows
}


/* ================= Style ================= */
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

function safeSheetName(name, index) {

  const clean = name
    .replace(/[:\\\/\?\*\[\]]/g, "")

  const prefix = `Quiz${index + 1}-`

  return (prefix + clean).substring(0, 31)

}