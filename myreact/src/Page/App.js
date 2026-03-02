import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar_guest";
import { Eye, EyeOff } from "lucide-react";
import { useTeacher } from "./TeacherContext";

import { socket } from "../socket";

export default function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { setTeacherId } = useTeacher();
  const [loginError, setLoginError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    socket.on("login_result", (data) => {
      console.log("LOGIN RESULT FROM SERVER:", data);
      if (data.success && data.user?.id) {
        setTeacherId(data.user.id); // เก็บ global state
        navigate("/myclass");
      } else {
        setLoginError(data.message || "Invalid email or password.");
      }
    });

    return () => socket.off("login_result");
  }, [navigate, setTeacherId]);


  const handleLogin = () => {
    if (!email || !password) {
      setLoginError("Please enter both email and password.");
      return;
    }

    socket.emit("login", { email, password });
  };
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <Sidebar />

      <main className="flex flex-col items-center justify-center flex-1 p-6">
        {/* Card */}
        <div className="w-full max-w-md bg-slate-800 rounded-2xl p-8 shadow-2xl border border-slate-700">
          <h2 className="text-2xl font-bold text-center text-slate-100 mb-6">
            Sign in
          </h2>

          {/* Email */}
          <label className="block mb-4">
            <span className="block mb-1 text-slate-300">Email</span>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full p-3 bg-slate-700 text-slate-100 rounded-lg
                       placeholder-slate-400
                       focus:outline-none focus:ring-2 focus:ring-cyan-400"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setLoginError("");
              }}
            />
          </label>

          {/* Password */}
          <label className="block mb-2">
            <span className="block mb-1 text-slate-300">Password</span>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="w-full h-11 px-3 pr-10 bg-slate-700 text-slate-100 rounded-lg
                         placeholder-slate-400
                         focus:outline-none focus:ring-2 focus:ring-cyan-400"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setLoginError("");
                }}
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2
             text-slate-400 hover:text-cyan-300 transition"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>

          {loginError && (
            <p className="text-red-400 text-sm text-center mb-4">
              {loginError}
            </p>
          )}

          {/* Primary */}
          <button
            onClick={handleLogin}
            className="w-full py-3 mt-4 rounded-lg
             bg-cyan-400 text-slate-900 font-semibold
             hover:bg-cyan-300 active:scale-95
             shadow-lg shadow-cyan-400/30
             transition"
          >
            Sign in
          </button>

          {/* Register */}
          <button
            onClick={() => navigate("/register")}
            className="w-full py-3 mt-3 rounded-lg
             border border-slate-600 text-slate-300
             hover:bg-slate-700 hover:text-white
             transition"
          >
            No account? Register
          </button>
        </div>
      </main>
    </div>
  );
}

// ทำ Register หน้าเดียวกัน style
// 2️⃣ ทำ Forgot password
// 3️⃣ ทำ Loading state ปุ่ม
// 4️⃣ ทำ Remember me
// 5️⃣ ทำ animation ตอน login สำเร็จ