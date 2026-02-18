// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useLocation } from "react-router-dom";
// import { socket } from "../../../../../socket";
// import QuestionAnalysisDetail from "./QuestionAnalysisDetail";
// import ReportPage from "../Report_Quiz/Quiz_Report";

// function GameAnalysis({ 
//   activitySessionId, 
//   beforePage, 
//   onBack, 
//   classId, 
//   joinCode 
// }) {
//   const location = useLocation();
//   const navigate = useNavigate();

//     // const { classId, joinCode } = useParams();
//   // const { activitySessionId } = location.state || {};
//   // const activitySessionId = propSessionId ||
//   //   location?.state?.activitySessionId;
//   const [questions, setQuestions] = useState([]);
//   const [analysisMap, setAnalysisMap] = useState({});
//   const beforePageState = beforePage || "Play_Quiz";

//   console.log("GameAnalysis activitySessionId =", activitySessionId, " beforePage =", beforePage);

//   /* โหลดคำถาม */
//   useEffect(() => {
//     if (!activitySessionId) return;

//     socket.emit("get_questions_by_activity", { activitySessionId });

//     const handler = (data) => setQuestions(data || []);
//     socket.on("questions_by_activity_data", handler);

//     return () => socket.off("questions_by_activity_data", handler);
//   }, [activitySessionId]);

//   /* โหลด analysis ต่อข้อ */
//   useEffect(() => {
//     if (!activitySessionId || questions.length === 0) return;

//     questions.forEach((q) => {
//       socket.emit("get_question_analysis", {
//         activitySessionId,
//         questionId: q.Question_ID,
//       });
//     });

//     const handler = (data) => {
//       if (!data?.length) return;
//       const qid = data[0].Question_ID;
//       setAnalysisMap((prev) => ({ ...prev, [qid]: data }));
//     };

//     socket.on("question_analysis_data", handler);
//     return () => socket.off("question_analysis_data", handler);
//   }, [activitySessionId, questions]);

//   return (
//     <div className="flex flex-col min-h-screen bg-white">

//       {/* CONTENT */}
//       <div className="flex-1 overflow-y-auto px-4 pt-6 space-y-6">
//         <h1 className="text-2xl font-bold">Game Analysis</h1>

//         {questions.map((q, index) => (
//           <div key={q.Question_ID} className="border rounded-xl p-5 bg-white">
//             <h2 className="font-semibold">
//               ข้อ {index + 1}: {q.Question_Text}
//             </h2>

//             {analysisMap[q.Question_ID] && (
//               <QuestionAnalysisDetail
//                 analysis={analysisMap[q.Question_ID]}
//               />
//             )}
//           </div>
//         ))}
//         {beforePageState === "Play_Quiz" && (
//           <div className="sticky bottom-0 bg-white border-t p-4 z-50">

//             <button
//               // onClick={() => navigate("/quiz_report", {state: { activitySessionId, beforePage, classId, joinCode }})}
//               onClick={onBack}
//               className="w-full py-3 bg-gray-600 text-white rounded-xl"
//             >
//               Back
//             </button>

//           </div>)}
//       </div>
//     </div>

//   );
// }

// export default GameAnalysis;
// import { useEffect, useState, useRef } from "react";
// import { socket } from "../../../../../socket";
// import QuestionAnalysisDetail from "./QuestionAnalysisDetail";

// function GameAnalysis({
//   activitySessionId,
//   beforePage,
//   onBack,
// }) {

//   const [questions, setQuestions] = useState([]);
//   const [analysisMap, setAnalysisMap] = useState({});

//   // กันยิงซ้ำ
//   const requestedRef = useRef(new Set());

//   const beforePageState = beforePage || "Play_Quiz";

//   console.log("GameAnalysis session =", activitySessionId);

//   /* =========================
//      1️⃣ โหลดคำถามครั้งเดียว
//   ========================= */
//   useEffect(() => {
//     if (!activitySessionId) return;

//     socket.emit("get_questions_by_activity", { activitySessionId });

//     const handler = (data) => {
//       if (!Array.isArray(data)) return;
//       setQuestions(data);
//     };

//     socket.on("questions_by_activity_data", handler);
//     return () =>
//       socket.off("questions_by_activity_data", handler);

//   }, [activitySessionId]);

//   /* =========================
//      2️⃣ register listener ครั้งเดียว
//   ========================= */
//   useEffect(() => {
//     const handler = (data) => {
//       if (!Array.isArray(data) || !data.length) return;

//       const qid = data[0].Question_ID;

