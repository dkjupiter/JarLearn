// "use client";
// import React, { useEffect, useState } from "react";
// import { socket } from "../../socket";

// export default function ReportLog({ classId }) {
//   const [report, setReport] = useState(null);

//   useEffect(() => {
//     socket.emit("get_class_report", { classId });

//     const handler = (data) => {
//       setReport(data);
//     };

//     socket.on("class_report_data", handler);
//     return () => socket.off("class_report_data", handler);
//   }, [classId]);

//   if (!report || !report.overall) {
//     return (
//       <div className="flex justify-center items-center h-40 text-slate-400">
//         Loading report...
//       </div>
//     );
//   }

//   const { overall, eachQuiz } = report;

//   const bestQuiz =
//     eachQuiz?.reduce((max, q) =>
//       q.avg_score > (max?.avg_score ?? 0) ? q : max,
//     null) || null;

//   const worstQuiz =
//     eachQuiz?.reduce((min, q) =>
//       q.avg_score < (min?.avg_score ?? 100) ? q : min,
//     null) || null;

//   return (
//     <div className="bg-slate-900 text-slate-100 min-h-screen px-6 pt-6 pb-32 max-w-4xl mx-auto space-y-8">

//       {/* ===== Title ===== */}
//       <h2 className="text-3xl font-bold text-center">
//         Class Report
//       </h2>

//       {/* ===== KPI Cards ===== */}
//       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//         {[
//           { label: "Students", value: overall.totalStudent },
//           { label: "Quiz Sessions", value: overall.totalQuiz },
//           { label: "Average Score", value: `${overall.avgScore}%` },
//           { label: "Average Time", value: `${overall.avgTime}s` },
//         ].map((kpi, i) => (
//           <div
//             key={i}
//             className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-center
//                        hover:shadow-lg hover:shadow-cyan-400/10 transition"
//           >
//             <p className="text-2xl font-bold text-cyan-400">{kpi.value}</p>
//             <p className="text-sm text-slate-400">{kpi.label}</p>
//           </div>
//         ))}
//       </div>

//       {/* ===== Completion Section ===== */}
//       <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-4">
//         <h3 className="text-lg font-semibold">Completion Rate</h3>

//         <div className="flex justify-between text-sm text-slate-400">
//           <span>
//             {overall.alreadyDone} students completed all quizzes
//           </span>
//           <span>{overall.alreadyDonePercent}%</span>
//         </div>

//         <div className="h-4 bg-slate-700 rounded-full overflow-hidden">
//           <div
//             className="h-4 bg-cyan-400 rounded-full transition-all"
//             style={{
//               width: `${Math.min(overall.alreadyDonePercent, 100)}%`,
//             }}
//           />
//         </div>
//       </div>

//       {/* ===== Quiz Performance ===== */}
//       <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-6">
//         <h3 className="text-lg font-semibold">Quiz Performance</h3>

//         {eachQuiz?.map((quiz) => (
//           <div key={quiz.ActivitySession_ID}>
//             <div className="flex justify-between text-sm mb-1">
//               <span className="text-slate-300">{quiz.Title}</span>
//               <span className="text-cyan-400">{quiz.avg_score ?? 0}%</span>
//             </div>

//             <div className="h-4 bg-slate-700 rounded-full overflow-hidden">
//               <div
//                 className="h-4 bg-cyan-400 rounded-full transition-all"
//                 style={{
//                   width: `${Math.min(quiz.avg_score ?? 0, 100)}%`,
//                 }}
//               />
//             </div>
//           </div>
//         ))}

