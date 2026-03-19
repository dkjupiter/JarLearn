import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar_account from "../Sidebar_account";
import { useTeacher } from "../TeacherContext";
import QuestionPreview from "../components/QuestionPreview";
import { socket } from "../../socket";
import toast from "react-hot-toast";

export default function CreateQuiz() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { teacherId } = useTeacher();

  const [quizName, setQuizName] = useState("Quiz Name");
  const [draftQuestions, setDraftQuestions] = useState([]);
  const MAX_QUESTIONS = 40;
  const [errors, setErrors] = useState({});

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
    let newErrors = {};

    if (!quizName.trim()) {
      newErrors.quizName = "Please enter quiz name";
    }

    if (!draftQuestions.length) {
      newErrors.questions = "Please add at least 1 question";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    socket.emit("submit_create_question", {
      teacherId,
      title: quizName,
      question_last_edit: new Date(),
      questionset: draftQuestions,
    });

    socket.once("submit_create_set_result", (res) => {
      if (res.success) {
        toast.success("Quiz created successfully");
        localStorage.removeItem("draftQuestions");
        navigate("/managequiz");
      } else {
        toast.error(res.message || "Failed to create quiz");
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
      <div className="pt-20 px-6">

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

          {/* LEFT SIDE */}
          <div className="flex items-center gap-3 flex-wrap">

            <button
              onClick={() => navigate("/managequiz")}
              className="text-slate-400 hover:text-cyan-400 text-sm md:text-lg transition"
            >
              ← Back to Manage Quiz
            </button>

            <span className="hidden md:block">/</span>

            <h1 className="text-xl md:text-2xl font-semibold">
              Create Quiz
            </h1>

          </div>

          {/* RIGHT SIDE BADGE */}
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-full border font-semibold
            ${draftQuestions.length >= 40
              ? "bg-rose-900/40 border-rose-500 text-rose-400"
              : "bg-slate-800 border-slate-700 text-cyan-400"
            }`}
          >
            {draftQuestions.length} / 40 Questions
          </div>

        </div>

      </div>

      {/* SCROLL CONTENT */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 pb-40">
        {/* Quiz Name */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <input
            value={quizName}
            onChange={(e) => {
              setQuizName(e.target.value);

              if (e.target.value.trim()) {
                setErrors((prev) => ({ ...prev, quizName: "" }));
              }
            }}
            placeholder="Quiz Name"
            className={`w-full bg-transparent text-lg font-semibold outline-none
              ${errors.quizName ? "border-b border-rose-500 pb-1" : ""}
            `}
          />

          {errors.quizName && (
            <p className="text-rose-500 text-xs mt-0.5">
              {errors.quizName}
            </p>
          )}
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
        {errors.questions && (
          <p className="text-rose-500 text-sm text-center">
            {errors.questions}
          </p>
        )}
        <button
          disabled={draftQuestions.length >= MAX_QUESTIONS}
          onClick={() =>
            navigate("/addquestion", {
              state: { quizName, draftQuestions },
            })
          }
          className={`w-72 py-3 rounded-xl transition
          ${draftQuestions.length >= MAX_QUESTIONS
              ? "bg-slate-700 text-slate-400 cursor-not-allowed"
              : "border border-slate-600 hover:bg-slate-800"
            }`}
        >
          {draftQuestions.length >= MAX_QUESTIONS
            ? "Question limit reached (40)"
            : "Add Question"}
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