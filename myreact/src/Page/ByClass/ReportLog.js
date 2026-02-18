// "use client";
// import React, { useEffect, useState } from "react";
// import { socket } from "../../socket"; // ปรับ path ให้ตรงโปรเจคเธอ

// export default function ReportLog({ classId }) {
//   const [sessions, setSessions] = useState([]);
//   const [selectedSession, setSelectedSession] = useState(null);
//   const [report, setReport] = useState(null);

//   /* ================================
//      โหลด session ที่จบแล้วของคลาส
//   ================================== */
//   useEffect(() => {
//     socket.emit("get_finished_quiz_sessions", { classId });

//     socket.on("finished_quiz_sessions_data", (data) => {
//       setSessions(data);
//       if (data.length > 0) {
//         setSelectedSession(data[0].ActivitySession_ID);
//       }
//     });

//     return () => {
//       socket.off("finished_quiz_sessions_data");
//     };
//   }, [classId]);

//   /* ================================
//      โหลด report ของ session ที่เลือก
//   ================================== */
//   useEffect(() => {
//     if (!selectedSession) return;

//     socket.emit("get_quiz_report", {
//       activitySessionId: selectedSession,
//     });

//     socket.on("quiz_report_data", (data) => {
//       setReport(data);
//     });

//     return () => {
//       socket.off("quiz_report_data");
//     };
//   }, [selectedSession]);

//   if (!report) {
//     return <div className="p-6">Loading report...</div>;
//   }

//   return (
//     <div className="px-6 pt-6 pb-40 space-y-6">

//       <h2 className="text-3xl font-bold text-center">
//         Class Report
//       </h2>

//       {/* ================= Session Selector ================= */}
//       <div className="flex justify-center">
//         <select
//           className="border px-4 py-2 rounded-lg"
//           value={selectedSession}
//           onChange={(e) => setSelectedSession(e.target.value)}
//         >
//           {sessions.map((s) => (
//             <option key={s.ActivitySession_ID} value={s.ActivitySession_ID}>
//               {s.quiz_name} ({new Date(s.Ended_At).toLocaleDateString()})
//             </option>
//           ))}
//         </select>
//       </div>

//       {/* ================= Chart ================= */}
//       <div className="border rounded-2xl p-4">
//         <h3 className="font-semibold mb-3">
//           Total Score Ranking
//         </h3>

//         {report.scores.map((s) => (
//           <div key={s.Student_ID} className="mb-3">
//             <div className="flex justify-between text-sm">
//               <span>{s.Student_Name}</span>
//               <span>{s.Total_Score}</span>
//             </div>
//             <div className="h-4 bg-gray-200 rounded-full">
//               <div
//                 className="h-4 bg-blue-500 rounded-full"
//                 style={{ width: `${s.Total_Score}%` }}
//               />
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* ================= Overall ================= */}
//       <div className="border rounded-2xl p-4 space-y-2">
//         <h3 className="text-xl font-semibold">Overall</h3>

//         <div className="flex justify-between">
//           <span>Total Questions</span>
//           <span>{report.overall.totalQuestion}</span>
//         </div>

//         <div className="flex justify-between">
//           <span>Average Score</span>
//           <span>{report.overall.avgScore}%</span>
//         </div>

//         <div className="flex justify-between">
//           <span>Average Time</span>
//           <span>{report.overall.avgTime} sec</span>
//         </div>

//         <div className="flex justify-between">
//           <span>Max Score</span>
//           <span>{report.overall.maxScore}</span>
//         </div>

//         <div className="flex justify-between">
//           <span>Min Score</span>
//           <span>{report.overall.minScore}</span>
//         </div>

//         <div className="flex justify-between">
//           <span>Questions with many mistakes</span>
//           <span>{report.overall.manyMistakes}</span>
//         </div>
//       </div>

//       {/* ================= Each Question ================= */}
//       <div className="border rounded-2xl p-4 space-y-3">
//         <h3 className="text-xl font-semibold">Each Question</h3>

//         {report.eachQuestion.map((q, index) => (
//           <div key={q.Question_ID}>
//             <div className="flex justify-between text-sm mb-1">
//               <span>Q{index + 1}</span>
//               <span>{q.correct_percent ?? 0}%</span>
//             </div>

//             <div className="h-4 bg-gray-200 rounded-full">
//               <div
//                 className="h-4 bg-green-500 rounded-full"
//                 style={{ width: `${q.correct_percent ?? 0}%` }}
//               />
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* ================= Export CSV ================= */}
//       <button
//         onClick={() => {
//           const csv = report.scores.map(
//             (s) => `${s.Student_Name},${s.Total_Score}`
//           ).join("\n");

