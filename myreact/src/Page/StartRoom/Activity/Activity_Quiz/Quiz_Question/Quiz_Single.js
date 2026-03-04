import { useState, useEffect } from "react";
import { Maximize2 } from "lucide-react";

function Activity_quiz_single({ question, current, total, timeLimit, onNext, onTimeUp, answeredCount, totalStudents }) {
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [showImage, setShowImage] = useState(false);
  const [timer, setTimer] = useState(timeLimit ?? 30);

  useEffect(() => {
    const t = Number(timeLimit);
    if (!Number.isFinite(t) || t <= 0) return;
    setTimer(t);
  }, [question?.Question_ID, timeLimit]);

  console.log("timeLimit:", timeLimit, typeof timeLimit);
  console.log("timer:", timer);

  // นับถอยหลัง
  useEffect(() => {
    if (timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((t) => t - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  // หมดเวลา
  useEffect(() => {
    if (timer === 0) {
      onTimeUp?.();
    }
  }, [timer]);


  return (
    <div className="w-full min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center py-6">

      <p className="mb-4 text-slate-400 font-medium">
        Question {current}/{total}
      </p>

      <div className="w-11/12 max-w-3xl bg-slate-800 border border-slate-700 p-6 rounded-2xl text-center text-xl font-semibold mb-4">
        {question.Question_Text}
      </div>

      <p className="text-slate-400 mb-3">Choose 1 choice</p>

      {/* Picture Modal */}
      {question.Question_Image && (
              <div className="w-[280px] h-[280px] bg-slate-800 border border-slate-700 rounded-xl mb-4 relative">
                <img src={question.Question_Image} className="w-full h-full object-contain" />
                <button
                  onClick={() => setShowImage(true)}
                  className="absolute bottom-2 right-2 bg-slate-900 text-slate-100 px-3 py-1 rounded-lg"
                >
                  <Maximize2 className="w-5 h-5" />
                </button>
              </div>
            )}

      {/* Choices */}
      <div className="w-11/12 max-w-3xl space-y-3">
        {question.choices.map((c, idx) => (
          <button
            key={c.id}
            onClick={() => setSelectedChoice(idx)}
            className={`w-full py-4 rounded-xl border transition
          ${selectedChoice === idx
                ? "bg-cyan-400 text-slate-900 border-cyan-300"
                : "bg-slate-800 border-slate-700 hover:bg-slate-700"
              }`}
          >
            {c.text}
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-8 w-11/12 max-w-3xl flex items-center justify-between gap-4">

  {/* Left group */}
  <div className="flex items-center gap-3">

    {/* Timer */}
    {timer !== null && (
      <div
        className={`px-4 py-2 rounded-full font-semibold
          ${timer <= 5
            ? "bg-red-500 text-white"
            : "bg-slate-700 text-slate-100"
          }`}
      >
        ⏱ {timer}s
      </div>
    )}

    {/* Answer progress */}
    {typeof totalStudents === "number" && totalStudents > 0 ? (
      <div className="px-4 py-2 rounded-full bg-slate-800 border border-slate-700 text-slate-200">
        👥 {answeredCount}/{totalStudents} answered
      </div>
    ) : (
      <div className="px-4 py-2 rounded-full bg-slate-800 border border-slate-700 text-slate-400">
        No students yet
      </div>
    )}
  </div>

  {/* Next */}
  <button
    onClick={onNext}
    className="px-6 py-3 rounded-lg
               bg-cyan-400 text-slate-900 font-semibold
               hover:bg-cyan-300 hover:scale-[1.02]
               shadow-lg shadow-cyan-400/30 transition"
  >
    Next ▶
  </button>

</div>
    </div>
  );
}

export default Activity_quiz_single;
