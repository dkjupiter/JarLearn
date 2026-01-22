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
    <div className="space-y-2">
      {/* Header — เหมือน Poll */}
      <div className="bg-gray-300 p-3 rounded-lg flex justify-between">
        <div>
          <div className="font-medium">Chat name</div>
          <div className="text-sm">Class</div>
        </div>
        <div className="font-medium">Count</div>
      </div>

      {/* Chat items — layout เหมือน Poll */}
      {rooms.map((r) => (
        <div
          key={r.id}
          onClick={() => {
            setSelectedRoom(r);
            setPage("room");
          }}
          className="bg-gray-200 p-3 rounded-lg flex justify-between cursor-pointer hover:bg-gray-300 transition"
        >
          {/* ซ้าย */}
          <div className="min-w-0">
            <div className="font-medium">{r.name}</div>
            <div className="text-sm text-gray-600">{r.className}</div>
          </div>

          {/* ขวา: Count */}
          <div className="font-medium">{r.count}</div>
        </div>
      ))}
    </div>
  );
}
