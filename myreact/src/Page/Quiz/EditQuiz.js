import { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import Sidebar_account from "../Sidebar_account";
import io from "socket.io-client";
import { useTeacher } from "../TeacherContext";
import QuestionPreview from "../components/QuestionPreview";

const socket = io("http://localhost:4000");

socket.on("connect", () => {
  console.log("✅ SOCKET CONNECTED:", socket.id);
});

socket.on("connect_error", (err) => {
  console.log("❌ SOCKET CONNECT ERROR:", err.message);
});

socket.onAny((event, ...args) => {
  console.log("📡 FRONT EVENT:", event, args);
});

export default function EditQuiz() {
  const navigate = useNavigate();
  // const { state } = useLocation();
  const { setId: paramSetId } = useParams();
  const { state } = useLocation();

  const setId = state?.setId || paramSetId;


  console.log("setId =", setId);

  const [quizName, setQuizName] = useState("");
  const [draftQuestions, setDraftQuestions] = useState([]);
  const [editMode, setEditMode] = useState(false);

  const now = new Date().toISOString();

  /* =====================================================
     SAVE QUIZ (CREATE / UPDATE)
  ===================================================== */
  const handleSaveQuiz = () => {
    if (setId) {
      const confirmEdit = window.confirm("คุณต้องการบันทึกการแก้ไขควิซหรือไม่?");
      if (!confirmEdit) return;

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
  };

  /* =====================================================
     SOURCE OF TRUTH EFFECT
     - ถ้ามาจาก EditQuestion → ใช้ draft
     - ถ้าเข้า page ครั้งแรก → fetch DB
  ===================================================== */
  useEffect(() => {
    //  กลับมาจาก EditQuestion
    if (state?.draftQuestions) {
      console.log("USE DRAFT FROM EditQuestion");
      setDraftQuestions(state.draftQuestions);
      if (state.quizName) setQuizName(state.quizName);
      return; // ห้าม fetch DB
    }

    // เข้า EditQuiz ครั้งแรก
    if (!setId) return;

    console.log("FETCH QUIZ FROM DB:", setId);

    const handleData = (data) => {
      console.log("quiz_full_data:", data);

      if (data.error) {
        alert(data.error);
        return;
      }

      setQuizName(data.title || "");

      setDraftQuestions(
        data.questions.map((q) => {
          const options = q.options?.map((o) => o.text) || [];

          // แปลง option_id → index
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
     UPDATE RESULT (AFTER CLICK EDIT QUIZ)
  ===================================================== */
  useEffect(() => {
    const handleUpdateResult = (res) => {
      console.log("update_quiz_result:", res);

      if (res.success) {
        // socket.emit("get_quiz_full_data", setId);
        // alert("บันทึกการแก้ไขเรียบร้อยแล้ว 🎉");
        navigate("/managequiz");
      } else {
        alert("Save failed: " + res.message);
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

  const deleteQuestion = (index) => {
    const ok = window.confirm("ต้องการลบคำถามนี้หรือไม่?");
    if (!ok) return;

    setDraftQuestions((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  /* =====================================================
     RENDER
  ===================================================== */
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Sidebar_account />

           <main className="
             /* 👈 เผื่อ sidebar */
  pt-[56px]            /* 👈 เผื่อ header */
  h-[calc(100vh-56px)]
  flex flex-col
">
  <div className="p-6">
    {/* <h1 className="text-2xl font-bold py-2">Edit Quiz</h1> */}
        {/* <button
          onClick={() => navigate("/managequiz")}
          className="mb-4 px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-100 w-fit"
        >
          ← Back
        </button> */}
        <h1 className="text-2xl font-bold py-2">Edit Quiz</h1>
        {/* ---------------- Quiz Name ---------------- */}
        <div className="border-2 p-3 rounded-xl flex items-center justify-between ">
          <input
            className="w-full text-xl font-bold outline-none"
            value={quizName}
            onChange={(e) => setQuizName(e.target.value)}
            onBlur={saveQuizName}
          />
          <button className="ml-3 text-gray-600">✎</button>
        </div>
</div>
        {/* ---------------- Question List ---------------- */}
          <div className="flex-1 overflow-y-auto px-6">
  <div className="flex flex-col gap-3 pb-6">
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

        {/* ---------------- Buttons ---------------- */}
        <div className="border-t bg-white p-4 flex flex-col items-center gap-3">
          <button className="w-72 py-3 bg-gray-600 text-white rounded-lg"
            onClick={() =>
              navigate("/addquestion", {
                state: { quizName, draftQuestions, setId, },
              })
            }
          >
            Add Question
          </button>

          <button
            onClick={handleSaveQuiz}
            className="w-72 py-3 border rounded-lg">
            Edit Quiz
          </button>

          <button
          onClick={() => navigate("/managequiz")}
          className="w-72 py-3 border rounded-lg">
          Back
        </button>
        </div>
      </main>
    </div>
  );
}
