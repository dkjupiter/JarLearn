import { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import Sidebar_account from "../Sidebar_account";
import io from "socket.io-client";
import { useTeacher } from "../TeacherContext";

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
  const { state } = useLocation();
  const { setId } = useParams(); // Quiz Set ID
  console.log("setId =", setId);
  const quizSet = state?.quizSet;

  const [questions, setQuestions] = useState([]);
  // const [quizName, setQuizName] = useState(quizSet?.title || "Quiz Name");
  const [editMode, setEditMode] = useState(false);

  // const [draftQuestions, setDraftQuestions] = useState([]);
  // const [draftQuestions, setDraftQuestions] = useState([]);
  const [quizName, setQuizName] = useState("");
  const [draftQuestions, setDraftQuestions] = useState([]);
  const { teacherId } = useTeacher();

  const now = new Date().toISOString();
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

//ดึงชื่อ
    useEffect(() => {
  if (!setId) return;

  console.log("📤 REQUEST QUIZ FULL DATA:", setId);

  const handleData = (data) => {
    console.log("✅ quiz_full_data:", data);

    if (data.error) {
      alert(data.error);
      return;
    }

    setQuizName(data.title || "");

    setDraftQuestions(
      data.questions.map((q) => {
        const options = q.options?.map((o) => o.text) || [];

        // 🔥 แปลง Option_ID → index
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
          correct,                 // ✅ ไม่ใช่ []
          image: q.Question_Image || null,
        };
      })
    );
  };

  socket.emit("get_quiz_full_data", setId);
  socket.on("quiz_full_data", handleData);

  return () => socket.off("quiz_full_data", handleData);
}, [setId]);

  // ฟังก์ชันบันทึกชื่อ Quiz
  const saveQuizName = () => {
    setEditMode(false);

    socket.emit("update_quiz_name", {
    //   setId: setId,
      newName: quizName,
    });
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Sidebar_account />

      <main className="flex flex-col flex-1 p-6 mt-14">

        <button
          onClick={() => navigate("/managequiz")}
          className="mb-4 px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-100 w-fit"
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
            <div
              key={q.id ?? `draft-${index}`}
            //   key={q.tempId ?? index}
              onClick={() => {
                console.log("GO EDIT", q.id);
                navigate(`/editquestion/${index}`, {
                  state: { id: setId,
                            question: q,
                            index,              // ⭐ สำคัญมาก
                            draftQuestions,
                            quizName, },
                });
              }}
              className="flex justify-between items-center p-4 bg-gray-200 rounded-xl cursor-pointer hover:bg-gray-300 transition"
            >
              <span className="text-lg">
                {index + 1}. {q.text}
              </span>
              <span className="text-xl">{">"}</span>
            </div>
          ))}
        </div>

        {/* ----------------------- Buttons ---------------------------- */}
        <button
          onClick={() =>
            navigate("/addquestion", 
              { state: { 
                quizName,
                draftQuestions 
              } })
          }
          className="fixed bottom-24 w-72 py-3 border border-gray-400 text-gray-700 rounded-xl hover:bg-gray-100  self-center"
        >
          Add Question
        </button>

        <button
            onClick={handleSaveQuiz}
            className="fixed bottom-10 w-72 py-3 bg-gray-600 text-white rounded-xl  self-center"
          >
            Edit Quiz
        </button>

      </main>
    </div>
  );
}
