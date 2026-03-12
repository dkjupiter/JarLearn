import { useEffect, useState } from "react";
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