import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar_guest";
import io from "socket.io-client";

const socket = io("http://localhost:4000");

export default function Register() {
  const navigate = useNavigate();

  // state ฟอร์ม
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // รับผลจาก backend
  useEffect(() => {
    socket.on("register_result", (data) => {
      if (data.success) {
        alert("Register success!");
        navigate("/");
      } else {
        alert("Register failed: " + data.message);
      }
    });

    return () => socket.off("register_result");
  }, []);

  const handleRegister = () => {
    socket.emit("register", {
      name,
      email,
      password,
    });
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Sidebar />

      <main className="flex flex-col items-center justify-center flex-1 p-6">
        <h2 className="text-2xl font-bold mb-6">Register</h2>

        {/* Name */}
        <label htmlFor="name" className="block mb-4">
          <span className="block mb-1 text-gray-700">Name</span>
          <input
            id="name"
            type="text"
            placeholder="Enter your name"
            className="w-72 p-3 bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>

        {/* Email */}
        <label htmlFor="email" className="block mb-4">
          <span className="block mb-1 text-gray-700">Email</span>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            className="w-72 p-3 bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        {/* Password */}
        <label htmlFor="password" className="block mb-4">
          <span className="block mb-1 text-gray-700">Password</span>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            className="w-72 p-3 bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        {/* Buttons */}
        <button type="button"
          onClick={handleRegister}
          className="w-72 py-3 mt-9 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition"
        >
          Register
        </button>

        <button
          onClick={() => navigate("/")}
          className="w-72 py-3 mt-4 bg-white border border-gray-400 text-gray-700 rounded-md hover:bg-gray-100 transition"
        >
          Back
        </button>
      </main>
    </div>
  );
}
