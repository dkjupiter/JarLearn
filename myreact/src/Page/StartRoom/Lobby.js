import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { socket } from "../../socket";
import { Users } from "lucide-react";
import toast from "react-hot-toast";

export default function Lobby() {

  const navigate = useNavigate();
  const location = useLocation();
  const { classId, joinCode } = useParams();

  const { playerData } = location.state || {};
  const currentUser = playerData;

  const [players, setPlayers] = useState([]);
  const [cls, setCls] = useState(null);
  const [pop, setPop] = useState(false);

  /* =========================
     SAVE PARAMS
  ========================= */

  useEffect(() => {
    if (!classId || !joinCode) return;

    localStorage.setItem("classId", classId);
    localStorage.setItem("joinCode", joinCode);
  }, [classId, joinCode]);

  /* =========================
     ROOM SOCKET LISTENERS
  ========================= */

  useEffect(() => {

    if (!joinCode) return;

    console.log("🎧 Lobby listening");

    const handleRoomPlayers = (playersInRoom) => {
      console.log("📥 room-players", playersInRoom);
      setPlayers(playersInRoom);
    };

    const handlePlayerJoined = (newPlayer) => {
      if (!newPlayer?.studentId) return;

      setPlayers((prev) => {

        const exists = prev.some(
          (p) => String(p.studentId) === String(newPlayer.studentId)
        );

        return exists ? prev : [...prev, newPlayer];

      });
    };

    const handlePlayerUpdated = ({ studentId, stageName }) => {
      setPlayers((prev) =>
        prev.map((p) =>
          String(p.studentId) === String(studentId)
            ? { ...p, stageName }
            : p
        )
      );
    };

    socket.on("room-players", handleRoomPlayers);
    socket.on("player-joined", handlePlayerJoined);
    socket.on("player-updated", handlePlayerUpdated);

    socket.emit("join-room", {
      joinCode,
      role: "teacher",
    });

    return () => {
      socket.off("room-players", handleRoomPlayers);
      socket.off("player-joined", handlePlayerJoined);
      socket.off("player-updated", handlePlayerUpdated);
    };

  }, [joinCode]);

  /* =========================
     POP ANIMATION
  ========================= */

  useEffect(() => {

    if (players.length === 0) return;

    setPop(true);

    const t = setTimeout(() => setPop(false), 300);

    return () => clearTimeout(t);

  }, [players.length]);

  /* =========================
     CLASS DETAIL
  ========================= */

  useEffect(() => {

    if (!classId) return;

    console.log("Emitting get_class_detail for classId:", classId);

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

    socket.on("class_detail_data", handler);

    return () => socket.off("class_detail_data", handler);

  }, [classId]);

  /* =========================
     ACTIVE ACTIVITY CHECK
  ========================= */

  useEffect(() => {

    if (!classId) return;

    socket.emit("get_active_activity", { classId });

  }, [classId]);

  /* =========================
     ACTIVITY STARTED
  ========================= */

  useEffect(() => {

    const handler = (payload) => {

      console.log("🎯 activity_started", payload);

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
          quizId: payload.quizId,
          studentId: playerData?.studentId
        }
      });

    };

    socket.on("activity_started", handler);

    return () => socket.off("activity_started", handler);

  }, [joinCode, navigate, playerData]);

  /* =========================
     END ROOM
  ========================= */

  const endRoom = () => {

    if (!joinCode) {
      toast.error("Join code not found");
      return;
    }

    console.log("🔥 emitting end_room:", joinCode);

    socket.emit("end_room", { joinCode });

  };

  useEffect(() => {

    const handler = (res) => {

      console.log("end_room_result:", res);

      if (res.success) {
        
        toast.success("Room closed");
        navigate(`/classroom/${classId}`, { state: { cls } });

      } else {

        toast.error(res.message || "Failed to close the room");

      }

    };

    socket.on("end_room_result", handler);

    return () => socket.off("end_room_result", handler);

  }, [navigate, cls, classId]);

  /* =========================
     UI
  ========================= */

  return (
    <div className="flex flex-col min-h-screen bg-slate-900 text-slate-100">

      {/* Player Count Badge */}

      <div
        className={`fixed top-4 right-4 z-50 
        flex items-center gap-2 px-4 py-2 rounded-full border font-semibold shadow-lg
        transition-transform duration-300
        ${pop ? "scale-110" : "scale-100"}
        ${players.length >= 200
            ? "bg-rose-900/40 border-rose-500 text-rose-400"
            : "bg-slate-800 border-slate-700 text-cyan-400"
          }`}
      >
        <Users size={18} />
        <span>{players.length}/200</span>
      </div>

      {/* Scrollable content */}

      <div className="flex-1 overflow-y-auto px-4 pt-6 pb-32">

        <h1 className="text-2xl font-bold mb-1">Lobby</h1>

        <p className="text-slate-400 text-xl mb-1">
          Join Code:
          <span className="ml-2 px-2 py-1 rounded bg-slate-800 border border-slate-700 text-yellow-400 font-mono">
            {joinCode}
          </span>
        </p>

        <p className="mb-6 text-slate-400 text-sm">
          Waiting for teacher to start...
        </p>

        {/* Player Grid */}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">

          {players.filter(Boolean).map((player) => {

            const isCurrent =
              currentUser &&
              String(player.studentId) === String(currentUser.studentId);

            return (
              <div
                key={player.studentId}
                className="flex flex-col items-center p-3 rounded-xl bg-slate-800 border border-slate-700 hover:scale-105 transition-transform duration-300 animate-floating"
              >

                {/* Avatar */}

                <div
                  className={`relative rounded-full overflow-hidden transition-all duration-300
                  ${isCurrent
                      ? "w-24 h-24 sm:w-28 sm:h-28 border-4 border-cyan-400 shadow-lg shadow-cyan-400/30 animate-floating"
                      : "w-20 h-20 sm:w-24 sm:h-24"
                    }`}
                >

                  <img src={player.avatar?.bodyPath} className="absolute inset-0 w-full h-full object-contain" alt="" />
                  <img src={player.avatar?.costumePath} className="absolute inset-0 w-full h-full object-contain" alt="" />
                  <img src={player.avatar?.hairPath} className="absolute inset-0 w-full h-full object-contain" alt="" />
                  <img src={player.avatar?.facePath} className="absolute inset-0 w-full h-full object-contain" alt="" />

                </div>

                {/* Stage Name */}

                <span
                  className={`mt-3 font-medium truncate max-w-full text-center
                  ${isCurrent
                      ? "text-cyan-400 text-base sm:text-lg"
                      : "text-slate-300 text-sm sm:text-base"
                    }`}
                >
                  {String(player.stageName)}
                </span>

              </div>
            );

          })}

        </div>

      </div>

      {/* Bottom Controls */}

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