//         {/* ===== Highlight ===== */}
//         <div className="pt-4 border-t border-slate-700 text-sm text-slate-400 space-y-1">
//           {bestQuiz && (
//             <p>
//               🏆 Best Quiz: <b className="text-cyan-400">{bestQuiz.Title}</b> ({bestQuiz.avg_score}%)
//             </p>
//           )}
//           {worstQuiz && (
//             <p>
//               ⚠️ Most Difficult: <b className="text-rose-400">{worstQuiz.Title}</b> ({worstQuiz.avg_score}%)
//             </p>
//           )}
//         </div>
//       </div>
//       {/* ===== Export CSV ===== */}
// <div className="flex justify-center">
//   <button
//     onClick={() => {
//       socket.emit("export_class_report_csv", { classId });
//     }}
//      className="fixed bottom-28 left-1/2 -translate-x-1/2 w-72 py-3 bg-cyan-400 text-slate-900 font-semibold rounded-xl"
//   >
//     Export CSV
//   </button>
// </div>
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

    const handler = (data) => setReport(data);
    socket.on("class_report_data", handler);

    return () => socket.off("class_report_data", handler);
  }, [classId]);

  if (!report) {
    return (
      <div className="p-6 text-slate-400">Loading report...</div>
    );
  }

  const { overall, eachQuiz, topStudents, needsAttention } = report;

  return (
    <div className="px-6 pt-6 pb-32 max-w-4xl mx-auto space-y-8 text-slate-100">

      {/* ===== Title ===== */}
      <h2 className="text-3xl font-bold text-center">
        Class Report
      </h2>

      {/* ================= Overall ================= */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 space-y-4">
        <h3 className="text-lg font-semibold">Overall Performance</h3>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <p>Total Students: <b>{overall.totalStudent}</b></p>
          <p>Total Quiz: <b>{overall.totalQuiz}</b></p>
          <p>Avg Score: <b>{overall.avgAccuracy}%</b></p>
          <p>Avg Time: <b>{overall.avgTime}s</b></p>
        </div>

        {/* Completion bar */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Completion Rate</span>
            <span>{overall.alreadyDonePercent}%</span>
          </div>
          <div className="h-3 bg-slate-700 rounded-full">
            <div
              className="h-3 bg-cyan-400 rounded-full"
              style={{ width: `${overall.alreadyDonePercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* ================= Quiz Performance ================= */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 space-y-4">
        <h3 className="text-lg font-semibold">Quiz Performance</h3>

        {eachQuiz.map((quiz) => {
          const percent = quiz.avg_accuracy ?? 0;
          const isHard = percent < 50;

          return (
            <div key={quiz.ActivitySession_ID}>
              <div className="flex justify-between text-sm mb-1">
                <span>
                  {quiz.Title}
                  {isHard && (
                    <span className="ml-2 text-rose-400">⚠️</span>
                  )}
                </span>
                <span>{percent}%</span>
              </div>

              <div className="h-3 bg-slate-700 rounded-full">
                <div
                  className="h-3 bg-cyan-400 rounded-full"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* ================= Student Insights ================= */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 space-y-4">
        <h3 className="text-lg font-semibold">Student Insights</h3>

        {/* Top Students */}
        <div>
          <p className="text-sm text-slate-400 mb-1">Top Students</p>
          {topStudents?.length ? (
            topStudents.map((s, i) => (
              <p key={i} className="text-sm">
                {i + 1}. {s.Student_Name} —{" "}
                <span className="text-cyan-400">{s.avg_score}%</span>
              </p>
            ))
          ) : (
            <p className="text-slate-500 text-sm">No data</p>
          )}
        </div>

        {/* Needs Attention */}
        <div>
          <p className="text-sm text-slate-400 mb-1">Needs Attention</p>
          {needsAttention?.length ? (
            needsAttention.map((s, i) => (
              <p key={i} className="text-sm">
                {s.Student_Name} —{" "}
                <span className="text-rose-400">{s.avg_score}%</span>
              </p>
            ))
          ) : (
            <p className="text-slate-500 text-sm">No data</p>
          )}
        </div>
      </div>

      {/* ================= Export CSV ================= */}
      <div className="flex justify-center">
        <button
          onClick={() =>
            socket.emit("export_class_report_csv", { classId })
          }
          className="fixed bottom-24 left-1/2 -translate-x-1/2 w-72 py-3 rounded-lg
                     bg-cyan-400 text-slate-900 font-semibold
                     hover:bg-cyan-300 hover:scale-[1.02]
                     shadow-lg shadow-cyan-400/30 transition"        
      >
          Export CSV
        </button>
      </div>

    </div>
  );
}