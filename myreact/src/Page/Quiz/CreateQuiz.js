"use client";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar_account from "../Sidebar_account";
import { useTeacher } from "../TeacherContext";
import QuestionPreview from "../components/QuestionPreview";
import { socket } from "../../socket";

export default function CreateQuiz() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { teacherId } = useTeacher();

  const [quizName, setQuizName] = useState("Quiz Name");
  const [draftQuestions, setDraftQuestions] = useState([]);

  /* ================= LOAD STATE ================= */
  useEffect(() => {
    if (state?.quizName) setQuizName(state.quizName);

    if (state?.draftQuestions) {
      setDraftQuestions(state.draftQuestions);
      localStorage.setItem(
        "draftQuestions",
        JSON.stringify(state.draftQuestions)
      );
    } else {
      // fallback กัน refresh แล้วหาย
      const saved = localStorage.getItem("draftQuestions");
      if (saved) setDraftQuestions(JSON.parse(saved));
    }
  }, [state]);

  /* ================= SAVE LOCAL ================= */
  useEffect(() => {
    localStorage.setItem("draftQuestions", JSON.stringify(draftQuestions));
  }, [draftQuestions]);

  /* ================= CREATE QUIZ ================= */
  const handleFinalCreate = () => {
    if (!quizName.trim()) return alert("Please enter quiz name");
    if (!draftQuestions.length) return alert("No questions yet");

    socket.emit("submit_create_question", {
      teacherId,
      title: quizName,
      question_last_edit: Date,
      questionset: draftQuestions,
    });

    socket.once("submit_create_set_result", (res) => {
      if (res.success) {
        localStorage.removeItem("draftQuestions");
        navigate("/managequiz");
      } else {
        alert(res.message);
      }
    });
  };

  /* ================= DELETE ================= */
  const deleteQuestion = (index) => {
    setDraftQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <Sidebar_account />

      {/* HEADER */}
      <div className="pt-16 px-6">
        <button
          onClick={() => navigate("/managequiz")}
          className="text-cyan-400 hover:underline"
        >
          ← Back
        </button>

        <h1 className="text-2xl font-semibold mt-4">Create Quiz</h1>
      </div>

      {/* SCROLL CONTENT */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 pb-40">
        {/* Quiz Name */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <input
            value={quizName}
            onChange={(e) => setQuizName(e.target.value)}
            placeholder="Quiz Name"
            className="w-full bg-transparent text-lg font-semibold outline-none"
          />
        </div>

        {/* QUESTION LIST */}
        <div className="flex flex-col gap-4">
          {draftQuestions.length === 0 && (
            <p className="text-center text-slate-400 py-10">
              No questions yet
            </p>
          )}

          {draftQuestions.map((q, index) => (
            <QuestionPreview
              key={index}
              q={q}
              index={index}
              onClick={() =>
                navigate(`/editquestion/${index}`, {
                  state: {
                    question: q,
                    index,
                    quizName,
                    draftQuestions,
                  },
                })
              }
              onDelete={deleteQuestion}
            />
          ))}
        </div>
      </div>

      {/* BOTTOM ACTION BAR */}
      <div className="sticky bottom-0 bg-slate-900 border-t border-slate-800 p-4 flex flex-col gap-3 items-center">
        <button
          onClick={() =>
            navigate("/addquestion", {
              state: { quizName, draftQuestions },
            })
          }
          className="w-72 py-3 border border-slate-600 rounded-xl hover:bg-slate-800 transition"
        >
          Add Question
        </button>

        <button
          onClick={handleFinalCreate}
          className="w-72 py-3 bg-cyan-400 text-slate-900 font-semibold rounded-xl hover:bg-cyan-300 transition"
        >
          Create Quiz
        </button>
      </div>
    </div>
  );
}