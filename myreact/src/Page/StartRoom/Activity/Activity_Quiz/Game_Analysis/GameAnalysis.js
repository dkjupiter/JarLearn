import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { socket } from "../../../../../socket";
import QuestionAnalysisDetail from "./QuestionAnalysisDetail";

function GameAnalysis({ activitySessionId: propSessionId, onBack, beforePage }) {
  const location = useLocation();
  const navigate = useNavigate();
  // const { activitySessionId } = location.state || {};
  const activitySessionId = propSessionId ||
    location?.state?.activitySessionId;
  const [questions, setQuestions] = useState([]);
  const [analysisMap, setAnalysisMap] = useState({});

  const before_Page = beforePage || "Play_Quiz";

  console.log("GameAnalysis activitySessionId =", activitySessionId);

  /* โหลดคำถาม */
  useEffect(() => {
    if (!activitySessionId) return;

    socket.emit("get_questions_by_activity", { activitySessionId });

    const handler = (data) => setQuestions(data || []);
    socket.on("questions_by_activity_data", handler);

    return () => socket.off("questions_by_activity_data", handler);
  }, [activitySessionId]);

  /* โหลด analysis ต่อข้อ */
  useEffect(() => {
    if (!activitySessionId || questions.length === 0) return;

    questions.forEach((q) => {
      socket.emit("get_question_analysis", {
        activitySessionId,
        questionId: q.Question_ID,
      });
    });

    const handler = (data) => {
      if (!data?.length) return;
      const qid = data[0].Question_ID;
      setAnalysisMap((prev) => ({ ...prev, [qid]: data }));
    };

    socket.on("question_analysis_data", handler);
    return () => socket.off("question_analysis_data", handler);
  }, [activitySessionId, questions]);

  return (
    <div className="flex flex-col min-h-screen bg-white">

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto px-4 pt-6 space-y-6">
        <h1 className="text-2xl font-bold">Game Analysis</h1>

        {questions.map((q, index) => (
          <div key={q.Question_ID} className="border rounded-xl p-5 bg-white">
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
        {beforePage === "Play_Quiz" && (
          <div className="sticky bottom-0 bg-white border-t p-4 z-50">

            <button
              onClick={() => navigate(-1)}
              className="w-full py-3 bg-gray-600 text-white rounded-xl"
            >
              Back
            </button>

          </div>)}
      </div>
    </div>

  );
}

export default GameAnalysis;
