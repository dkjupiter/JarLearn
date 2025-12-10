import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import HideClass from "./ClassCard";
import Sidebar_account from "../Sidebar_account";
import io from "socket.io-client";
import { useTeacher } from "../TeacherContext";

const socket = io("http://localhost:4000");

export default function Myclass() {
  const location = useLocation();
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const { teacherId } = useTeacher();

useEffect(() => {
  if (!teacherId) return; // ป้องกัน undefined
  socket.emit("get_classrooms", teacherId);

  socket.on("classrooms_data", (data) => {
    if (data.error) alert("Error fetching classes: " + data.error);
    else setClasses(data.map(cls => ({
      id: cls.Class_ID,
      name: cls.Class_Name,
      section: cls.Class_Section,
      hidden: false,
      quizData: [],
      pollData: [],
      chatData: []
    })));
  });

  return () => socket.off("classrooms_data");
}, [teacherId]);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Sidebar_account />

      <main className="flex flex-col flex-1 p-6 mt-14">
        <h2 className="text-2xl font-bold mb-6">My Class</h2>

        <div className="flex flex-col gap-4">
          {classes.map((cls) => (
            <HideClass
              key={cls.id}
              cls={cls}
              onClick={() => navigate(`/classroom/${cls.id}`, { state: { cls } })}
            />
          ))}
        </div>

        <button
          onClick={() => navigate("/createclass")}
          className="fixed bottom-10 w-72 py-3 mt-9 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition self-center"
        >
          Create Class
        </button>
      </main>
    </div>
  );
}
