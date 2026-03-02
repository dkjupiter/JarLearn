import React, { useState, useEffect } from "react";
import ChatRoomPage from "./ChatRoomPage";

export default function ChatTab({
  onReportChange,
  requestBack,
  onBackHandled,
}) {
  const [page, setPage] = useState("list");
  const [selectedRoom, setSelectedRoom] = useState(null);

  // แจ้ง ActivityLogPage ว่าอยู่หน้า detail หรือไม่
  useEffect(() => {
    onReportChange?.(page !== "list");
  }, [page, onReportChange]);

  // 🔙 ฟังปุ่ม Back กลางล่าง
  useEffect(() => {
    if (!requestBack) return;

    if (page === "room") {
      setPage("list");
      onBackHandled?.();
    }
  }, [requestBack, page, onBackHandled]);

  // 👉 หน้า Chat Room
  if (page === "room") {
    return <ChatRoomPage room={selectedRoom} />;
  }

  // 👉 หน้า Chat List (ใช้ count)
  const rooms = [
    {
      id: 1,
      name: "Open chat",
      className: "Class name",
      count: 12,
    },
    {
      id: 2,
      name: "Open chat",
      className: "Class name",
      count: 5,
    },
  ];

  return (
    <div className="space-y-3">
      {rooms.map((r) => (
        <div
          key={r.id}
          onClick={() => {
            setSelectedRoom(r);
            setPage("room");
          }}
          className="flex justify-between items-center p-4 rounded-xl
                 bg-slate-800 border border-slate-700
                 hover:border-cyan-400/40 hover:shadow-lg hover:shadow-cyan-400/10
                 cursor-pointer transition"
        >
          <div>
            <div className="font-medium text-slate-100">{r.name}</div>
            <div className="text-sm text-slate-400">{r.className}</div>
          </div>
          <div className="text-slate-300 font-semibold">{r.count}</div>
        </div>
      ))}
    </div>
  );
}
