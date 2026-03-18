import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// import Sidebar from "../Sidebar";
import { socket } from "../../socket";


function JoinRoom() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");  // ⭐ เพิ่ม state สำหรับ error
  const navigate = useNavigate();

  // 🔥 connect + listen result แค่ครั้งเดียว
  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    socket.on("connect", () => {
      console.log("✅ CONNECTED:", socket.id);
    });

    socket.on("join_result", (data) => {
      console.log("🔥 join_result:", data);

      if (data.success) {
        setError("");
        navigate(`/class/${data.joinCode}`);
      } else {
        setError(data.message || "Invalid room code");
      }
    });

    socket.on("room_full", () => {
      setError("This room is full (200 students)");
    });

    return () => {
      socket.off("connect");
      socket.off("join_result");
      socket.off("room_full");
    };
  }, [navigate]);

  const handleJoin = () => {
    if (code.trim() === "") {
      setError("Please enter the room code");
      return;
    }

    socket.emit("join_class", { joinCode: code });
  };


  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl p-8 space-y-6">

        {/* Title */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-slate-100">
            Join Room
          </h1>
          <p className="text-sm text-slate-400">
            Enter the code provided by your teacher
          </p>
        </div>

        {/* Input */}
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Enter Room Code"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setError("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleJoin();
            }}
            className="
              w-full px-4 py-3
              bg-slate-900
              border border-slate-700
              rounded-xl
              text-slate-100
              placeholder-slate-500
              focus:outline-none
              focus:ring-2 focus:ring-cyan-400
              transition-all duration-200
            "
          />

          {error && (
            <p className="text-rose-500 text-sm text-center">
              {error}
            </p>
          )}
        </div>

        {/* Join Button */}
        <button
          onClick={handleJoin}
          className="
            w-full py-3 rounded-xl
            bg-cyan-400 text-slate-900 font-semibold
            hover:bg-cyan-300
            transition-all duration-200
          "
        >
          Join Room
        </button>

        {/* Teacher Sign in */}
        <p className="text-sm text-slate-400 text-center">
          Are you a teacher?{" "}
          <span
            onClick={() => navigate("/teacher")}
            className="text-cyan-400 hover:text-cyan-300 cursor-pointer transition"
          >
            Sign in here
          </span>
        </p>

      </div>
    </div>
  );
}

export default JoinRoom;

