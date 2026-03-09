import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Sidebar_guest";
import { socket } from "../../socket";

export default function ForgotPassword() {

  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const handleSend = () => {

    socket.emit("forgot_password", { email });

    socket.once("forgot_result", (res) => {

      if (res.success) {
        setMsg("Reset link sent to your email");
      } else {
        setMsg(res.message);
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
            Forgot Password
          </h2>

          <p className="text-sm text-slate-400 text-center mb-6">
            Enter your email and we will send a reset link
          </p>

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
                setMsg("");
              }}
            />

          </label>

          {/* Message */}
          {msg && (
            <p className="text-sm text-center mb-4 text-cyan-300">
              {msg}
            </p>
          )}

          {/* Send */}
          <button
            onClick={handleSend}
            className="w-full py-3 rounded-lg
                       bg-cyan-400 text-slate-900 font-semibold
                       hover:bg-cyan-300 active:scale-95
                       shadow-lg shadow-cyan-400/30
                       transition"
          >
            Send Reset Link
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