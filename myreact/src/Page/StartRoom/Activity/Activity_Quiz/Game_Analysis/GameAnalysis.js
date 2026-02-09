import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { socket } from "../../../../../socket";

function GameAnalysis() {
  const { activitySessionId } = useParams();
  const [analysis, setAnalysis] = useState([]);
  const [questionId, setQuestionId] = useState(null);

  // 🔹 เลือก question (อาจมาจาก dropdown)
  useEffect(() => {
    if (!questionId) return;

    socket.emit("get_question_analysis", {
      activitySessionId,
      questionId,
    });

    const handler = (data) => {
      setAnalysis(data);
    };

    socket.on("question_analysis_data", handler);
    return () => socket.off("question_analysis_data", handler);
  }, [activitySessionId, questionId]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Game Analysis</h1>

      {analysis.map((row) => (
        <div key={row.Choice_ID} className="mb-2">
          <p>
            Choice {row.Choice_ID} — {row.count} คน  
            (avg time {Number(row.avg_time).toFixed(1)}s)
          </p>
        </div>
      ))}
    </div>
  );
}

export default GameAnalysis;