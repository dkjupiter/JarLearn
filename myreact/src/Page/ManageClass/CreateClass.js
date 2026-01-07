import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar_account from "../Sidebar_account";
import { useTeacher } from "../TeacherContext";
import io from "socket.io-client";

const socket = io("http://localhost:4000");

export default function CreateClass() {
  const location = useLocation();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [section, setSection] = useState("");
  const [subject, setSubject] = useState("");
  const [code, setCode] = useState("");
  const { teacherId } = useTeacher();

  // ถ้า teacherId ยังไม่มี → redirect
  useEffect(() => {
  // ฟังผลลัพธ์จาก server
  socket.on("create_class_result", (data) => {
    if (data.success) {
      navigate("/myclass"); // กลับหน้า My Class
    } else {
      alert("Failed to create class: " + data.message);
    }
  });

  // ล้าง listener เมื่อ component unmount
  return () => {
    socket.off("create_class_result");
  };
}, [navigate]);

  const handleCreate = () => {
    if (!name || !section || !subject || !code || !teacherId) {
      alert("Please fill all fields");
      return;
    }
    socket.emit("create_class", { name, section, subject, code, teacherId });
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Sidebar_account />
      <main className="flex flex-col flex-1 p-6">
        <div className="flex flex-col items-center justify-center flex-1">
          <h2 className="text-2xl font-bold mb-6">Create Class</h2>

          {/* Class Name */}
          <label className="block mb-4">
            <span className="block mb-1 text-gray-700">Class name</span>
            <input
              type="text"
              placeholder="Enter class name"
              className="w-72 p-3 bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>

          {/* Section */}
          <label className="block mb-4">
            <span className="block mb-1 text-gray-700">Section</span>
            <input
              type="text"
              placeholder="Enter section"
              className="w-72 p-3 bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={section}
              onChange={(e) => setSection(e.target.value)}
            />
          </label>

          {/* Subject */}
          <label className="block mb-4">
            <span className="block mb-1 text-gray-700">Subject</span>
            <input
              type="text"
              placeholder="Enter subject"
              className="w-72 p-3 bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </label>

          {/* Code Room */}
          <label className="block mb-4">
            <span className="block mb-1 text-gray-700">Code Room</span>
            <input
              type="text"
              placeholder="Enter code room"
              className="w-72 p-3 bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </label>

          {/* Buttons */}
          <button
            onClick={handleCreate}
            className="w-72 py-3 mt-6 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition"
          >
            Create
          </button>

          <button
            onClick={() => navigate("/myclass")}
            className="w-72 py-3 mt-4 bg-white border border-gray-400 text-gray-700 rounded-md hover:bg-gray-100 transition"
          >
            Back
          </button>
        </div>
      </main>
    </div>
  );
}
