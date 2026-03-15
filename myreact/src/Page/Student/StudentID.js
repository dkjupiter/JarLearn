import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { socket } from "../../socket";

function StudentID() {
  const navigate = useNavigate();
  const { joinCode } = useParams();
  const [studentNumber, setStudentNumber] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      socket.off("student_checked");
      socket.off("student_created");
    };
  }, []);

  const handleJoin = () => {
    if (!studentNumber.trim()) {
      setError("Please enter your Student ID");
      return;
    }

    setError("");

    socket.emit("check_student", { joinCode, studentNumber });

    socket.once("student_checked", (data) => {
      console.log("✅ student_checked =", data);

      // ✅ ถ้ามีอยู่แล้ว
      if (data.exists) {
        if (!data.studentId) {
          setError("Invalid student data");
          return;
        }

        navigate(`/class/${joinCode}/student/${data.studentId}/avatar`, {
          state: {
            studentId: data.studentId,
            studentNumber: data.studentNumber,
          },
        });
      }
      // ✅ ถ้ายังไม่มี → สร้างใหม่
      else {
        socket.emit("create_student", { joinCode, studentNumber });

        socket.once("student_created", (newData) => {
          console.log("🎉 student_created =", newData);

          if (!newData.studentId) {
            setError("Failed to create student");
            return;
          }

          navigate(`/class/${joinCode}/student/${newData.studentId}/avatar`, {
            state: {
              studentId: newData.studentId,
              studentNumber: newData.studentNumber,
            },
          });
        });
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl p-8 space-y-6">

        {/* Title */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-slate-100">
            Student ID
          </h1>
          <p className="text-sm text-slate-400">
            Enter your student ID to continue
          </p>
        </div>

        {/* Input */}
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Enter Student ID"
            value={studentNumber}
            onChange={(e) => {
              setStudentNumber(e.target.value.replace(/\D/g, ""));
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

          {/* Error */}
          {error && (
            // <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl py-2 px-3">
              <p className="text-rose-500 text-sm text-center">
                {error}
              </p>
            // {/* </div> */}
          )}
        </div>

        {/* Button */}
        <button
          onClick={handleJoin}
          className="
            w-full py-3 rounded-xl
            bg-cyan-400 text-slate-900 font-semibold
            hover:bg-cyan-300
            transition-all duration-200
          "
        >
          Continue
        </button>

      </div>
    </div>
  );
}

export default StudentID;