//           const blob = new Blob([csv], { type: "text/csv" });
//           const url = window.URL.createObjectURL(blob);

//           const a = document.createElement("a");
//           a.href = url;
//           a.download = "class_report.csv";
//           a.click();
//         }}
//         className="fixed bottom-24 left-1/2 -translate-x-1/2 w-72 py-3 bg-blue-600 text-white rounded-lg text-lg"
//       >
//         Export CSV
//       </button>
//     </div>
//   );
// }

// "use client";
// import React, { useEffect, useState } from "react";
// import { socket } from "../../socket";

// export default function ClassReport({ classId }) {

//   const [report, setReport] = useState(null);

//   useEffect(() => {
//     socket.emit("get_class_report", { classId });
//     console.log("classId:", classId);

//     socket.on("class_report_data", (data) => {
//       setReport(data);
//     });
//     console.log("Received class_report_data:", report);

//     return () => {
//       socket.off("class_report_data");
//     };
//   }, [classId]);

//   if (!report) return <div>Loading...</div>;

//   return (
//     <div className="px-6 pt-6 pb-40 space-y-6">

//       <h2 className="text-3xl font-bold text-center">
//         Class Report (All Quiz Combined)
//       </h2>

//       {/* ================= Overall ================= */}
//       <div className="border rounded-2xl p-4 space-y-2">
//         <h3 className="text-xl font-semibold">Overall</h3>

//         <div className="flex justify-between">
//           <span>Total Students</span>
//           <span>{report.overall.totalStudent}</span>
//         </div>

//         <div className="flex justify-between">
//           <span>Total Quiz Sessions</span>
//           <span>{report.overall.totalQuiz}</span>
//         </div>

//         <div className="flex justify-between">
//           <span>Average Score</span>
//           <span>{report.overall.avgScore}%</span>
//         </div>

//         <div className="flex justify-between">
//           <span>Average Time</span>
//           <span>{report.overall.avgTime} sec</span>
//         </div>

//         <div className="flex justify-between">
//           <span>Max Score</span>
//           <span>{report.overall.maxScore}</span>
//         </div>

//         <div className="flex justify-between">
//           <span>Min Score</span>
//           <span>{report.overall.minScore}</span>
//         </div>
//       </div>

//       {/* ================= Ranking ================= */}
//       <div className="border rounded-2xl p-4">
//         <h3 className="text-xl font-semibold mb-3">
//           Total Score Ranking (All Quiz)
//         </h3>

//         {report.students.map((s) => (
//           <div key={s.Student_ID} className="mb-3">
//             <div className="flex justify-between text-sm">
//               <span>{s.Student_Name}</span>
//               <span>{s.total_score}</span>
//             </div>

//             <div className="h-4 bg-gray-200 rounded-full">
//               <div
//                 className="h-4 bg-blue-600 rounded-full"
//                 style={{ width: `${s.avg_score}%` }}
//               />
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// "use client";
// import React, { useEffect, useState } from "react";
// import { socket } from "../../socket";

// export default function ReportLog({ classId }) {
//   const [report, setReport] = useState({
//     overall: {},
//     eachQuiz: []
//   });

//   useEffect(() => {
//     socket.emit("get_class_report", { classId });

//     const handler = (data) => {
//       console.log("DATA FROM SERVER:", data);
//       setReport(data);
//     };

//     socket.on("class_report_data", handler);


//     return () => {
//       socket.off("class_report_data", handler);
//     };
//   }, [classId]);

//   if (!report || !report.overall) {
//     return <div>Loading...</div>;
//   }


//   return (
//     <div className="px-6 pt-6 pb-40 space-y-6">

//       <h2 className="text-3xl font-bold text-center">
//         Report
//       </h2>

//       {/* ================= Overall ================= */}
//       <div className="border-2 border-black rounded-2xl p-6 space-y-3">

//         <h3 className="text-xl font-semibold">Overall</h3>

//         <div className="flex justify-between">
//           <span>Student :</span>
//           <span>{report.overall.totalStudent}</span>
//         </div>

//         <div className="flex justify-between">
//           <span>Already Done :</span>
//           <span>
//             {report.overall.alreadyDone} ({report.overall.alreadyDonePercent}%)
//           </span>
//         </div>

//         <div className="flex justify-between">
//           <span>Number of Quiz :</span>
//           <span>{report.overall.totalQuiz}</span>
//         </div>

//         <div className="flex justify-between">
//           <span>Average Score :</span>
//           <span>{report.overall.avgScore}%</span>
//         </div>

//         <div className="flex justify-between">
//           <span>Average Time :</span>
//           <span>{report.overall.avgTime} sec</span>
//         </div>
//       </div>

