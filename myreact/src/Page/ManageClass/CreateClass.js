import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar_account from "../Sidebar_account";
import { useTeacher } from "../TeacherContext";
// import io from "socket.io-client";

// const socket = io("http://localhost:4000");
import { socket } from "../../socket";

export default function CreateClass() {
  const location = useLocation();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [section, setSection] = useState("");
  const [subject, setSubject] = useState("");
  const [code, setCode] = useState("");
  const { teacherId } = useTeacher();
  const [codeError, setCodeError] = useState("");

  const generateCode = (length = 8) => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
  };

  // เช็กรหัสห้องแบบเรียลไทม์
  const handleCodeChange = (value) => {
    setCode(value);

    if (value.length === 0) {
      setCodeError("");
      return;
    }

    if (!/^[A-Za-z0-9]*$/.test(value)) {
      setCodeError("Only English letters (A–Z, a–z) or numbers (0–9) are allowed.");
      return;
    }

    if (value.length !== 8) {
      setCodeError("Code must be exactly 8 characters long.");
      return;
    }

    setCodeError("");
  };

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
      alert("Please fill in all fields.");
      return;
    }

    if (!/^[A-Za-z0-9]{8}$/.test(code)) {
      alert("Code must be exactly 8 characters and contain only English letters or numbers.");
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
<label className="block mb-4 w-72 text-left">
  <span className="block mb-1 text-gray-700">Code Room</span>

  <div
    className={`h-11 flex items-center rounded-md bg-gray-200
      focus-within:ring-2
      ${codeError ? "focus-within:ring-red-500" : "focus-within:ring-blue-500"}`}
  >
    <input
      type="text"
      maxLength={8}
      placeholder="8 characters"
      className="flex-1 h-full px-3 bg-transparent focus:outline-none"
      value={code}
      onChange={(e) => handleCodeChange(e.target.value)}
    />

    <button
      type="button"
      onClick={() => {
        const newCode = generateCode(8);
        setCode(newCode);
        setCodeError("");
      }}
      className="px-1 text-gray-400 hover:text-blue-500"
      title="Generate random code"
    >
      Random 
    </button>
  </div>

  <p className={`mt-1 text-sm leading-snug text-gray-500`}>
    {
      <>
        • 8 characters<br />
        • English letters (A–Z, a–z)<br />
        • Numbers (0–9)
      </>
    }
  </p>

  <p className={`mt-1 text-sm leading-snug text-red-500`}>
    { codeError}
  </p>

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
