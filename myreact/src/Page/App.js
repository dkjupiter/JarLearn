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

useEffect(() => {
  socket.on("login_result", (data) => {
    if (data.success && data.user?.id) {
      setTeacherId(data.user.id); // เก็บ global state
      navigate("/myclass");
    } else {
      alert("Login failed: " + data.message);
    }
  });

  return () => socket.off("login_result");
}, [navigate, setTeacherId]);


  const handleLogin = () => {
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
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        <label className="block mb-4">
          <span className="block mb-1 text-gray-700">Password</span>
          <input
            type="password"
            placeholder="Enter your password"
            className="w-72 p-3 bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

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
