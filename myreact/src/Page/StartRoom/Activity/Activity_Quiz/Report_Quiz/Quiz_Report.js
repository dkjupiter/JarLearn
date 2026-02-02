import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { socket } from "../../../../../socket";
import Sidebar_account from "../../../../Sidebar_account";
import ScoreDistributionChart from "./ScoreDistributionChart";
import exportQuizReportExcel from "./exportStudentsCSV";

function ReportPage({ onViewAnalysis, onNext }) {
  const { activitySessionId } = useParams();

  const [report, setReport] = useState({
    students: [],
    overall: {},
    eachQuestion: [],
  });

  /* =========================
     Fetch report data
  ========================= */
  useEffect(() => {
    if (!activitySessionId) return;

    socket.emit("get_quiz_report", {
      activitySessionId: Number(activitySessionId),
    });

    const handler = (data) => {
      console.log("quiz report:", data);
      setReport(data);
    };

    socket.on("quiz_report_data", handler);

    return () => {
      socket.off("quiz_report_data", handler);
    };
  }, [activitySessionId]);

  const { students, overall, eachQuestion } = report;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="fixed top-0 left-0 w-full bg-white shadow-md z-10">
        <Sidebar_account />
      </div>

      <div className="h-16" />

      <h1 className="text-3xl font-bold text-center my-6">
        Report
      </h1>

      <div className="max-w-md mx-auto border rounded-2xl p-5 space-y-6">
        {/* Chart */}
        <div className="bg-gray-200 rounded-xl p-4">
          <p className="text-center mb-3 text-gray-700">
            คะแนนนักเรียนแต่ละคนของควิซนี้
          </p>

          <ScoreDistributionChart students={students} />
        </div>

        {/* Overall */}
        <div>
          <h2 className="text-xl font-bold mb-2">Overall</h2>
          <div className="space-y-1 text-sm">
            <p>All Question : {overall.totalQuestion ?? 0}</p>
            <p>Many Mistakes : {overall.manyMistakes ?? 0}</p>
            <p>Average Score : {overall.avgScore ?? 0}%</p>
            <p>Average Time : {overall.avgTime ?? 0} mins</p>
          </div>

          <div className="flex justify-between mt-3 text-sm">
            <span>Max {overall.maxScore ?? 0}</span>
            <span>Min {overall.minScore ?? 0}</span>
          </div>
        </div>

        {/* Each Question */}
        <div>
          <h2 className="text-xl font-bold mb-3">
            Each Question
          </h2>

          {eachQuestion.map((q, i) => (
            <div
              key={`${q.questionId}-${i}`}
              className="flex items-center gap-2 mb-2"
            >
              <span className="w-5">{i + 1}</span>
              <div className="flex-1 h-4 bg-gray-200 rounded">
                <div
                  className="h-full bg-gray-500 rounded"
                  style={{ width: `${q.correctPercent}%` }}
                />
              </div>
              <span className="w-10 text-right text-sm">
                {q.correctPercent}%
              </span>
            </div>
          ))}

          {eachQuestion.length === 0 && (
            <p className="text-gray-400 text-sm">
              No question data
            </p>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className="max-w-md mx-auto mt-6 space-y-3">
<button
  onClick={() =>
    exportQuizReportExcel({
      studentAnswers: report.studentAnswers,
      eachQuestion: report.eachQuestion,
      overall: report.overall,
    })
  }
  className="w-full py-3 bg-gray-600 text-white rounded-xl"
>
  Export Excel
</button>


        <button
          onClick={onNext}
          className="w-full py-3 border rounded-xl"
        >
          ดูวิเคราะห์เกม
        </button>

        <button
          onClick={onNext}
          className="w-full py-3 border rounded-xl"
        >
          Back
        </button>
      </div>
    </div>
  );
}

export default ReportPage;
