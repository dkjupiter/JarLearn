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
    <div className="space-y-3">
      {polls.map((p) => (
        <div
          key={p.id}
          onClick={() => {
            setSelectedPoll(p);
            setPage("result");
          }}
          className="flex justify-between items-center p-4 rounded-xl
                 bg-slate-800 border border-slate-700
                 hover:border-cyan-400/40 hover:shadow-lg hover:shadow-cyan-400/10
                 cursor-pointer transition"
        >
          <div>
            <div className="font-medium text-slate-100">{p.name}</div>
            <div className="text-sm text-slate-400">End: {p.end}</div>
          </div>
          <div className="text-slate-300 font-semibold">{p.count}</div>
        </div>
      ))}
    </div>
  );
}
 