"use client";
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useParams } from "react-router-dom";

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
  const { classId, joinCode } = useParams();
  // const classId = location.state?.classId;
  // const joinCode = location.state?.joinCode; 
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
    console.log("🟢 RECEIVED",);
    return () => socket.off("activity_session_created", handler);
  }, []);
  //   useEffect(() => {
  //   console.log("🟡 listener mounted");

  //   socket.on("activity_session_created", (s) => {
  //     console.log("🟢 RECEIVED", s);
  //   });

  //   return () => socket.off("activity_session_created");
  // }, []);


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

      if (quizConfig.mode === "team") {
        navigate(`/room/team/${classId}/${joinCode}/${activitySessionId}`, {
          state: {
            studentPerTeam: quizConfig.studentPerTeam,
          },
        });
      } else {
        navigate(`/room/quiz/${classId}/${joinCode}/${activitySessionId}`);
      }
    };

    const handlePollResult = (res) => {
      if (!res.success) {
        alert(res.message || "Assign poll failed");
        return;
      }
      navigate(`/room/poll/${classId}/${joinCode}/${activitySessionId}`);
    };

    const handleBoardResult = (res) => {
      if (!res.success) {
        alert(res.message || "Assign board failed");
        return;
      }
      navigate(`/room/chat/${classId}/${joinCode}/${activitySessionId}`);
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
    <div className="flex flex-col min-h-screen bg-slate-900 text-slate-100">
      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pt-6 pb-32 space-y-6 max-w-3xl mx-auto w-full">

        {/* Segment Card */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4">
          <Segment
            value={activityType}
            onChange={setActivityType}
            options={[
              { key: "quiz", label: "Quiz" },
              { key: "poll", label: "Poll" },
              { key: "chat", label: "Interactive\nBoard" },
            ]}
          />
        </div>

        {/* Sections */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4">
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

      </div>

      {/* Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-slate-800 border-t border-slate-700 space-y-3">
        <div className="flex flex-col gap-3 max-w-3xl mx-auto items-center">

          <button
            onClick={handleStart}
            className="w-72 py-3 rounded-lg
                     bg-cyan-400 text-slate-900 font-semibold
                     hover:bg-cyan-300 hover:scale-[1.02]
                     shadow-lg shadow-cyan-400/30 transition"
          >
            Start {activityType}
          </button>

          <button
            onClick={() => navigate(`/room/lobby/${classId}/${joinCode}`)}
            className="w-72 py-3 rounded-lg
                     bg-rose-500 text-white font-medium
                     hover:bg-rose-400 transition"
          >
            Back to lobby
          </button>

        </div>
      </div>
    </div>
  );
}
