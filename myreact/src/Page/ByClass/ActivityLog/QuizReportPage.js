// // QuizReportPage.jsx
// import React, { useState, useEffect } from "react";
// import QuestionAnalysisPage from "./QuestionAnalysisPage";

// export default function QuizReportPage({
//   quiz,
//   requestBack,
//   onBackHandled,
//   onExitReport,
// }) {
//   const [questionId, setQuestionId] = useState(null);

//   const report = {
//     totalQuestions: 20,
//     avgScore: 80,
//     avgTime: 10,
//     maxScore: 18,
//     minScore: 0,
//     questions: [
//       { id: 1, correctPercent: 80 },
//       { id: 2, correctPercent: 75 },
//       { id: 3, correctPercent: 100 },
//     ],
//   };

//   // 🔥 ฟังปุ่ม Back จาก ActivityLogPage (logic ใหม่)
//   useEffect(() => {
//     if (!requestBack) return;

//     if (questionId !== null) {
//       // 🔙 QuestionAnalysis → Report
//       setQuestionId(null);
//       onBackHandled?.();
//     } else {
//       // 🔙 Report → QuizTab
//       onExitReport?.();
//       onBackHandled?.();
//     }
//   }, [requestBack, questionId, onBackHandled, onExitReport]);

//   // 🔹 หน้า QuestionAnalysis (UI เดิมของมัน)
//   if (questionId !== null) {
//     return <QuestionAnalysisPage questionId={questionId} />;
//   }

//   // 🔹 หน้า Report (UI เดิม 100%)
//   return (
//     <div className="max-w-md mx-auto space-y-5">
//       <h2 className="text-2xl font-bold text-center">Report</h2>

//       <div className="text-center text-sm text-gray-600">
//         {quiz.name}
//       </div>

//       {/* chart placeholder */}
//       <div className="bg-gray-200 rounded-xl h-40 flex items-center justify-center">
//         📊
//       </div>

//       {/* summary */}
//       <div className="border rounded-xl p-4 text-sm space-y-1">
//         <div>All Question : {report.totalQuestions}</div>
//         <div>Average Score : {report.avgScore}%</div>
//         <div>Average Time : {report.avgTime} mins</div>
//         <div>Max : {report.maxScore} | Min : {report.minScore}</div>
//       </div>

//       {/* each question */}
//       <div>
//         <div className="font-medium mb-2">Each Question</div>
//         <div className="space-y-2">
//           {report.questions.map((q) => (
//             <div
//               key={q.id}
//               onClick={() => setQuestionId(q.id)}
//               className="cursor-pointer"
//             >
//               <div className="flex justify-between text-sm">
//                 <span>{q.id}</span>
//                 <span>{q.correctPercent}%</span>
//               </div>
//               <div className="h-3 bg-gray-300 rounded-full">
//                 <div
//                   className="h-3 bg-gray-600 rounded-full"
//                   style={{ width: `${q.correctPercent}%` }}
//                 />
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       <button className="w-full bg-gray-500 text-white rounded-lg py-2">
//         Export CSV
//       </button>
//     </div>
//   );
// }


// QuizReportPage.jsx
import React, { useState, useEffect } from "react";
import QuestionAnalysisPage from "./QuestionAnalysisPage";

export default function QuizReportPage({
  quiz,
  requestBack,
  onBackHandled,
  onExitReport,
}) {
  const [questionId, setQuestionId] = useState(null);

  const report = {
    totalQuestions: 20,
    avgScore: 80,
    avgTime: 10,
    maxScore: 18,
    minScore: 0,
    questions: [
      { id: 1, correctPercent: 80 },
      { id: 2, correctPercent: 75 },
      { id: 3, correctPercent: 100 },
    ],
  };

  // 🔥 ฟังปุ่ม Back จาก ActivityLogPage
  useEffect(() => {
    if (!requestBack) return;

    if (questionId !== null) {
      // 🔙 QuestionAnalysis → Report
      setQuestionId(null);
      onBackHandled?.();
    } else {
      // 🔙 Report → QuizTab
      onExitReport?.();
      onBackHandled?.();
    }
  }, [requestBack, questionId, onBackHandled, onExitReport]);

  // 🔥 ตรงนี้แหละที่ถามมา
  // ถ้าเลือก question แล้ว → เข้า QuestionAnalysisPage
  if (questionId !== null) {
    return (
      <QuestionAnalysisPage
        focusedQuestionId={questionId}
      />
    );
  }

  // 🔹 หน้า Report
  return (
    <div className="max-w-md mx-auto space-y-5">
      <h2 className="text-2xl font-bold text-center">Report</h2>

      <div className="text-center text-sm text-gray-600">
        {quiz?.name}
      </div>

      {/* chart placeholder */}
      <div className="bg-gray-200 rounded-xl h-40 flex items-center justify-center">
        📊
      </div>

      {/* summary */}
      <div className="border rounded-xl p-4 text-sm space-y-1">
        <div>All Question : {report.totalQuestions}</div>
        <div>Average Score : {report.avgScore}%</div>
        <div>Average Time : {report.avgTime} mins</div>
        <div>Max : {report.maxScore} | Min : {report.minScore}</div>
      </div>

      {/* each question */}
      <div>
        <div className="font-medium mb-2">Each Question</div>
        <div className="space-y-2">
          {report.questions.map((q) => (
            <div
              key={q.id}
              onClick={() => setQuestionId(q.id)}
              className="cursor-pointer"
            >
              <div className="flex justify-between text-sm">
                <span>Question {q.id}</span>
                <span>{q.correctPercent}%</span>
              </div>
              <div className="h-3 bg-gray-300 rounded-full">
                <div
                  className="h-3 bg-gray-600 rounded-full"
                  style={{ width: `${q.correctPercent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <button className="w-full bg-gray-500 text-white rounded-lg py-2">
        Export CSV
      </button>
    </div>
  );
}
