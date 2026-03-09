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
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedQuizzes, setSelectedQuizzes] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
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


  const deleteQuiz = () => {

    if (!deleteMode) {
      setDeleteMode(true);
      return;
    }

    if (selectedQuizzes.length === 0) {
      alert("Please select at least one quiz");
      return;
    }

    setShowDeleteConfirm(true);

  };

  const confirmDelete = () => {

    selectedQuizzes.forEach((id) => {
      socket.emit("delete_quiz", id);
    });

    socket.once("quiz_deleted", (deletedId) => {
      setQuizzes((prev) =>
        prev.filter((q) => !selectedQuizzes.includes(q.id))
      );
    });

    setDeleteMode(false);
    setSelectedQuizzes([]);
    setShowDeleteConfirm(false);

  };

  const toggleSelectQuiz = (id) => {

    setSelectedQuizzes((prev) => {

      if (prev.includes(id)) {
        return prev.filter((q) => q !== id);
      }

      return [...prev, id];

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
              onClick={() => {
                if (deleteMode) {
                  toggleSelectQuiz(quiz.id);
                } else {
                  navigate(`/editquiz/${quiz.id}`);
                }
              }}
              className={`flex items-center justify-between
                  bg-slate-800 border
                  p-4 rounded-xl transition
                  ${deleteMode ? "cursor-default" : "cursor-pointer"}
                  hover:border-cyan-400/40 hover:shadow-lg hover:shadow-cyan-400/10
                  ${selectedQuizzes.includes(quiz.id)
                  ? "border-rose-400 bg-rose-400/10"
                  : "border-slate-700"
                }`}
            >

              {/* Left */}
              <div className="flex items-center gap-4">

                {/* Checkbox (show only in delete mode) */}
                {deleteMode && (

                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSelectQuiz(quiz.id);
                    }}
                    className={`w-5 h-5 border rounded flex items-center justify-center
                    ${selectedQuizzes.includes(quiz.id)
                        ? "bg-rose-500 border-rose-500 text-white"
                        : "border-slate-500"
                      }`}
                  >
                    {selectedQuizzes.includes(quiz.id) && "✓"}
                  </div>

                )}

                {/* Avatar */}
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
          {deleteMode
            ? `Delete Selected (${selectedQuizzes.length})`
            : "Delete Quiz"}
        </button>
        {showDeleteConfirm && (

          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">

            <div className="bg-slate-800 border border-slate-700 rounded-xl
                p-6 w-full max-w-sm mx-4
                shadow-xl">

              <h3 className="text-lg font-semibold text-slate-100 mb-3">
                Delete Quiz
              </h3>

              <p className="text-slate-400 mb-6">
                Are you sure you want to delete
                <span className="text-rose-400">
                  {" "} {selectedQuizzes.length} quiz(es)
                </span> ?
              </p>

              <div className="flex gap-3">

                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-2 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>

                <button
                  onClick={confirmDelete}
                  className="flex-1 py-2 rounded-lg bg-rose-500 text-white hover:bg-rose-400"
                >
                  Delete
                </button>

              </div>

            </div>

          </div>

        )}
        {deleteMode && (
          <button
            onClick={() => {
              setDeleteMode(false);
              setSelectedQuizzes([])
            }}
            className="w-72 py-3 rounded-lg
               border border-slate-600
               text-slate-300 hover:bg-slate-800 transition"
          >
            Cancel
          </button>
        )}
      </div>
      {/* </main> */}
    </div>
  );
}