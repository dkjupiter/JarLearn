"use client";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import QuizTab from "./QuizTab";
import PollTab from "./PollTab";
import ChatTab from "./ChatTab";

import { socket } from "../../../socket"; // ปรับ path ตามจริง



export default function ActivityLogPage({ cls }) {
  const [activeTab, setActiveTab] = useState("quiz");

  // 👉 true = อยู่หน้า detail (report / result)
  const [inReport, setInReport] = useState(false);

  // 👉 trigger ให้ tab ปัจจุบัน back
  const [requestBack, setRequestBack] = useState(false);

  const navigate = useNavigate();

  const renderTab = () => {
    if (activeTab === "quiz") {
      return (
        <QuizTab
          classId={cls?.id}
          onReportChange={setInReport}
          requestBack={requestBack}
          onBackHandled={() => setRequestBack(false)}
        />
      );
    }

    if (activeTab === "poll") {
      return (
        <PollTab
          onReportChange={setInReport}
          requestBack={requestBack}
          onBackHandled={() => setRequestBack(false)}
        />
      );
    }

    if (activeTab === "chat") {
      return (
        <ChatTab
          onReportChange={setInReport}
          requestBack={requestBack}
          onBackHandled={() => setRequestBack(false)}
        />
      );
    }

    return null;
  };

  const classId = cls?.id;
  const [joinCode, setJoinCode] = useState(null);

  useEffect(() => {
    if (!classId) return;

    socket.emit("get_join_code", classId);
  }, [classId]);

  useEffect(() => {
    socket.on("get_join_code_result", (res) => {
      if (res.success) {
        console.log("🔑 joinCode =", res.joinCode);
        setJoinCode(res.joinCode);
      } else {
        alert("ดึง Join Code ไม่สำเร็จ");
      }
    });

    return () => {
      socket.off("get_join_code_result");
    };
  }, []);
  
  const startRoom = () => {
    if (!joinCode) {
      alert("ไม่พบ Join Code");
      return;
    }

    console.log("🔥 emitting open_room:", joinCode);
    socket.emit("open_room", { joinCode });
  };

  useEffect(() => {
  setInReport(false);
  setRequestBack(false);
}, [activeTab]);

  useEffect(() => {
  console.log("inReport =", inReport);
}, [inReport]);


  useEffect(() => {
    socket.on("open_room_result", (data) => {
      console.log("open_room_result:", data);

      if (data.success) {
        const openedJoinCode = data.room.Join_Code;

        console.log(
          "➡️ navigating to Lobby with joinCode =",
          openedJoinCode
        );

        navigate(`/room/lobby/${classId}/${openedJoinCode}`, {
          state: {
            joinCode: openedJoinCode,
            role: "teacher",
            classId: classId,
          },
        });
      } else {
        alert(data.message || "เปิดห้องไม่สำเร็จ");
      }
    });


    return () => {
      socket.off("open_room_result");
    };
  }, []);



  return (
  <div className=" pt-6 min max-w-4xl mx-auto space-y-8 text-slate-100">
      {/* ===== Title ===== */}
      <h2 className="text-3xl font-bold text-center">
        Activity Log
      </h2>
    <div className="px-6 pb-[140px]">
{/* Tabs */}
      <div className="flex gap-2 mb-4">
        <TabButton label="Quiz" active={activeTab === "quiz"} onClick={() => setActiveTab("quiz")} />
        <TabButton label="Poll" active={activeTab === "poll"} onClick={() => setActiveTab("poll")} />
        <TabButton label="Interactive Board" active={activeTab === "chat"} onClick={() => setActiveTab("chat")} />
      </div>

      <div className="border-b border-slate-800 mb-4" />

      {/* Content */}
      {renderTab()}
    </div>

    {/* Bottom Action */}
<div className="fixed bottom-24 left-0 right-0 flex justify-center pointer-events-none">
  <div className="pointer-events-auto">

    {!inReport ? (
      <button
        onClick={startRoom}
        className="fixed bottom-24 left-1/2 -translate-x-1/2 w-72 py-3 rounded-lg
                     bg-cyan-400 text-slate-900 font-semibold
                     hover:bg-cyan-300 hover:scale-[1.02]
                     shadow-lg shadow-cyan-400/30 transition"        
      >
        Start Room
      </button>
    ) : (
      <button
        onClick={() => setRequestBack(true)}
        className="
          w-72 py-3 rounded-xl
          bg-cyan-400 text-slate-900 font-semibold
          shadow-lg shadow-cyan-400/30
          hover:bg-cyan-300 hover:scale-[1.02]
          active:scale-[0.98]
          transition
        "
      >
        Back
      </button>
    )}

  </div>
</div>
  </div>
);
}

/* ---------------- Tab Button ---------------- */
function TabButton({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`
        px-4 py-1.5 rounded-full text-sm font-medium transition
        ${
          active
            ? "bg-cyan-400 text-slate-900"
            : "text-slate-400 hover:text-white hover:bg-slate-800"
        }
      `}
    >
      {label}
    </button>
  );
}