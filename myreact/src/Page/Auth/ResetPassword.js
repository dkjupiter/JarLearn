import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Sidebar from "../Sidebar_guest";
import { socket } from "../../socket";

export default function ResetPassword() {

  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleReset = () => {

    socket.emit("reset_password", {
      token,
      newPassword: password
    });

    socket.once("reset_result", (res) => {

      if (res.success) {
        setMsg("Password updated successfully");
        setTimeout(() => navigate("/"), 1500);
      } else {
        setMsg(res.message || "Reset failed");
      }

    });

  };

  return (

    <div className="min-h-screen bg-slate-900 flex flex-col">

      <Sidebar />

      <main className="flex flex-col items-center justify-center flex-1 p-6">

        {/* Card */}
        <div className="w-full max-w-md bg-slate-800 rounded-2xl p-8 shadow-2xl border border-slate-700">

          <h2 className="text-2xl font-bold text-center text-slate-100 mb-6">
            Reset Password
          </h2>

          <p className="text-sm text-slate-400 text-center mb-6">
            Enter your new password
          </p>

          {/* Password */}
          <label className="block mb-4">

            <span className="block mb-1 text-slate-300">
              New Password
            </span>

            <div className="relative">

              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setMsg("");
                }}
                className="w-full h-11 px-3 pr-10 bg-slate-700 text-slate-100 rounded-lg
                           placeholder-slate-400
                           focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />

              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2
                           text-slate-400 hover:text-cyan-300 transition"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>

            </div>

          </label>

          {/* Message */}
          {msg && (
            <p className="text-sm text-center mb-4 text-cyan-300">
              {msg}
            </p>
          )}

          {/* Reset */}
          <button
            onClick={handleReset}
            className="w-full py-3 rounded-lg
                       bg-cyan-400 text-slate-900 font-semibold
                       hover:bg-cyan-300 active:scale-95
                       shadow-lg shadow-cyan-400/30
                       transition"
          >
            Reset Password
          </button>

          {/* Back */}
          <button
            onClick={() => navigate("/")}
            className="w-full py-3 mt-3 rounded-lg
                       border border-slate-600 text-slate-300
                       hover:bg-slate-700 hover:text-white
                       transition"
          >
            Back to Login
          </button>

        </div>

      </main>

    </div>

  );

}