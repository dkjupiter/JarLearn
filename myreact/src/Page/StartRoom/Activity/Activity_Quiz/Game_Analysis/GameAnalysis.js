import { useEffect, useState } from "react";
import { socket } from "../../../../../socket";
import QuestionAnalysisDetail from "./QuestionAnalysisDetail";

/* =========================
   Main Component
========================= */
function GameAnalysis({ activitySessionId, questions = [] }) {
  const [analysisMap, setAnalysisMap] = useState({});
  const [openQuestionId, setOpenQuestionId] = useState(null);

  useEffect(() => {
    if (!questions.length) return;

    // ยิงขอ analysis ทุกข้อ
    questions.forEach((q) => {
      socket.emit("get_question_analysis", {
        activitySessionId,
        questionId: q.Question_ID,
      });
    });

    const handler = (data) => {
      if (!data || data.length === 0) return;

      const qid = data[0].Question_ID; // server ต้องส่งมา
      setAnalysisMap((prev) => ({
        ...prev,
        [qid]: data,
      }));
    };

    socket.on("question_analysis_data", handler);
    return () => socket.off("question_analysis_data", handler);
  }, [activitySessionId, questions]);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        Game Analysis
      </h1>

      {questions.map((q, index) => {
  const analysis = analysisMap[q.Question_ID];

  return (
    <div
      key={q.Question_ID}
      className="mb-8 border rounded-xl p-5 bg-white"
    >
      {/* Question title */}
      <h2 className="font-semibold text-lg mb-3">
        ข้อ {index + 1}: {q.Question_Text}
      </h2>

      {/* Loading */}
      {!analysis && (
        <p className="text-gray-400 mb-4">
          Loading analysis...
        </p>
      )}

      {/* Analysis */}
      {analysis && (
        <QuestionAnalysisDetail analysis={analysis} />
      )}
    </div>
  );
})}

    </div>
  );
}

export default GameAnalysis;
