import React, { useState, useEffect } from "react";
import PollResultPage from "./PollResultPage";

export default function PollTab({
  onReportChange,
  requestBack,
  onBackHandled,
}) {
  const [page, setPage] = useState("list");
  const [selectedPoll, setSelectedPoll] = useState(null);

  // 🔔 แจ้ง ActivityLogPage ว่าอยู่หน้า detail หรือไม่
  useEffect(() => {
    onReportChange?.(page !== "list");
  }, [page, onReportChange]);

  // 🔙 ฟังปุ่ม Back กลางล่าง (เหมือน QuizTab)
  useEffect(() => {
    if (!requestBack) return;

    if (page === "result") {
      setPage("list");
      onBackHandled?.();
    }
  }, [requestBack, page, onBackHandled]);

  // 👉 หน้า Poll Result
  if (page === "result") {
    return <PollResultPage poll={selectedPoll} />;
  }

  // 👉 หน้า Poll List
  const polls = [
    {
      id: 1,
      name: "Poll name 1",
      end: "27 March 2025 at 4:00 AM",
      count: 40,
    },
    {
      id: 2,
      name: "Poll name 2",
      end: "30 March 2025 at 11:59 PM",
      count: 32,
    },
  ];

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="bg-gray-300 p-3 rounded-lg flex justify-between">
        <div>
          <div className="font-medium">Poll name</div>
          <div className="text-sm">date end</div>
        </div>
        <div className="font-medium">Count</div>
      </div>

      {/* Poll items */}
      {polls.map((p) => (
        <div
          key={p.id}
          onClick={() => {
            setSelectedPoll(p);
            setPage("result");
          }}
          className="bg-gray-200 p-3 rounded-lg flex justify-between cursor-pointer hover:bg-gray-300 transition"
        >
          <div>
            <div className="font-medium">{p.name}</div>
            <div className="text-sm">End : {p.end}</div>
          </div>
          <div className="font-medium">{p.count}</div>
        </div>
      ))}
    </div>
  );
}
