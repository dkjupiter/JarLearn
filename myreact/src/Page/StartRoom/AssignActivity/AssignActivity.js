"use client";
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import Segment from "./Segment";
import QuizSection from "./QuizSection";
import PollSection from "./PollSection";
import OpenChatSection from "./OpenChatSection";
import { useTeacher } from "../../TeacherContext";

import { socket } from "../../../socket";

export default function AssignActivity() {
  const navigate = useNavigate();
  const location = useLocation();
  const { teacherId } = useTeacher();
  const classId = location.state?.classId; // 👈 มาจาก lobby
  const [currentIndex, setCurrentIndex] = useState(0);

  const [activityType, setActivityType] = useState("quiz");
  const [activitySessionId, setActivitySessionId] = useState(null);

  // 🔹 quiz config (ควรส่งมาจาก QuizSection ผ่าน props จริง ๆ)
  const [quizConfig, setQuizConfig] = useState(null);
  const [pollConfig, setPollConfig] = useState(null);
  const [boardConfig, setBoardConfig] = useState(null);

  /* ===========================
     STEP 1: create session
     =========================== */
  const handleStart = () => {
    console.log("🚀 Starting activity:")
    if (activityType === "quiz" && !quizConfig) {
      alert("กรุณาเลือก Quiz และตั้งค่าให้ครบ");
      return;
    }

    if (activityType === "poll" && !pollConfig) {
      alert("กรุณาตั้งค่า Poll");
      return;
    }

    if (activityType === "chat" && !boardConfig) {
      alert("กรุณาตั้งชื่อ Board");
      return;
    }

    console.log("🚀 create_activity_session payload", {
      classId,
      activityType,
      teacherId,
    });

    socket.emit("create_activity_session", {
      classId,
      activityType,
      teacherId,
    });
  };

  /* ===========================
     STEP 2: receive session
     =========================== */
  useEffect(() => {
    const handler = (session) => {
      console.log("🟢 activity session created:", session);
      setActivitySessionId(session.ActivitySession_ID);
    };

    socket.on("activity_session_created", handler);
    return () => socket.off("activity_session_created", handler);
  }, []);

  /* ===========================
     STEP 3: assign activity
     =========================== */
  useEffect(() => {
    if (!activitySessionId) return;

    if (activityType === "quiz" && quizConfig) {
      socket.emit("assign_quiz", {
        activitySessionId,
        ...quizConfig,
      });
    }

    if (activityType === "poll" && pollConfig) {
      socket.emit("assign_poll", {
        activitySessionId,
        ...pollConfig,
      });
    }

    if (activityType === "chat" && boardConfig) {
      socket.emit("assign_interactive_board", {
        activitySessionId,
        ...boardConfig,
      });
    }
  }, [activitySessionId, quizConfig, pollConfig, boardConfig, activityType]);

  /* ===========================
     STEP 4: navigate
     =========================== */
  useEffect(() => {
    const handleQuizResult = (res) => {
      console.log("assign_quiz_result:", res);

      if (!res.success) {
        alert(res.message || "Assign quiz failed");
        return;
      }

      navigate(`/room/quiz/${activitySessionId}`);
    };

    const handlePollResult = (res) => {
      if (!res.success) {
        alert(res.message || "Assign poll failed");
        return;
      }
      navigate(`/room/poll/${activitySessionId}`);
    };

    const handleBoardResult = (res) => {
      if (!res.success) {
        alert(res.message || "Assign board failed");
        return;
      }
      navigate(`/room/chat/${activitySessionId}`);
    };

    socket.on("assign_quiz_result", handleQuizResult);
    socket.on("assign_poll_result", handlePollResult);
    socket.on("assign_interactive_board_result", handleBoardResult);

    return () => {
      socket.off("assign_quiz_result", handleQuizResult);
      socket.off("assign_poll_result", handlePollResult);
      socket.off("assign_interactive_board_result", handleBoardResult);
    };
  }, [activitySessionId, navigate]);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="flex-1 overflow-y-auto px-4 pt-6 pb-[200px] space-y-6">
        <Segment
          value={activityType}
          onChange={setActivityType}
          options={[
            { key: "quiz", label: "Quiz" },
            { key: "poll", label: "Poll" },
            { key: "chat", label: "Interactive\nBoard" },
          ]}
        />

        {activityType === "quiz" && (
          <QuizSection onChange={setQuizConfig} />
        )}
        {activityType === "poll" && (
          <PollSection onChange={setPollConfig} />
        )}
        {activityType === "chat" && (
          <OpenChatSection onChange={setBoardConfig} />
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t space-y-3">
        <button
          onClick={handleStart}
          className="w-full py-4 rounded-xl bg-gray-600 text-white text-lg"
        >
          Start {activityType}
        </button>

        <button
          onClick={() => navigate(-1)}
          className="w-full py-4 rounded-xl bg-gray-200 text-gray-500 text-lg"
        >
          Back to lobby
        </button>
      </div>
    </div>
  );
}
