// import React, { useState } from "react";

// export default function QuizReport({ quiz, onBack }) {
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

//   const [selectedQuestion, setSelectedQuestion] = useState(null);

//   // -------------------------------
//   // QUESTION ANALYSIS (ฝั่งขวา)
//   // -------------------------------
//   if (selectedQuestion) {
//     const questionDetail = {
//       text: `Question ${selectedQuestion}`,
//       avgTime: 12,
//       choices: [
//         { text: "Choice A", percent: 20 },
//         { text: "Choice B", percent: 45 },
//         { text: "Choice C", percent: 25 },
//         { text: "Choice D", percent: 10 },
//       ],
//     };

//     return (
//       <div className="space-y-4">
//         <h2 className="text-xl font-bold">วิเคราะห์เกม</h2>

//         <div className="bg-gray-200 rounded-xl p-4">
//           <div className="mb-3 font-medium">{questionDetail.text}</div>

//           {questionDetail.choices.map((c, i) => (
//             <div key={i} className="mb-2">
//               <div className="flex justify-between text-sm mb-1">
//                 <span>{c.text}</span>
//                 <span>{c.percent}%</span>
//               </div>
//               <div className="w-full bg-gray-300 rounded-full h-3">
//                 <div
//                   className="bg-gray-600 h-3 rounded-full"
//                   style={{ width: `${c.percent}%` }}
//                 />
//               </div>
//             </div>
//           ))}

//           <div className="text-sm mt-3">
//             time avg : {questionDetail.avgTime} sec
//           </div>
//         </div>

//         <button
//           onClick={() => setSelectedQuestion(null)}
//           className="w-full border rounded-lg py-2"
//         >
//           Back
//         </button>
//       </div>
//     );
//   }

//   // -------------------------------
//   // OVERVIEW REPORT (ฝั่งซ้าย)
//   // -------------------------------
//   return (
//     <div className="space-y-4">
//       <h2 className="text-2xl font-bold">Report</h2>
//       <div className="text-sm text-gray-600">{quiz.name}</div>

//       {/* Summary */}
//       <div className="bg-gray-200 rounded-xl p-4 space-y-1 text-sm">
//         <div>All Questions : {report.totalQuestions}</div>
//         <div>Average Score : {report.avgScore}%</div>
//         <div>Average Time : {report.avgTime} mins</div>
//         <div>Max : {report.maxScore}</div>
//         <div>Min : {report.minScore}</div>
//       </div>

//       {/* Each Question */}
//       <div className="space-y-2">
//         <div className="font-medium">Each Question</div>

//         {report.questions.map((q) => (
//           <div
//             key={q.id}
//             onClick={() => setSelectedQuestion(q.id)}
//             className="cursor-pointer"
//           >
//             <div className="flex justify-between text-sm mb-1">
//               <span>{q.id}</span>
//               <span>{q.correctPercent}%</span>
//             </div>
//             <div className="w-full bg-gray-300 rounded-full h-3">
//               <div
//                 className="bg-gray-600 h-3 rounded-full"
//                 style={{ width: `${q.correctPercent}%` }}
//               />
//             </div>
//           </div>
//         ))}
//       </div>

//       <button className="w-full bg-gray-500 text-white rounded-lg py-2">
//         Export CSV
//       </button>

//       <button
//         onClick={onBack}
//         className="w-full border rounded-lg py-2"
//       >
//         Back
//       </button>
//     </div>
//   );
// }
