import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar_account from "../Sidebar_account";
import { useTeacher } from "../TeacherContext";
import { formatSmartDate } from "../../utils/date";

import { socket } from "../../socket";

export default function ManageQuiz() {
  const navigate = useNavigate();
  const { classId } = useParams();
  const [quizzes, setQuizzes] = useState([]);
  const { teacherId } = useTeacher();

  // โหลด Quiz
  useEffect(() => {
    if (!teacherId) return;

    console.log("Requesting quizzes for teacherId:", teacherId);
    socket.emit("get_question_sets", teacherId);

    socket.once("question_sets_data", (data) => {
      console.log("Received question_sets_data:", data);
      if (data.error) console.error(data.error);
      else {
        setQuizzes(
          data.map((q) => ({
            id: q.Set_ID,
            name: q.Title,
            date: q.Question_Last_Edit
          }))
        );
      }
    });

    return () => socket.off("question_sets_data");
  }, [teacherId]);

  // ลบ Quiz
  const deleteQuiz = () => {
    if (quizzes.length === 0) return;

    const lastQuiz = quizzes[quizzes.length - 1];

    socket.emit("delete_quiz", lastQuiz.id);

    socket.once("quiz_deleted", (deletedId) => {
      setQuizzes((prev) => prev.filter((q) => q.id !== deletedId));
    });
  };
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <Sidebar_account />

      <div class="pt-14"></div>

      {/* <main className="pt-[56px] h-[calc(100vh-56px)] flex flex-col"> */}

        {/* Header */}
        <div className="p-6 pt-6">
          <h2 className="text-2xl font-bold p-1 text-slate-100">Quiz</h2>
          <p className="text-slate-400 text-sm">Manage your quiz sets</p>
        </div>

        {/* Quiz List */}
        <div className="flex-1 overflow-y-auto px-6">
          <div className="flex flex-col gap-3 pb-6">
            {quizzes.map((quiz) => (
              <div
                key={quiz.id}
                onClick={() => navigate(`/editquiz/${quiz.id}`)}
                className="flex items-center justify-between
                         bg-slate-800 border border-slate-700
                         p-4 rounded-xl cursor-pointer transition
                         hover:border-cyan-400/40 hover:shadow-lg hover:shadow-cyan-400/10"
              >
                {/* Left */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-cyan-400/20 flex items-center justify-center">
                    <span className="text-cyan-300 font-bold text-lg">
                      {quiz.name.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex flex-col">
                    <span className="text-base font-medium text-slate-100">
                      {quiz.name}
                    </span>
                    <span className="text-sm text-slate-400">
                      Last edit: {formatSmartDate(quiz.date)}
                    </span>
                  </div>
                </div>

                {/* Arrow */}
                <span className="text-slate-500 text-xl">›</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="sticky bottom-0 bg-slate-900 border-t border-slate-800 p-4 flex flex-col gap-3 items-center">
          {/* 🔵 Primary */}
          <button
            onClick={() => navigate("/quizediter")}
            className="w-72 py-3 rounded-lg
                     bg-cyan-400 text-slate-900 font-semibold
                     hover:bg-cyan-300 hover:scale-[1.02]
                     shadow-lg shadow-cyan-400/30 transition"
          >
            Create Quiz
          </button>

          {/* 🔴 Danger */}
          <button
            onClick={deleteQuiz}
            className="w-72 py-3 rounded-lg
                     bg-rose-500 text-white font-medium
                     hover:bg-rose-400 transition"
          >
            Delete Quiz
          </button>
        </div>
      {/* </main> */}
    </div>
  );
}
