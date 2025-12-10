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


export default function QuizSetDetail() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { setId } = useParams(); // Quiz Set ID
  const quizSet = state?.quizSet;

  const [questions, setQuestions] = useState([]);
  // const [quizName, setQuizName] = useState(quizSet?.title || "Quiz Name");
  const [editMode, setEditMode] = useState(false);

  // const [draftQuestions, setDraftQuestions] = useState([]);
  // const [draftQuestions, setDraftQuestions] = useState([]);
  const [quizName, setQuizName] = useState("Quiz Name");
  const [draftQuestions, setDraftQuestions] = useState([]);
  const { teacherId } = useTeacher();
  localStorage.setItem("quizName", quizName);
  localStorage.setItem("draftQuestions", JSON.stringify(draftQuestions));

  const Loca = useLocation();

  // useEffect(() => {
  //     if (!Loca.state) return;

  //     // โหลดชื่อควิซกลับมา
  //     if (Loca.state.quizName) {
  //       setQuizName(Loca.state.quizName);
  //     }

  //     // โหลดคำถามใหม่ + เก่า
  //     if (Loca.state.draftQuestions) {
  //       setDraftQuestions(Loca.state.draftQuestions);
  //     }
  // }, [Loca.state]);
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



  // useEffect(() => {
  // if (!setId) {
  //   console.error("No setId, cannot fetch questions");
  //   return;
  // }

  // console.log("Fetching questions for setId:", setId);
  // socket.emit("get_questions_in_set", setId);

  // const handleQuestions = (data) => {
  //   console.log("Received questions:", data);
  //   if (data.error) alert("Error: " + data.error);
  //   else {
  //     setQuestions(
  //       data.map((q) => ({
  //         id: q.Question_ID,
  //         text: q.Question_Text,
  //         type: q.Question_Type,
  //       }))
  //     );
  //   }
  // };

//   socket.oั);

//   useEffect(() => {
//   socket.on("submit_create_set_result", (res) => {
//     console.log("✅ FRONT RECEIVED:", res);

//     if (res.success) {
//       navigate("/managequiz");
//     } else {
//       alert(res.message);
//     }
//   });

//   return () => socket.off("submit_create_set_result");
// }, []);


  // submit create question set
//   const title = quizName;
//   const questionset = draftQuestions;
//   const handleFinalCreate = () => {
//     console.log("Received question_sets_data:",draftQuestions );
//   socket.emit("submit_create_question", {
//     teacherId,
//     title,
//     questionset
//   });
//   console.log("Received question_sets_data:",teacherId, title, questionset);
// };

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
    // question_last_edit: now,  
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

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Sidebar_account />

      <main className="flex flex-col flex-1 p-6 mt-14">

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
              // key={q.id ?? `draft-${index}`}
              // key={q.tempId ?? index}
              // onClick={() => {
              //   console.log("GO EDIT", q.id);
              //   navigate(`/editquestion/${q.id}`, {
              //     state: { question: q,  },
              //   });
              // }}
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
            onClick={handleFinalCreate}
            className="fixed bottom-10 w-72 py-3 bg-gray-600 text-white rounded-xl  self-center"
          >
            Create Quiz
        </button>

      </main>
    </div>
  );
}
