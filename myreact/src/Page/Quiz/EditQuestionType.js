// import { useLocation, useNavigate, useParams } from "react-router-dom";
// import { useState } from "react";

// export default function EditQuestionType() {
//   const navigate = useNavigate();
//   const { id: setId } = useParams();

//   // รับ state จากหน้า AddQuestion (text เดิมถ้ามี)
//   const location = useLocation();
//   // const location = useLocation();

//   const {
//     id,
//     index,
//     draftQuestions,
//     quizName,
//     question,
//   } = location.state || {};

//   const initialText = location.state?.text || "";
//   const options = location.state?.options || [];
//   const correct = location.state?.correct || [];
//   const type = location.state?.type || "single";
//   const image = location.state?.image || null;
//   console.log("🚀 image in EditQuestionType =", image);
//   const [text, setText] = useState(question?.text || "");


//   const handleFinish = () => {
//     const updatedQuestion = {
//       ...question,
//       text,
//     };

//     const updatedQuestions = [...draftQuestions];
//     updatedQuestions[index] = updatedQuestion;

//     navigate(`/editquestion/${index}`, {
//       state: {
//         id,
//         index,
//         question: updatedQuestion,
//         draftQuestions: updatedQuestions,
//         quizName,
//       },
//     });
//   };

//   const handleCancel = () => {
//     navigate(-1);
//   };

//   return (
//     <div className="min-h-screen p-6 flex flex-col">

//       {/* Back button */}
//       <button onClick={() => navigate(-1)} className="text-lg mb-4">
//         ← Back
//       </button>

//       <h1 className="text-3xl font-bold mb-6">Type your question</h1>

//       {/* TEXT INPUT BOX */}
//       <textarea
//         className="w-full h-60 p-4 bg-gray-200 rounded-xl border outline-none"
//         placeholder="Question............"
//         value={text}
//         onChange={(e) => setText(e.target.value)}
//       />

//       {/* Finish */}
//       <button
//         onClick={handleFinish}
//         className="mt-10 w-full py-4 bg-gray-600 text-white rounded-xl text-xl"
//       >
//         Save
//       </button>

//       {/* Cancel */}
//       <button
//         onClick={handleCancel}
//         className="mt-4 w-full py-4 border border-gray-500 rounded-xl text-xl"
//       >
//         Cancel
//       </button>
//     </div>
//   );
// }
