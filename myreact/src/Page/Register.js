import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar_guest";
// import io from "socket.io-client";

// const socket = io("http://localhost:4000");
import { socket } from "../socket";

export default function Register() {
  const navigate = useNavigate();

  // state ฟอร์ม
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

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
            className={`w-72 p-3 bg-gray-200 rounded-md focus:outline-none focus:ring-2
              ${emailError ? "focus:ring-red-500" : "focus:ring-blue-500"}`}
            value={email}
            onChange={(e) => handleEmailChange(e.target.value)}
          />

          {emailError && (
            <p className="mt-1 text-sm text-red-500">{emailError}</p>
          )}
        </label>

        {/* Password */}
        <label htmlFor="password" className="block mb-4">
          <span className="block mb-1 text-gray-700">Password</span>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            className={`w-72 p-3 bg-gray-200 rounded-md focus:outline-none focus:ring-2
              ${passwordError ? "focus:ring-red-500" : "focus:ring-blue-500"}`}
            value={password}
            onChange={(e) => handlePasswordChange(e.target.value)}
          />
          <p className={`mt-1 text-sm leading-snug text-gray-500`}>
            {
              <>
                • At least 8 characters<br />
                • English letters (A–Z, a–z)<br />
                • Numbers (0–9)<br />
                • Special characters (!@#$%^&*,.?)<br />
              </>
            }
          </p>

          <p className={`mt-1 text-sm text-red-500`}>
            {passwordError}
          </p>
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
