import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar_account from "../Sidebar_account";
import { useTeacher } from "../TeacherContext";
import io from "socket.io-client";

const socket = io("http://localhost:4000");

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
          date : q.Question_Last_Edit
        }))
      );
    }
  });

  return () => socket.off("question_sets_data");
}, [teacherId]);

  const formatThaiDate = (dateString) => {
  if (!dateString) return "-";

  const date = new Date(dateString);

  return date.toLocaleString("th-TH", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "short",
    day: "numeric",
    // hour: "2-digit",
    // minute: "2-digit"
  });
};

  // สร้าง Quiz
  // const createQuizTitle = "Quiz u";

//   const createQuiz = () => {
//   socket.emit("request_create_set", { 
//     // title: createQuizTitle,
//     teacherId
//   });
//   console.log("LISTENER FIRED_4", teacherId);

//   socket.once("create_set_result", () => {
//     console.log("RECEIVED create_set_result:", );

//     if (res.success) {
//       navigate(`/quizediter`, {
//         // state: { quizSet: { id: res.setId, title: "New Quiz"} }
//       });
//       console.log("LISTENER FIRED_4",);

//     }
//   });
// };


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
    <div className="min-h-screen bg-white flex flex-col">
      <Sidebar_account />

      <main className="
             /* 👈 เผื่อ sidebar */
  pt-[56px]            /* 👈 เผื่อ header */
  h-[calc(100vh-56px)]
  flex flex-col
">
    <div className="p-6">
        <h1 className="text-2xl font-bold py-2">Quiz</h1>
        
</div>
                  <div className="flex-1 overflow-y-auto px-6">
  <div className="flex flex-col gap-3 pb-6">
          {quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="flex items-center justify-between bg-gray-300 p-4 rounded-lg cursor-pointer"
              onClick={() => navigate(`/editquiz/${quiz.id}`)}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-400 rounded-full"></div>

                <div className="flex flex-col">
                  <span className="text-base">{quiz.name}</span>
                  <span className="text-sm text-gray-600">
                    Last Edit: {formatThaiDate(quiz.date)}
                  </span>
                </div>
              </div>
              <span className="text-gray-600 text-xl">{">"}</span>
            </div>
          ))}
        </div>
        </div>

<div className="border-t bg-white p-4 flex flex-col items-center gap-3">
          <button className="w-72 py-3 bg-gray-600 text-white rounded-lg"
          onClick={() => navigate("/quizediter")}
          
        >
          Create Quiz
        </button>

        <button
          onClick={deleteQuiz}
          className="w-72 py-3 border rounded-lg"
        >
          Delete Quiz
        </button>
        </div>
      </main>
    </div>
  );
}
