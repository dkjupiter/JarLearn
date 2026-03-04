"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate, useLocation } from "react-router-dom";
import { socket } from "../../socket";
import { Users } from "lucide-react";

export default function Lobby() {
  const navigate = useNavigate();
  const location = useLocation();
  const { classId, joinCode } = useParams();
  localStorage.setItem("classId", classId);
  localStorage.setItem("joinCode", joinCode);

  const { playerData } = location.state || {};
  const [players, setPlayers] = useState([]);
  const currentUser = playerData;

  const [cls, setCls] = useState(null);
  const [pop, setPop] = useState(false);


  useEffect(() => {
    if (!joinCode) return;

    console.log("🎧 Lobby listening");

    socket.on("room-players", (playersInRoom) => {
      console.log("📥 room-players", playersInRoom);
      setPlayers(playersInRoom);
    });

    socket.on("player-joined", (newPlayer) => {
      setPlayers((prev) => {
        const exists = prev.some((p) => String(p.studentId) === String(newPlayer.studentId));
        return exists ? prev : [...prev, newPlayer];
      });
    });

    // 🔥 emit หลังจาก on แล้วเท่านั้น
    socket.emit("join-room", {
      joinCode,
      role: "teacher",
    });

    return () => {
      socket.off("room-players");
      socket.off("player-joined");
    };
  }, [playerData, joinCode]);

  useEffect(() => {
    socket.on("player-updated", ({ studentId, stageName }) => {
      setPlayers((prev) =>
        prev.map((p) =>
          String(p.studentId) === String(studentId)
            ? { ...p, stageName }
            : p
        )
      );
    });

    return () => socket.off("player-updated");
  }, []);

  useEffect(() => {
    if (players.length === 0) return;

    setPop(true);
    const t = setTimeout(() => setPop(false), 300);
    return () => clearTimeout(t);
  }, [players.length]);


  useEffect(() => {
    if (!classId) return;

    socket.emit("get_class_detail", classId);

    const handler = (data) => {
      setCls({
        id: classId,
        name: data.Class_Name,
        section: data.Class_Section,
        subject: data.Class_Subject,
        joinCode: data.Join_Code,
      });
    };
    console.log("Emitting get_class_detail for classId:", cls);

    socket.on("class_detail_data", handler);

    return () => socket.off("class_detail_data", handler);

  }, [classId]);

  const endRoom = () => {
    if (!joinCode) {
      alert("ไม่พบ Join Code");
      return;
    }

    console.log("🔥 emitting end_room:", joinCode);
    socket.emit("end_room", { joinCode });
  };

  useEffect(() => {
    const handler = (res) => {
      console.log("end_room_result:", res);
      console.log("cls =", cls);

      if (res.success) {
        navigate(`/classroom/${classId}`, { state: { cls } });
      } else {
        alert(res.message || "ปิดห้องไม่สำเร็จ");
      }
    };

    socket.on("end_room_result", handler);

    return () => {
      socket.off("end_room_result", handler);
    };
  }, [navigate, cls, classId]);

  useEffect(() => {
    socket.emit("get_active_activity", { classId: 1 });
  }, []);


  useEffect(() => {
    const handler = (payload) => {
      console.log("🎯 activity_started", payload);
      console.log("activity_started payload =", payload);

      // 🔥 เข้าห้อง activity ทันที
      socket.emit("join_activity", {
        activitySessionId: payload.activitySessionId,
      });


      navigate(`/class/${joinCode}/lobby/quiz/${payload.activitySessionId}`, {
        state: {
          questions: payload.questions,
          totalQuestions: payload.questions.length,
          timeLimit: payload.timeLimit,
          timerType: payload.timerType,
          activitySessionId: payload.activitySessionId,
          quizId: payload.quizId,           // ✅ เพิ่ม
          studentId: playerData.studentId        // ✅ เพิ่ม
        }
      });
    };

    socket.on("activity_started", handler);

    return () => socket.off("activity_started", handler);
  }, []);
  return (
    <div className="flex flex-col min-h-screen bg-slate-900 text-slate-100">
      {/* 🔵 Player Count Badge */}
      <div
        className={`fixed top-4 right-4 z-50 
          flex items-center gap-2
          px-4 py-2 rounded-full 
          bg-slate-800 border border-slate-700 text-cyan-400 font-semibold shadow-lg
          transition-transform duration-300
          ${pop ? "scale-110" : "scale-100"}`}
      >
        <Users size={18} />
        <span>{players.length}/200</span>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 pt-6 pb-32">
        <h1 className="text-2xl font-bold mb-1">Lobby</h1>
        <p className="mb-6 text-slate-400">
          Waiting for teacher to start...
        </p>

        {/* Responsive player grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {players.map((player) => {
            const isCurrent =
              currentUser &&
              String(player.studentId) === String(currentUser.studentId);

            return (
              <div
                key={player.studentId}
                className="flex flex-col items-center p-3 rounded-xl bg-slate-800 border border-slate-700
                hover:scale-105 transition-transform duration-300 animate-floating"
              >
                {/* Avatar */}
                <div
                  className={`relative rounded-full overflow-hidden transition-all duration-300
                  ${isCurrent
                      ? "w-24 h-24 sm:w-28 sm:h-28 border-4 border-cyan-400 shadow-lg shadow-cyan-400/30 animate-floating transform-gpu"
                      : "w-20 h-20 sm:w-24 sm:h-24"
                    }`}
                >
                  <img src={player.avatar?.bodyPath} className="absolute inset-0 w-full h-full object-contain" alt="" />
                  <img src={player.avatar?.costumePath} className="absolute inset-0 w-full h-full object-contain" alt="" />
                  <img src={player.avatar?.hairPath} className="absolute inset-0 w-full h-full object-contain" alt="" />
                  <img src={player.avatar?.facePath} className="absolute inset-0 w-full h-full object-contain" alt="" />
                </div>

                {/* Stage name */}
                <span
                  className={`mt-3 font-medium truncate max-w-full text-center
                  ${isCurrent ? "text-cyan-400 text-base sm:text-lg" : "text-slate-300 text-sm sm:text-base"}`}
                >
                  {String(player.stageName)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fixed bottom controls */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700 p-4 z-50">
        <div className="flex flex-col gap-3 max-w-3xl mx-auto items-center">
          <button
            onClick={() =>
              navigate(`/room/assign/${classId}/${joinCode}`, {
                state: {
                  classId: location.state?.classId,
                  joinCode: location.state?.joinCode,
                },
              })
            }
            className="w-72 py-3 rounded-lg
                     bg-cyan-400 text-slate-900 font-semibold
                     hover:bg-cyan-300 hover:scale-[1.02]
                     shadow-lg shadow-cyan-400/30 transition"
          >
            Assign Activity
          </button>

          <button
            onClick={endRoom}
            className="w-72 py-3 rounded-lg
                     bg-rose-500 text-white font-medium
                     hover:bg-rose-400 transition"
          >
            End Room
          </button>
        </div>
      </div>
    </div>
  );
}