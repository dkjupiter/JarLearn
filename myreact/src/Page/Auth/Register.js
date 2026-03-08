import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Sidebar_guest";
import { Eye, EyeOff } from "lucide-react";
import { socket } from "../../socket";

export default function Register() {
  const navigate = useNavigate();

  // state ฟอร์ม
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // รับผลจาก backend
  useEffect(() => {
    socket.on("register_result", (data) => {
      if (data.success) {
        // alert("Register success!");
        navigate("/");
      } else {
        alert("Register failed: " + data.message);
      }
    });

    return () => socket.off("register_result");
  }, [navigate]);

  const handleRegister = () => {
    if (password.length < 8) {
      alert("Password must be at least 8 characters long.");
      return;
    }

    if (!name || !email || !password) {
      alert("Please fill in all fields.");
      return;
    }

    if (emailError || passwordError) {
      alert("Please fix the errors before submitting.");
      return;
    }

    socket.emit("register", { name, email, password });
  };

  const handleEmailChange = (value) => {
    setEmail(value);

    if (value.length === 0) {
      setEmailError("");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    setEmailError("");
  };

  const handlePasswordChange = (value) => {
    setPassword(value);

    if (value.length === 0) {
      setPasswordError("");
      return;
    }

    if (value.length < 8) {
      setPasswordError("Password must be at least 8 characters long.");
      return;
    }

    if (!/^[A-Za-z0-9!@#$%^&*,.?]+$/.test(value)) {
      setPasswordError(
        "Password can contain English letters, numbers, and special characters only."
      );
      return;
    }

    setPasswordError("");
  };
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <Sidebar />

      <main className="flex flex-col items-center justify-center flex-1 p-6">
        {/* Card */}
        <div className="w-full max-w-md bg-slate-800 rounded-2xl p-8 shadow-2xl border border-slate-700">
          <h2 className="text-2xl font-bold text-center text-slate-100 mb-6">
            Register
          </h2>

          {/* Name */}
          <label htmlFor="name" className="block mb-4">
            <span className="block mb-1 text-slate-300">Name</span>
            <input
              id="name"
              type="text"
              placeholder="Enter your name"
              className="w-full p-3 bg-slate-700 text-slate-100 rounded-lg
                       placeholder-slate-400
                       focus:outline-none focus:ring-2 focus:ring-cyan-400"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>

          {/* Email */}
          <label htmlFor="email" className="block mb-4">
            <span className="block mb-1 text-slate-300">Email</span>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              className={`w-full p-3 bg-slate-700 text-slate-100 rounded-lg
              placeholder-slate-400 focus:outline-none focus:ring-2
              ${emailError ? "focus:ring-red-400" : "focus:ring-cyan-400"}`}
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
            />

            {emailError && (
              <p className="mt-1 text-sm text-red-400">{emailError}</p>
            )}
          </label>

          {/* Password */}
          <label htmlFor="password" className="block mb-4">
            <span className="block mb-1 text-slate-300">Password</span>

            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className={`w-full p-3 pr-10 bg-slate-700 text-slate-100 rounded-lg
        placeholder-slate-400 focus:outline-none focus:ring-2
        ${passwordError ? "focus:ring-red-400" : "focus:ring-cyan-400"}`}
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
              />

              {/* Eye toggle */}
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

            <p className="mt-2 text-m leading-relaxed text-slate-400">
              • At least 8 characters<br />
              • English letters (A–Z, a–z)<br />
              • Numbers (0–9)<br />
              • Special characters (!@#$%^&*,.?)
            </p>

            {passwordError && (
              <p className="mt-1 text-sm text-red-400">{passwordError}</p>
            )}
          </label>

          {/* Register Button */}
          <button
            type="button"
            onClick={handleRegister}
            className="w-full py-3 mt-4 rounded-lg
                     bg-cyan-400 text-slate-900 font-semibold
                     hover:bg-cyan-300 hover:scale-[1.02]
                     shadow-lg shadow-cyan-400/30
                     transition"
          >
            Create account
          </button>

          {/* Back */}
          <button
            onClick={() => navigate("/")}
            className="w-full py-3 mt-3 rounded-lg
                     border border-slate-600 text-slate-300
                     hover:bg-slate-700 hover:text-white
                     transition"
          >
            Back to Sign in
          </button>
        </div>
      </main>
    </div>
  );
}
