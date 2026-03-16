import { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import Sidebar_account from "../Sidebar_account";
import { useTeacher } from "../TeacherContext";
import QuestionPreview from "../components/QuestionPreview";
import { socket } from "../../socket";
import toast from "react-hot-toast";

export default function EditQuiz() {

  const navigate = useNavigate();
  const { setId: paramSetId } = useParams();
  const { state } = useLocation();
  const { teacherId } = useTeacher();

  const setId = state?.setId || paramSetId;

  const [quizName, setQuizName] = useState("");
  const [draftQuestions, setDraftQuestions] = useState([]);
  const [editMode, setEditMode] = useState(false);

  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);

  const now = new Date().toISOString();

  /* =====================================================
     SAVE QUIZ
  ===================================================== */
  const confirmSaveQuiz = () => {

    if (setId) {

      socket.emit("update_quiz", {
        setId,
        title: quizName,
        question_last_edit: now,
        questionset: draftQuestions,
      });

    } else {

      socket.emit("submit_create_question", {
        teacherId,
        title: quizName,
        question_last_edit: now,
        questionset: draftQuestions,
      });

    }

    setShowSaveConfirm(false);

  };

  const handleSaveQuiz = () => {
    setShowSaveConfirm(true);
  };

  /* =====================================================
     LOAD QUIZ DATA
  ===================================================== */

  useEffect(() => {

    if (state?.draftQuestions) {

      setDraftQuestions(state.draftQuestions);

      if (state.quizName) setQuizName(state.quizName);

      return;

    }

    if (!setId) return;

    const handleData = (data) => {

      if (data.error) {
        toast.error(data.error);
        return;
      }

      setQuizName(data.title || "");

      setDraftQuestions(
        data.questions.map((q) => {

          const options = q.options?.map((o) => o.text) || [];

          const correct =
            (q.correct || [])
              .map((optId) =>
                q.options.findIndex((o) => o.id === optId)
              )
              .filter((i) => i !== -1);

          return {
            type: q.Question_Type,
            text: q.Question_Text,
            options,
            correct,
            image: q.Question_Image || null,
          };

        })
      );

    };

    socket.emit("get_quiz_full_data", setId);
    socket.on("quiz_full_data", handleData);

    return () => socket.off("quiz_full_data", handleData);

  }, [setId, state]);

  /* =====================================================
     UPDATE RESULT
  ===================================================== */

  useEffect(() => {

    const handleUpdateResult = (res) => {

      if (res.success) {
        toast.success("Quiz has been updated");
        navigate("/managequiz");
      } else {
        toast.error("Save failed: " + res.message);
      }

    };

    socket.on("update_quiz_result", handleUpdateResult);

    return () => socket.off("update_quiz_result", handleUpdateResult);

  }, [setId]);

  /* =====================================================
     SAVE QUIZ NAME
  ===================================================== */

  const saveQuizName = () => {

    setEditMode(false);

    socket.emit("update_quiz_name", {
      newName: quizName,
    });

  };

  // const deleteQuestion = (index) => {

  //   const ok = window.confirm("ต้องการลบคำถามนี้หรือไม่?");
  //   if (!ok) return;

  //   setDraftQuestions((prev) =>
  //     prev.filter((_, i) => i !== index)
  //   );

  // };

  const deleteQuestion = (index) => {
    setDeleteIndex(index);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteQuestion = () => {

    setDraftQuestions((prev) =>
      prev.filter((_, i) => i !== deleteIndex)
    );

    toast.success("Question deleted");

    setDeleteIndex(null);
    setShowDeleteConfirm(false);

  };

  /* =====================================================
     UI
  ===================================================== */

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">

      <Sidebar_account />

      {/* HEADER */}

      <div className="pt-20 px-6">

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

          {/* LEFT */}
          <div className="flex items-center gap-3">

            <button
              onClick={() => navigate("/managequiz")}
              className="text-slate-400 hover:text-cyan-400 text-lg transition"
            >
              ← Back to Manage Quiz
            </button>

            <span>/</span>

            <h1 className="text-2xl font-semibold">
              Edit Quiz
            </h1>

          </div>

          {/* RIGHT BADGE */}
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-full border font-semibold
            ${draftQuestions.length >= 40
                ? "bg-rose-900/40 border-rose-500 text-rose-400"
                : "bg-slate-800 border-slate-700 text-cyan-400"
              }`}
          >
            {draftQuestions.length}/40
          </div>

        </div>

      </div>

      {/* SCROLL CONTENT */}

      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 pb-40">

        {/* Quiz Name */}

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">

          <input
            value={quizName}
            onChange={(e) => setQuizName(e.target.value)}
            onBlur={saveQuizName}
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
                    id: setId,
                    question: q,
                    index,
                    draftQuestions,
                    quizName,
                  },
                })
              }
              onDelete={deleteQuestion}
            />

          ))}

        </div>

      </div>


      {showSaveConfirm && (

        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">

          <div className="bg-slate-800 border border-slate-700 rounded-xl
                    p-6 w-full max-w-sm mx-4 shadow-xl">

            <h3 className="text-lg font-semibold text-slate-100 mb-3">
              Save Quiz
            </h3>

            <p className="text-slate-400 mb-6 max-w-xs leading-relaxed">
              Are you sure you want to save this quiz with{" "}
              <span className="text-cyan-400 font-medium">
                {draftQuestions.length} questions
              </span>?
            </p>

            <div className="flex gap-3">

              <button
                onClick={() => setShowSaveConfirm(false)}
                className="flex-1 py-2 rounded-lg border border-slate-600
                     text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </button>

              <button
                onClick={confirmSaveQuiz}
                className="flex-1 py-2 rounded-lg bg-cyan-400
                     text-slate-900 font-medium hover:bg-cyan-300"
              >
                Save
              </button>

            </div>

          </div>

        </div>

      )}

      {showDeleteConfirm && (

        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">

          <div className="bg-slate-800 border border-slate-700 rounded-xl
        p-6 w-full max-w-sm mx-4 shadow-xl">

            <h3 className="text-lg font-semibold text-slate-100 mb-3">
              Delete Question
            </h3>

            <p className="text-slate-400 mb-6">
              Are you sure you want to delete this question?
            </p>

            <div className="flex gap-3">

              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </button>

              <button
                onClick={confirmDeleteQuestion}
                className="flex-1 py-2 rounded-lg bg-rose-500 text-white hover:bg-rose-400"
              >
                Delete
              </button>

            </div>

          </div>

        </div>

      )}


      {/* BOTTOM ACTION BAR */}

      <div className="sticky bottom-0 bg-slate-900 border-t border-slate-800 p-4 flex flex-col gap-3 items-center">

        <button
          onClick={() =>
            navigate("/addquestion", {
              state: { quizName, draftQuestions, setId },
            })
          }
          className="w-72 py-3 border border-slate-600 rounded-xl hover:bg-slate-800 transition"
        >
          Add Question
        </button>

        <button
          onClick={handleSaveQuiz}
          className="w-72 py-3 bg-cyan-400 text-slate-900 font-semibold rounded-xl hover:bg-cyan-300 transition"
        >
          Save Quiz
        </button>

      </div>

    </div>
  );
}