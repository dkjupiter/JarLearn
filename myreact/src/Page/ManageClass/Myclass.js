import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import HideClass from "./ClassCard";
import Sidebar_account from "../Sidebar_account";
// import io from "socket.io-client";
import { useTeacher } from "../TeacherContext";

// const socket = io("http://localhost:4000");

import { socket } from "../../socket";

export default function Myclass() {
  // const location = useLocation();
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const { teacherId } = useTeacher();

  const handleHide = (id) => {
    socket.emit("hide_class", id);
    setClasses(prev =>
      prev.map(c => (c.id === id ? { ...c, hidden: true } : c))
    );
  };

  const handleShow = (id) => {
    socket.emit("show_class", id);
    setClasses(prev =>
      prev.map(c => (c.id === id ? { ...c, hidden: false } : c))
    );
  };

  useEffect(() => {
    console.log("Myclass teacherId:", teacherId);
  }, [teacherId]);


  useEffect(() => {
    if (!teacherId) return; // ป้องกัน undefined
    socket.emit("get_classrooms", teacherId);

    socket.on("classrooms_data", (data) => {
      if (data.error) alert("Error fetching classes: " + data.error);
      else setClasses(data.map(cls => ({
        id: cls.Class_ID,
        name: cls.Class_Name,
        section: cls.Class_Section,
        hidden: cls.Is_Hidden,
        quizData: [],
        pollData: [],
        chatData: []
      })));
    });

    return () => socket.off("classrooms_data");
  }, [teacherId]);
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <Sidebar_account />

      {/* <main className="pt-[56px] h-[calc(100vh-56px)] flex flex-col"> */}
        <h2 className="text-2xl font-bold p-6 text-slate-100">My Class</h2>

        {/* Scrollable list */}
        <div className="flex-1 overflow-y-auto px-6">
          <div className="flex flex-col gap-4 pb-6">
            {[...classes]
              .sort((a, b) => a.hidden - b.hidden)
              .map((cls) => (
                <HideClass
                  key={cls.id}
                  cls={cls}
                  onHide={handleHide}
                  onShow={handleShow}
                  onClick={() =>
                    navigate(`/classroom/${cls.id}`, { state: { cls } })
                  }
                />
              ))}
          </div>
        </div>

        {/* Bottom Action Bar */}
         <div className="sticky bottom-0 bg-slate-900 border-t border-slate-800 p-4 flex flex-col gap-3 items-center">
         <button
            onClick={() => navigate("/createclass")}
            className="w-72 py-3 rounded-lg
                     bg-cyan-400 text-slate-900 font-semibold
                     hover:bg-cyan-300 hover:scale-[1.02]
                     shadow-lg shadow-cyan-400/30 transition"
          >
            Create Class
          </button>
        </div>
      {/* </main> */}
    </div>
  );
}
