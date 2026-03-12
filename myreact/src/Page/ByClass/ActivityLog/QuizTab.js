import React, { useState, useEffect } from "react";
import { socket } from "../../../socket";
import ReportPage from "../../StartRoom/Activity/Activity_Quiz/Report_Quiz/Quiz_Report";
import GameAnalysis from "../../StartRoom/Activity/Activity_Quiz/Game_Analysis/GameAnalysis";
import { formatSmartDate } from "../../../utils/date";

export default function QuizTab({
  classId,
  onReportChange,
  requestBack,
  onBackHandled,
}) {
  // export default function QuizTab(props) {
  //   console.log("🔥 QuizTab RENDERED", props);

  const [page, setPage] = useState("list");
  const [quizzes, setQuizzes] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);

  useEffect(() => {
  if (!onReportChange) return;
  onReportChange(page !== "list");
}, [page]);

  useEffect(() => {
    if (!requestBack) return;

    if (page === "analysis") {
      setPage("report");      // analysis → report
    } else if (page === "report") {
      setPage("list");        // report → list
    }

    onBackHandled?.();
  }, [requestBack, page, onBackHandled]);


  /* =========================
     Fetch finished quizzes
  ========================= */
  useEffect(() => {
    if (!classId) return;

    console.log("📤 emit get_finished_quiz_sessions", classId);

    socket.emit("get_finished_quiz_sessions", { classId });

    const handler = (data) => {
      console.log("📥 finished_quiz_sessions_data:", data);
      setQuizzes(data);
    };

    socket.on("finished_quiz_sessions_data", handler);
    return () =>
      socket.off("finished_quiz_sessions_data", handler);
  }, [classId]);

  /* =========================
     Report Page
  ========================= */
  const [analysisSessionId, setAnalysisSessionId] = useState(null);
  if (page === "report") {
    return (
      <ReportPage
        activitySessionId={selectedSession.ActivitySession_ID}
        BeforePageContent="History_Report"
        onOpenAnalysis={(id) => {
          setAnalysisSessionId(id);
          setPage("analysis");
        }}
        classId={classId}
        joinCode={selectedSession.joinCode}
      />
    );
  }

  if (page === "analysis") {
    return (
      <GameAnalysis
        activitySessionId={analysisSessionId}
        onBack={() => setPage("report")}
        classId={classId}
        joinCode={selectedSession.joinCode}
      />
    );
  }


  /* =========================
     List Page
  ========================= */
  return (
    <div className="space-y-3">
      {quizzes.map((q) => (
        <div
          key={q.ActivitySession_ID}
          onClick={() => {
            setSelectedSession(q);
            setPage("report");
          }}
          className="flex justify-between items-center p-4 rounded-xl
                 bg-slate-800 border border-slate-700
                 hover:border-cyan-400/40 hover:shadow-lg hover:shadow-cyan-400/10
                 cursor-pointer transition"
        >
          <div>
            <div className="font-medium text-slate-100">{q.quiz_name}</div>
            <div className="text-sm text-slate-400">
              End: {formatSmartDate(q.Ended_At)}
            </div>
          </div>
          <div className="text-slate-300 font-semibold">{q.student_count}</div>
        </div>
      ))}


      {quizzes.length === 0 && (
        <div className="text-center text-gray-400 py-10">
          No quiz has been completed.
        </div>
      )}
    </div>
  );
}
