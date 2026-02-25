// "use client";
// import React, { useEffect } from "react";
// import { useParams } from "react-router-dom";
// import { useNavigate, useLocation } from "react-router-dom";
// import { socket } from "../../socket"; // หรือ path ที่คุณใช้จริง


// export default function Lobby({ players = [] }) {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { classId, joinCode } = useParams();
//   localStorage.setItem("classId", classId);
//   localStorage.setItem("joinCode", joinCode);

//   const endRoom = () => {
//     if (!joinCode) {
//       alert("ไม่พบ Join Code");
//       return;
//     }

//     console.log("🔥 emitting end_room:", joinCode);
//     socket.emit("end_room", { joinCode });
//   };

//   useEffect(() => {
//     const handler = (res) => {
//       console.log("end_room_result:", res);

//       if (res.success) {
//         navigate("/activity-log" ); // 🔥 กลับ ActivityLogPage
//       } else {
//         alert(res.message || "ปิดห้องไม่สำเร็จ");
//       }
//     };

//     socket.on("end_room_result", handler);

//     return () => {
//       socket.off("end_room_result", handler);
//     };
//   }, [navigate]);

  


//   return (
//     <div className="flex flex-col min-h-screen bg-gray-100">
//       {/* Scrollable content */}
//       <div className="flex-1 overflow-y-auto p-4 pb-[180px]">
//         <h1 className="text-2xl font-bold mb-2">Lobby</h1>
//         <p className="mb-6 text-gray-600">
//           Waiting for teacher to start...
//         </p>

//         <div className="grid grid-cols-3 gap-6">
//           {players.map((p) => (
//             <div key={p.id} className="flex flex-col items-center">
//               <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center text-4xl">
//                 {p.avatar?.face}
//               </div>
//               <span className="mt-2">{p.stageName}</span>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Fixed bottom controls */}
//       <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-50">
//         <div className="flex justify-center gap-6">
//           <button
//             onClick={() =>
//               navigate(`/room/assign/${classId}/${joinCode}`, {
//                 state: {
//                   classId: location.state?.classId,
//                   joinCode: location.state?.joinCode,
//                 },
//               })
//             }
//             className="w-1/3 py-4 rounded-xl bg-gray-600 text-white"
//           >
//             Assign Activity
//           </button>

//           <button
//             onClick={endRoom}
//             className="w-1/3 py-4 rounded-xl bg-red-500 text-white"
//           >
//             End Room
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }
"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate, useLocation } from "react-router-dom";
import { socket } from "../../socket"; // หรือ path ที่คุณใช้จริง


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
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* 🔵 Player Count Badge */}
      <div
        className={`fixed top-4 right-4 z-50 
                    px-4 py-2 rounded-full 
                    bg-blue-300  font-semibold shadow-lg
                    transition-transform duration-300
                    ${pop ? "scale-110" : "scale-100"}`}
      >
  👥 {players.length}/200

</div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-4 pb-[180px]">
        <h1 className="text-2xl font-bold mb-2">Lobby</h1>
        <p className="mb-6 text-gray-600">
          Waiting for teacher to start...
        </p>

        <div className="grid grid-cols-3 gap-6">
          {players.map((player) => {const isCurrent = currentUser && String(player.studentId) === String(currentUser.studentId);

          return (
            <div
              key={player.studentId}
              className="flex flex-col items-center p-4 rounded-lg animate-fadePop hover:scale-105 transition-transform duration-300"
            >
              {/* Avatar */}
              <div
                className={`relative rounded-full overflow-hidden transition-all duration-300
                  ${isCurrent 
                    ? "w-32 h-32 border-4 border-blue-500 scale-105 shadow-lg shadow-blue-300/50 animate-floating" 
                    : "w-24 h-24 animate-floating"
                  }`}
              >
                <img
                  src={player.avatar?.bodyPath}
                  className="absolute inset-0 w-full h-full object-contain"
                  alt=""
                />
                <img
                  src={player.avatar?.costumePath}
                  className="absolute inset-0 w-full h-full object-contain"
                  alt=""
                />
                <img
                  src={player.avatar?.hairPath}
                  className="absolute inset-0 w-full h-full object-contain"
                  alt=""
                />
                <img
                  src={player.avatar?.facePath}
                  className="absolute inset-0 w-full h-full object-contain"
                  alt=""
                />
              </div>

              {/* Stage name */}
              <span
                className={`font-medium mt-2 transition-all duration-300
                  ${isCurrent ? "text-blue-500 text-lg" : "text-black text-base"} animate-floating`}
              >
                {String(player.stageName)}
              </span>
            </div>
          );
        })}
        </div>
      </div>

      {/* Fixed bottom controls */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-50">
        <div className="flex justify-center gap-6">
          <button
            onClick={() =>
              navigate(`/room/assign/${classId}/${joinCode}`, {
                state: {
                  classId: location.state?.classId,
                  joinCode: location.state?.joinCode,
                },
              })
            }
            className="w-1/3 py-4 rounded-xl bg-gray-600 text-white"
          >
            Assign Activity
          </button>

          <button
            onClick={endRoom}
            className="w-1/3 py-4 rounded-xl bg-red-500 text-white"
          >
            End Room
          </button>
        </div>
      </div>
    </div>
  );
}