//       setAnalysisMap(prev => {
//         // ถ้ามีแล้ว ไม่ต้อง update
//         if (prev[qid]) return prev;
//         return { ...prev, [qid]: data };
//       });
//     };

//     socket.on("question_analysis_data", handler);

//     return () =>
//       socket.off("question_analysis_data", handler);

//   }, []); // 👈 ไม่มี dependency

//   /* =========================
//      3️⃣ ยิง emit ต่อ question แค่ครั้งเดียว
//   ========================= */
//   useEffect(() => {
//     if (!activitySessionId) return;
//     if (!questions.length) return;

//     questions.forEach(q => {
//       if (requestedRef.current.has(q.Question_ID)) return;

//       requestedRef.current.add(q.Question_ID);

//       socket.emit("get_question_analysis", {
//         activitySessionId,
//         questionId: q.Question_ID,
//       });
//     });

//   }, [questions, activitySessionId]);

//   return (
//     <div className="flex flex-col min-h-screen bg-white">

//       <div className="flex-1 overflow-y-auto px-4 pt-6 space-y-6">
//         <h1 className="text-2xl font-bold">Game Analysis</h1>

//         {questions.map((q, index) => (
//           <div
//             key={q.Question_ID}
//             className="border rounded-xl p-5 bg-white"
//           >
//             <h2 className="font-semibold">
//               ข้อ {index + 1}: {q.Question_Text}
//             </h2>

//             {analysisMap[q.Question_ID] && (
//               <QuestionAnalysisDetail
//                 analysis={analysisMap[q.Question_ID]}
//               />
//             )}
//           </div>
//         ))}

//         {beforePageState === "Play_Quiz" && (
//           <div className="sticky bottom-0 bg-white border-t p-4 z-50">
//             <button
//               onClick={onBack}
//               className="w-full py-3 bg-gray-600 text-white rounded-xl"
//             >
//               Back
//             </button>
//           </div>
//         )}
//       </div>

//     </div>
//   );
// }

// export default GameAnalysis;

import { useEffect, useState, useRef } from "react";
import { socket } from "../../../../../socket";
import QuestionAnalysisDetail from "./QuestionAnalysisDetail";

function GameAnalysis({
  activitySessionId,
  beforePage,
  onBack,
}) {
  const [questions, setQuestions] = useState([]);
  const [analysisMap, setAnalysisMap] = useState({});

  const BeforePageContent = beforePage;

  // กันยิงซ้ำ
  const requestedRef = useRef(new Set());
  console.log("GameAnalysis session =", BeforePageContent);
  // const beforePageState = BeforePageContent || "Play_Quiz";

  useEffect(() => {
    if (!activitySessionId) return;

    socket.emit("get_questions_by_activity", { activitySessionId });

    const handler = (data) => {
      if (!Array.isArray(data)) return;
      setQuestions(data);
    };

    socket.on("questions_by_activity_data", handler);

    return () =>
      socket.off("questions_by_activity_data", handler);

  }, [activitySessionId]);

  useEffect(() => {

    const handler = (data) => {
      if (!Array.isArray(data) || !data.length) return;

      const qid = data[0].Question_ID;

      setAnalysisMap(prev => {
        if (prev[qid]) return prev; // กัน update ซ้ำ
        return { ...prev, [qid]: data };
      });
    };

    socket.on("question_analysis_data", handler);

    return () =>
      socket.off("question_analysis_data", handler);

  }, []);

  useEffect(() => {
    if (!activitySessionId) return;
    if (!questions.length) return;

    questions.forEach(q => {

      if (requestedRef.current.has(q.Question_ID)) return;

      requestedRef.current.add(q.Question_ID);

      socket.emit("get_question_analysis", {
        activitySessionId,
        questionId: q.Question_ID,
      });

    });

  }, [questions, activitySessionId]);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="flex-1 overflow-y-auto px-4 pt-6 space-y-6">

        <h1 className="text-2xl font-bold">Game Analysis</h1>

        {questions.map((q, index) => (
          <div
            key={q.Question_ID}
            className="border rounded-xl p-5 bg-white"
          >
            <h2 className="font-semibold">
              ข้อ {index + 1}: {q.Question_Text}
            </h2>

            {analysisMap[q.Question_ID] && (
              <QuestionAnalysisDetail
                analysis={analysisMap[q.Question_ID]}
              />
            )}
          </div>
        ))}

        {BeforePageContent === "Play_Quiz" && (
          <div className="sticky bottom-0 bg-white border-t p-4 z-50">
            <button
              onClick={onBack}
              className="w-full py-3 bg-gray-600 text-white rounded-xl"
            >
              Back
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

export default GameAnalysis;
