import React, { useState, useEffect } from "react";
import { socket } from "../../../socket";
import ReportPage from "../../StartRoom/Activity/Activity_Quiz/Report_Quiz/Quiz_Report";
import GameAnalysis from "../../StartRoom/Activity/Activity_Quiz/Game_Analysis/GameAnalysis";

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

  console.log("🏷️ QuizTab page:", onReportChange);

  useEffect(() => {
    onReportChange?.((page !== "list"));
  }, [page, onReportChange]);

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
    <div className="space-y-2">
      <div className="bg-gray-300 p-3 rounded-lg flex justify-between">
        <div>
          <div className="font-medium">Quiz name</div>
          <div className="text-sm">End date</div>
        </div>
        <div className="font-medium">Count</div>
      </div>

      {quizzes.map((q) => (
        <div
          key={q.ActivitySession_ID}
          onClick={() => {
            setSelectedSession(q);
            setPage("report");
          }}
          className="bg-gray-200 p-3 rounded-lg flex justify-between cursor-pointer hover:bg-gray-300"
        >
          <div>
            <div className="font-medium">{q.quiz_name}</div>
            <div className="text-sm">
              End : {new Date(q.Ended_At).toLocaleString()}
            </div>
          </div>
          <div className="font-medium">{q.student_count}</div>
        </div>
      ))}

      {quizzes.length === 0 && (
        <div className="text-center text-gray-400 py-10">
          ยังไม่มี Quiz ที่จบแล้ว
        </div>
      )}
    </div>
  );
}
