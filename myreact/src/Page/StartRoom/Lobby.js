"use client";
import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { socket } from "../../socket"; // หรือ path ที่คุณใช้จริง


export default function Lobby({ players = [] }) {
  const navigate = useNavigate();
  const location = useLocation();

  const joinCode = location.state?.joinCode;
    useEffect(() => {
    console.log("🏷 joinCode in Lobby =", joinCode);
  }, [joinCode]);

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

      if (res.success) {
        navigate(-1); // 🔥 กลับ ActivityLogPage
      } else {
        alert(res.message || "ปิดห้องไม่สำเร็จ");
      }
    };

    socket.on("end_room_result", handler);

    return () => {
      socket.off("end_room_result", handler);
    };
  }, [navigate]);

  


  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-4 pb-[180px]">
        <h1 className="text-2xl font-bold mb-2">Lobby</h1>
        <p className="mb-6 text-gray-600">
          Waiting for teacher to start...
        </p>

        <div className="grid grid-cols-3 gap-6">
          {players.map((p) => (
            <div key={p.id} className="flex flex-col items-center">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center text-4xl">
                {p.avatar?.face}
              </div>
              <span className="mt-2">{p.stageName}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Fixed bottom controls */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-50">
        <div className="flex justify-center gap-6">
          <button
            onClick={() =>
              navigate("/room/assign", {
                state: {
                  classId: location.state?.classId,
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
