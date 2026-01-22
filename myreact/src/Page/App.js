import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar_guest";
import io from "socket.io-client";
import { useTeacher } from "./TeacherContext";

const socket = io("http://localhost:4000");

export default function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { setTeacherId } = useTeacher();
  const [loginError, setLoginError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    socket.on("login_result", (data) => {
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
    <div className="min-h-screen bg-white flex flex-col">
      <Sidebar />

      <main className="flex flex-col items-center justify-center flex-1 p-6">
        <h2 className="text-2xl font-bold mb-6">Sign in</h2>

        <label className="block mb-4">
          <span className="block mb-1 text-gray-700">Email</span>
          <input
            type="email"
            placeholder="Enter your email"
            className="w-72 p-3 bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setLoginError("");
            }}
          />
        </label>

        <label className="block mb-4 w-72 text-left">
  <span className="block mb-1 text-gray-700">Password</span>

  <div className="relative">
    <input
      type={showPassword ? "text" : "password"}
      placeholder="Enter your password"
      className="w-full h-11 px-3 pr-10 bg-gray-200 rounded-md
                 focus:outline-none focus:ring-2 focus:ring-blue-500"
      value={password}
      onChange={(e) => {
        setPassword(e.target.value);
        setLoginError("");
      }}
    />

    {/* eye icon */}
    <button
      type="button"
      onClick={() => setShowPassword((prev) => !prev)}
      className="absolute right-3 top-1/2 -translate-y-1/2
                 text-gray-400 hover:text-gray-600"
      title={showPassword ? "Hide password" : "Show password"}
    >
      {showPassword ? (
        // eye-off icon
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.8}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 3l18 18M10.58 10.58A3 3 0 0012 15a3 3 0 002.42-4.42M9.88 9.88A3 3 0 0112 9a3 3 0 013 3c0 .42-.08.82-.22 1.18M2.46 12C3.73 7.94 7.52 5 12 5c1.55 0 3.03.35 4.36.98M21.54 12c-.37 1.2-1 2.3-1.82 3.22"
          />
        </svg>
      ) : (
        // eye icon
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.8}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.46 12C3.73 7.94 7.52 5 12 5c4.48 0 8.27 2.94 9.54 7-1.27 4.06-5.06 7-9.54 7-4.48 0-8.27-2.94-9.54-7z"
          />
          <circle cx="12" cy="12" r="3" />
        </svg>
      )}
    </button>
  </div>
</label>


        {loginError && (
          <p className="w-72 mb-3 text-sm text-red-500 text-center">
            {loginError}
          </p>
        )}

        <button
          onClick={handleLogin}
          className="w-72 py-3 mt-9 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition"
        >
          Sign in
        </button>

        <button
          onClick={() => navigate("/register")}
          className="w-72 py-3 mt-4 bg-white border border-gray-400 text-gray-700 rounded-md hover:bg-gray-100 transition"
        >
          No account? Register!
        </button>
      </main>
    </div>
  );
}
