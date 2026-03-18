import { useEffect, useState } from "react";
import Navbar from "../Navbar";
import { Crown } from "lucide-react";
import { socket } from "../../socket";


function AnswerResultPage({
  isTeacherPaced = false,
  isCorrect,
  pointForThis,
  currentPoint,
  timeSpent,       // 👈 เวลา (วินาที)
  username = "You", // (optional) ชื่อ
  showNext = false,
  onNext,
  isLastQuestion = false,
  // ✅ เพิ่มสองบรรทัดนี้
  isQuizTimer = false,
  quizRemainingTime = null,

}) {
  const [displayPoint, setDisplayPoint] = useState(currentPoint);

  console.log("AnswerResultPage props:", {
    isQuizTimer,
    quizRemainingTime,
  });

  /* 🎯 animate คะแนน */
  useEffect(() => {
    if (!isCorrect) {
      setDisplayPoint(currentPoint);
      return;
    }
    let start = displayPoint;
    const end = currentPoint;

    if (start === end) return;

    const duration = 500;
    const increment = Math.ceil(Math.abs(end - start) / (duration / 16));

    const counter = setInterval(() => {
      if (start < end) {
        start += increment;
        if (start >= end) {
          start = end;
          clearInterval(counter);
        }
      }
      setDisplayPoint(start);
    }, 16);

    return () => clearInterval(counter);
  }, [currentPoint]);

  const formatTime = (seconds) => {
    if (!Number.isFinite(seconds)) return "";

    const m = Math.floor(seconds / 60);
    const s = seconds % 60;

    return `${m}:${s.toString().padStart(2, "0")}`;
  };




  return (
    <div className="w-full min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center pt-[80px] pb-16">
      <Navbar />

      {/* Timer */}
      {isQuizTimer && Number.isFinite(quizRemainingTime) && (
        <div
          className={`
            px-5 py-2 rounded-full text-lg font-bold mt-2
            ${
              quizRemainingTime < 5
                ? "bg-rose-500 text-white animate-pulse"
                : quizRemainingTime <= 15
                ? "bg-amber-400 text-slate-900"
                : "bg-slate-800 border border-slate-700 text-slate-100"
            }
          `}
        >
          ⏱ {formatTime(quizRemainingTime)}
        </div>
      )}

      {/* Title */}
      <h1 className="text-3xl font-bold mt-6">Answer</h1>

      {/* Result Circle */}
      <div
        className={`
          w-[220px] h-[220px] rounded-full mt-6 flex items-center justify-center relative
          transition-all duration-300
          ${
            isCorrect
              ? "bg-emerald-400 shadow-[0_0_40px_12px_rgba(16,185,129,0.7)] animate-shake"
              : "bg-rose-500 shadow-[0_0_40px_12px_rgba(244,63,94,0.7)] animate-shake"
          }
        `}
      >
        <p className="text-6xl font-bold text-slate-900">
          {isCorrect ? "✔" : "✖"}
        </p>
      </div>

      {/* Point */}
      <h2 className="text-2xl font-semibold mt-10 text-slate-200">Point</h2>

      <p className="text-lg mt-2">
        {isCorrect ? (
          <>
            correct answer : <span className="font-bold">{pointForThis}</span>
          </>
        ) : (
          <>
            wrong answer : <span className="font-bold">{pointForThis}</span>
          </>
        )}
      </p>

      {/* Time spent */}
      <h2 className="text-2xl font-semibold mt-8 text-slate-200">Time</h2>

      <p className="text-lg mt-1">
        used time : <span className="font-bold">{timeSpent}s</span>
      </p>

      {/* Current point */}
      <h2 className="text-2xl font-semibold mt-10 text-slate-200">
        Current Point
      </h2>

      <p className="text-4xl mt-2 font-bold text-cyan-400 transition-all duration-500">
        {displayPoint}
      </p>

      {/* Action */}
      {showNext ? (
        <button
          onClick={onNext}
          className="
            mt-10 bg-cyan-400 text-slate-900 px-14 py-3 rounded-xl text-lg font-semibold
            hover:bg-cyan-300 transition-all duration-200 active:scale-95
          "
        >
          {isLastQuestion ? "Finish" : "Next"}
        </button>
      ) : (
        <p className="mt-10 text-slate-400 italic">
          Waiting for teacher to continue…
        </p>
      )}
    </div>
  );
}

export default AnswerResultPage;
