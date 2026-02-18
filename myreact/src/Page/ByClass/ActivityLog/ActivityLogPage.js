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
    <div className="px-4 pt-6 pb-[180px]">
      {/* Class name */}
      <h2 className="text-2xl font-semibold mb-4">Class name</h2>

      {/* Tabs */}
      <div className="flex space-x-4 mb-4">
        <TabButton
          label="Quiz"
          active={activeTab === "quiz"}
          onClick={() => {
            setActiveTab("quiz");
            setInReport(false);
            setRequestBack(false);
          }}
        />
        <TabButton
          label="Poll"
          active={activeTab === "poll"}
          onClick={() => {
            setActiveTab("poll");
            setInReport(false);
            setRequestBack(false);
          }}
        />
        <TabButton
          label="Interactive Board"
          active={activeTab === "chat"}
          onClick={() => {
            setActiveTab("chat");
            setInReport(false);
            setRequestBack(false);
          }}
        />
      </div>

      <hr className="mb-4" />

      {/* Content */}
      {renderTab()}

      {/* 🔹 Start Room (เข้า lobby โดยไม่ replace history) */}
      {!inReport && (
        <button
          // onClick={() =>
          //   navigate("/room/lobby", {
          //     state: { from: "activity-log" }, // 👈 สำคัญ
          //   })
          // }
          onClick={startRoom}
          className="fixed bottom-28 left-1/2 -translate-x-1/2
                     w-72 py-3 bg-gray-600 text-white rounded-lg"
        >
          Start Room
        </button>
      )}

      {/* 🔹 Back จาก report */}
      {inReport && (
        <button
          onClick={() => setRequestBack(true)}
          className="fixed bottom-28 left-1/2 -translate-x-1/2
                     w-72 py-3 bg-gray-500 text-white rounded-lg z-50"
        >
          Back
        </button>
      )}
    </div>
  );
}

/* ---------------- Tab Button ---------------- */

function TabButton({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-1 rounded-full font-medium ${
        active ? "bg-gray-300 text-black" : "text-gray-500"
      }`}
    >
      {label}
    </button>
  );
}