//       {/* ================= Each Quiz ================= */}
//       <div className="border-2 border-black rounded-2xl p-6 space-y-4">

//         <h3 className="text-xl font-semibold">Each Quiz</h3>

//         {Array.isArray(report.eachQuiz) && report.eachQuiz.map((quiz) =>  (
//           <div key={quiz.ActivitySession_ID}>
//             <div className="flex justify-between text-sm mb-1">
//               <span>{quiz.Title}</span>
//               <span>{quiz.avg_score ?? 0}%</span>
//             </div>

//             <div className="h-4 bg-gray-300 rounded-full">
//               <div
//                 className="h-4 bg-gray-500 rounded-full"
//                 style={{ width: `${quiz.avg_score ?? 0}%` }}
//               />
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }
"use client";
import React, { useEffect, useState } from "react";
import { socket } from "../../socket";

export default function ReportLog({ classId }) {
  const [report, setReport] = useState(null);

  useEffect(() => {
    socket.emit("get_class_report", { classId });

    const handler = (data) => {
      setReport(data);
    };

    socket.on("class_report_data", handler);

    return () => {
      socket.off("class_report_data", handler);
    };
  }, [classId]);

  if (!report || !report.overall) {
    return <div className="p-6">Loading...</div>;
  }

  const { overall, eachQuiz } = report;

  const bestQuiz =
    eachQuiz?.reduce((max, q) =>
      q.avg_score > (max?.avg_score ?? 0) ? q : max,
    null) || null;

  const worstQuiz =
    eachQuiz?.reduce((min, q) =>
      q.avg_score < (min?.avg_score ?? 100) ? q : min,
    null) || null;

  return (
    <div className="px-6 pt-6 pb-32 max-w-4xl mx-auto space-y-8">

      {/* ===== Title ===== */}
      <h2 className="text-3xl font-bold text-center">
        Class Report
      </h2>

      {/* ===== KPI Cards ===== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

        <div className="bg-white shadow rounded-xl p-4 text-center">
          <p className="text-2xl font-bold">{overall.totalStudent}</p>
          <p className="text-sm text-gray-500">Students</p>
        </div>

        <div className="bg-white shadow rounded-xl p-4 text-center">
          <p className="text-2xl font-bold">{overall.totalQuiz}</p>
          <p className="text-sm text-gray-500">Quiz Sessions</p>
        </div>

        <div className="bg-white shadow rounded-xl p-4 text-center">
          <p className="text-2xl font-bold">{overall.avgScore}%</p>
          <p className="text-sm text-gray-500">Average Score</p>
        </div>

        <div className="bg-white shadow rounded-xl p-4 text-center">
          <p className="text-2xl font-bold">{overall.avgTime}s</p>
          <p className="text-sm text-gray-500">Average Time</p>
        </div>

      </div>

      {/* ===== Completion Section ===== */}
      <div className="bg-white shadow rounded-xl p-6 space-y-4">

        <h3 className="text-lg font-semibold">
          Completion Rate
        </h3>

        <div className="flex justify-between text-sm">
          <span>
            {overall.alreadyDone} students completed all quizzes
          </span>
          <span>{overall.alreadyDonePercent}%</span>
        </div>

        <div className="h-4 bg-gray-200 rounded-full">
          <div
            className="h-4 bg-blue-600 rounded-full"
            style={{
              width: `${Math.min(
                overall.alreadyDonePercent,
                100
              )}%`,
            }}
          />
        </div>

      </div>

      {/* ===== Quiz Performance ===== */}
      <div className="bg-white shadow rounded-xl p-6 space-y-6">

        <h3 className="text-lg font-semibold">
          Quiz Performance
        </h3>

        {eachQuiz?.map((quiz) => (
          <div key={quiz.ActivitySession_ID}>
            <div className="flex justify-between text-sm mb-1">
              <span>{quiz.Title}</span>
              <span>{quiz.avg_score ?? 0}%</span>
            </div>

            <div className="h-4 bg-gray-200 rounded-full">
              <div
                className="h-4 bg-gray-500 rounded-full"
                style={{
                  width: `${Math.min(
                    quiz.avg_score ?? 0,
                    100
                  )}%`,
                }}
              />
            </div>
          </div>
        ))}

        {/* ===== Highlight ===== */}
        <div className="pt-4 border-t text-sm text-gray-600 space-y-1">
          {bestQuiz && (
            <p>
              🏆 Best Quiz: <b>{bestQuiz.Title}</b> ({bestQuiz.avg_score}%)
            </p>
          )}
          {worstQuiz && (
            <p>
              ⚠️ Most Difficult: <b>{worstQuiz.Title}</b> ({worstQuiz.avg_score}%)
            </p>
          )}
        </div>

      </div>

    </div>
  );
}
