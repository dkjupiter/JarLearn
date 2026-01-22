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


export default function CreateQuiz() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { setId } = useParams(); // Quiz Set ID
  const quizSet = state?.quizSet;

  const [questions, setQuestions] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [quizName, setQuizName] = useState("Quiz Name");
  const [draftQuestions, setDraftQuestions] = useState([]);
  const { teacherId } = useTeacher();
  const Loca = useLocation();

  useEffect(() => {
    localStorage.setItem("quizName", quizName);
  }, [quizName]);

  useEffect(() => {
    localStorage.setItem("draftQuestions", JSON.stringify(draftQuestions));
  }, [draftQuestions]);

  useEffect(() => {
    if (!Loca.state) return;

    if (Loca.state.quizName !== undefined) {
      setQuizName(Loca.state.quizName);
      localStorage.setItem("quizName", Loca.state.quizName);
    }

    if (Loca.state.draftQuestions !== undefined) {
      setDraftQuestions(Loca.state.draftQuestions);
      localStorage.setItem("draftQuestions", JSON.stringify(Loca.state.draftQuestions));
    }
  }, [Loca.state]);

  const now = new Date().toISOString();
  const handleFinalCreate = () => {
  console.log("📤 CLICK CREATE QUIZ");
  console.log("teacherId:", teacherId);
  console.log("title:", quizName);
  console.log("questionset:", draftQuestions);

  if (!teacherId) {
    alert("❌ teacherId หาย กรุณา login ใหม่");
    return;
  }

  if (!quizName || quizName.trim() === "") {
    alert("❌ กรุณาใส่ชื่อ Quiz");
    return;
  }

  if (!draftQuestions || draftQuestions.length === 0) {
    alert("❌ ยังไม่มีคำถามในชุด");
    return;
  }

  socket.emit("submit_create_question", {
    teacherId,
    title: quizName,
    question_last_edit: now,  
    questionset: draftQuestions,
  });

  console.log("✅ EMIT submit_create_question SUCCESS");

  socket.on("submit_create_set_result", (res) => {
    console.log("✅ FRONT RECEIVED:", res);

    if (res.success) {
      navigate("/managequiz");
    } else {
      alert(res.message);
    }
  });
};


  // ฟังก์ชันบันทึกชื่อ Quiz
  const saveQuizName = () => {
    setEditMode(false);

    socket.emit("update_quiz_name", {
      // setId: setId,
      newName: quizName,
    });
  };

  const deleteQuestion = (index) => {
  const updated = draftQuestions.filter((_, i) => i !== index);
    setDraftQuestions(updated);
    localStorage.setItem("draftQuestions", JSON.stringify(updated));
  };


  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Sidebar_account />

      <main className="flex flex-col flex-1 p-6 mt-14">

        <button
          onClick={() => {
            if (draftQuestions.length > 0) {
              const ok = window.confirm("ข้อมูลยังไม่ถูกบันทึก ต้องการย้อนกลับหรือไม่?");
              if (!ok) return;
            }
            navigate("/managequiz")}  }
          className="mb-4 px-4 py-2  rounded-lg text-gray-700 hover:bg-gray-0 w-fit"
        >
          ← Back
        </button>

        {/* ----------------------- Quiz Name Box ---------------------- */}
        <div className="border-2 p-3 rounded-xl flex items-center justify-between mb-6">
          <input
              className="w-full text-xl font-bold outline-none"
              value={quizName}
              onChange={(e) => setQuizName(e.target.value)}
              onBlur={saveQuizName}
              // autoFocus
            />

            <button
            className="ml-3 text-gray-600">
            ✎
          </button>
        </div>

        {/* ----------------------- Question List ---------------------- */}
        <div className="flex flex-col gap-4 mb-20">
          {draftQuestions.map((q, index) => (
            <QuestionPreview
              key={index}
              q={q}
              index={index}
              onClick={() =>
                navigate(`/editquestion/${index}`, {
                  state: { question: q, index, quizName, draftQuestions },
                })
              }
              onDelete={deleteQuestion}
            />
          ))}
        </div>

        {/* ----------------------- Buttons ---------------------------- */}
        <button
          onClick={() =>
            navigate("/addquestion", 
              { state: { 
                quizName,
                draftQuestions,
                newQuestionNumber: draftQuestions.length + 1,
              } })
          }
          className="fixed bottom-24 w-72 py-3 border border-gray-400 text-gray-700 rounded-xl hover:bg-gray-100  self-center"
        >
          Add Question
        </button>

        <button
            onClick={handleFinalCreate}
            className="fixed bottom-10 w-72 py-3 bg-gray-600 text-white rounded-xl  self-center"
          >
            Create Quiz
        </button>

      </main>
    </div>
  );
}
