import React, { useState, useEffect } from "react";
import QuizReportPage from "./QuizReportPage";

export default function QuizTab({
  onReportChange,
  requestBack,
  onBackHandled,
}) {
  const [page, setPage] = useState("list");
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  // แจ้ง ActivityLogPage ว่าอยู่ report หรือไม่
  useEffect(() => {
    onReportChange?.(page === "report");
  }, [page, onReportChange]);

  // 👉 หน้า Report
  if (page === "report") {
    return (
      <QuizReportPage
        quiz={selectedQuiz}
        requestBack={requestBack}
        onBackHandled={onBackHandled}
        onExitReport={() => setPage("list")}
      />
    );
  }

  // 👉 หน้า List (UI เดิมแบบ item)
  const quizzes = [
    {
      id: 1,
      name: "Unit 2.1 Python",
      end: "27 March 2025 at 4:00 AM",
      count: 25,
    },
    {
      id: 2,
      name: "Unit 2.2 Python",
      end: "30 March 2025 at 11:59 PM",
      count: 20,
    },
  ];

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="bg-gray-300 p-3 rounded-lg flex justify-between">
        <div>
          <div className="font-medium">Quiz name</div>
          <div className="text-sm">date end</div>
        </div>
        <div className="font-medium">Count</div>
      </div>

      {/* Quiz items */}
      {quizzes.map((q) => (
        <div
          key={q.id}
          onClick={() => {
            setSelectedQuiz(q);
            setPage("report");
          }}
          className="bg-gray-200 p-3 rounded-lg flex justify-between cursor-pointer hover:bg-gray-300 transition"
        >
          <div>
            <div className="font-medium">{q.name}</div>
            <div className="text-sm">End : {q.end}</div>
          </div>
          <div className="font-medium">{q.count}</div>
        </div>
      ))}
    </div>
  );
}

