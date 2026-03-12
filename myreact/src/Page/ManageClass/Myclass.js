import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import HideClass from "./ClassCard";
import Sidebar_account from "../Sidebar_account";
import { useTeacher } from "../TeacherContext";
import toast from "react-hot-toast";
import { Toaster } from "react-hot-toast";

import { socket } from "../../socket";

export default function Myclass() {
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
      if (data.error) {
        toast.error("Error fetching classes: " + data.error);
      }
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

      <div class="pt-14"></div>

      {/* <main className="pt-[56px] h-[calc(100vh-56px)] flex flex-col"> */}
      {/* <h2 className="text-2xl font-bold p-6 text-slate-100">My Class</h2> */}

      {/* Header */}
      <div className="p-6 pt-6 flex items-center justify-between">

        <div>
          <h2 className="text-2xl font-bold p-1 text-slate-100">My class</h2>
          <p className="text-slate-400 text-sm">Manage your classes</p>
        </div>

        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-full border font-semibold
            ${classes.length >= 50
              ? "bg-rose-900/40 border-rose-500 text-rose-400"
              : "bg-slate-800 border-slate-700 text-cyan-400"
            }`}
        >
          {classes.length} / 50 Classes
        </div>

      </div>

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
          disabled={classes.length >= 50}
          onClick={() => navigate("/createclass")}
          className={`w-72 py-3 rounded-lg font-semibold transition
            ${classes.length >= 50
              ? "bg-slate-700 text-slate-400 cursor-not-allowed"
              : "bg-cyan-400 text-slate-900 hover:bg-cyan-300 hover:scale-[1.02] shadow-lg shadow-cyan-400/30"
            }`}
        >
          {classes.length >= 50 ? "Class limit reached (50)" : "Create Class"}
        </button>
      </div>
      {/* </main> */}
    </div>
  );
}