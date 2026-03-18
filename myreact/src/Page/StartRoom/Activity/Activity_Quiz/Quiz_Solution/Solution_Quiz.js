import { Maximize2 } from "lucide-react";
import { useState, useEffect } from "react";
import { socket } from "../../../../../socket";

function Solution_quiz_select_choice({
  question,
  current,
  total,
  activitySessionId,
  onNext,
}) {
  const [showImage, setShowImage] = useState(false);
  const [stats, setStats] = useState([]);

  // mock count (ตอนนี้ server ยังไม่ได้ส่ง)
  const choicesWithCount = question.choices.map((c) => {

  const stat = stats.find(
    s => Number(s.Option_ID) === Number(c.id)
  );

  const count = stat?.selected_count ?? 0;

  return {
    ...c,
    selectedCount: count
  };

});

  const maxCount = Math.max(
    ...choicesWithCount.map((c) => c.selectedCount),
    1
  );

  useEffect(() => {

    if (!question?.Question_ID) return;

    socket.emit("get_question_analysis", {
      activitySessionId,
      questionId: question.Question_ID
    });

    const handler = (data) => {
      setStats(data || []);
    };

    socket.on("question_analysis_data", handler);

    return () => socket.off("question_analysis_data", handler);

  }, [question?.Question_ID, activitySessionId]);

  const isLastQuestion = current === total;

  return (
    <div className="w-full min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center px-4 py-6">

      {/* Progress */}
      <p className="mb-4 text-slate-400 font-medium">
        Solution {current}/{total}
      </p>

      {/* Question */}
      <div className="w-full max-w-3xl bg-slate-800 border border-slate-700 p-6 rounded-2xl text-center text-xl font-semibold mb-6">
        {question.Question_Text}
      </div>

      {/* Image */}
      {question.Question_Image && (
        <div className="w-full max-w-sm aspect-square bg-slate-800 border border-slate-700 rounded-xl mb-6 relative">
          <img
            src={question.Question_Image}
            className="w-full h-full object-contain"
          />

          <button
            onClick={() => setShowImage(true)}
            className="absolute bottom-2 right-2 bg-slate-900 border border-slate-700 text-slate-100 px-3 py-1 rounded-lg hover:bg-slate-700 transition"
          >
            <Maximize2 className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Fullscreen Image */}
      {showImage && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center"
          onClick={() => setShowImage(false)}
        >
          <img
            src={question.Question_Image}
            className="max-w-[90%] max-h-[90%] object-contain rounded-lg"
          />
        </div>
      )}

      {/* Answer Distribution */}
      <div className="w-full max-w-3xl space-y-4">

        {choicesWithCount.map((c) => {
          const width = (c.selectedCount / maxCount) * 100;

          const barColor = c.isCorrect
            ? "bg-emerald-500"
            : "bg-red-500";

          return (
            <div key={c.id} className="space-y-1">

              <div className="relative w-full h-12 bg-slate-700 rounded-xl overflow-hidden">

                {/* Bar */}
                <div
                  className={`${barColor} h-full transition-all duration-700`}
                  style={{ width: `${width}%` }}
                />

                {/* Label */}
                <div className="absolute inset-0 flex items-center justify-between px-4 text-sm font-medium">

                  <span className="truncate">
                    {c.text}
                  </span>

                  <span className="text-slate-200">
                    {c.selectedCount} students
                  </span>

                </div>

              </div>

            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-12">
        <button
          onClick={onNext}
          className="w-72 py-3 rounded-lg
                     bg-cyan-400 text-slate-900 font-semibold
                     hover:bg-cyan-300 hover:scale-[1.02]
                     shadow-lg shadow-cyan-400/30 transition"
        >
          {isLastQuestion ? "End Quiz" : "Ranking"}
        </button>
      </div>
    </div>
  );
}

export default Solution_quiz_select_choice;