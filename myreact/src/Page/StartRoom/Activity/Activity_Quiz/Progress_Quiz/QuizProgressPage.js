import { useEffect, useState } from "react";
import { socket } from "../../../../../socket";

function QuizProgressPage({
  activitySessionId,
  totalQuestions,
  timeType,
  quizTimeLimit,
  questionTimeLimit,
  onEndQuiz,
}) {
  const [progress, setProgress] = useState([]);

  const [timer, setTimer] = useState(() => {
    if (timeType === "quiz" && quizTimeLimit != null) {
      return quizTimeLimit * 60;
    } else if (timeType === "question" && questionTimeLimit != null) {
      return questionTimeLimit;
    } else return null;
  });

  console.log("⏱️ QuizProgressPage render", { timeType, timer });

  /* =========================
     Fetch progress
  ========================= */
  useEffect(() => {
    if (!activitySessionId) return;

    socket.emit("get_quiz_progress", { activitySessionId });

    const handler = (data) => setProgress(data);

    socket.on("quiz_progress_data", handler);

    socket.on("quiz_progress_updated", () => {
      socket.emit("get_quiz_progress", { activitySessionId });
    });

    return () => {
      socket.off("quiz_progress_data", handler);
      socket.off("quiz_progress_updated");
    };
  }, [activitySessionId]);

  /* =========================
     Quiz timer countdown
  ========================= */
  useEffect(() => {
    if (timeType !== "quiz" || timer === null) return;
    if (timer <= 0) {
      onEndQuiz?.();
      return;
    }

    const interval = setInterval(() => {
      setTimer((t) => t - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer, timeType]);

  /* =========================
     Helper
  ========================= */
  const finishedCount = progress.filter(
    (p) => p.current_question >= p.total_questions
  ).length;

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-full min-h-screen bg-slate-900 text-white flex flex-col items-center py-8 px-4">

      {/* Title */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold">Quiz Progress</h1>

        <p className="text-slate-400 mt-2">
          นักเรียนที่ทำเสร็จแล้ว{" "}
          <span className="text-cyan-400 font-semibold">
            {finishedCount}/{progress.length}
          </span>
        </p>
      </div>

      {/* Quiz Timer */}
      {timeType === "quiz" && timer !== null && (
        <div
          className={`mb-8 w-32 h-32 rounded-full flex items-center justify-center text-3xl font-bold shadow-lg border
          ${
            timer <= 5
              ? "bg-red-500 border-red-400"
              : "bg-slate-800 border-slate-700"
          }
        `}
        >
          {formatTime(timer)}
        </div>
      )}

      {/* Progress Card */}
      <div className="w-full max-w-3xl bg-slate-800 border border-slate-700 rounded-2xl p-6 space-y-4">

        {progress.map((p) => {
          const percent =
            p.total_questions > 0
              ? Math.round((p.current_question / p.total_questions) * 100)
              : 0;

          const finished = percent >= 100;

          return (
            <div
              key={p.Student_ID}
              className="flex items-center gap-4"
            >
              {/* Name */}
              <div className="w-28 sm:w-36 text-sm font-medium truncate text-slate-200">
                {p.Student_Name}
              </div>

              {/* Bar */}
              <div className="flex-1 h-4 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500
                  ${
                    finished
                      ? "bg-green-500"
                      : "bg-cyan-400"
                  }
                `}
                  style={{ width: `${percent}%` }}
                />
              </div>

              {/* Percent */}
              <div className="w-16 text-right text-sm text-slate-300">
                {percent}%
              </div>
            </div>
          );
        })}

        {progress.length === 0 && (
          <p className="text-center text-slate-400 py-6">
            Waiting for students...
          </p>
        )}
      </div>

      {/* Footer buttons */}
      <div className="mt-10 space-y-3 w-full max-w-xs">

        {/* Manual End */}
        {timeType === "manual" && (
          <button
            onClick={() => {
              socket.emit("force_submit", { activitySessionId });
              socket.emit("end_quiz", { activitySessionId });
              onEndQuiz?.();
            }}
            className="w-full py-3 rounded-xl font-semibold
            bg-red-500 hover:bg-red-400 transition"
          >
            End Quiz
          </button>
        )}

        {/* Question Timer */}
        {timeType === "question" && (
          <button
            onClick={onEndQuiz}
            className="w-full py-3 rounded-xl font-semibold
            bg-cyan-500 hover:bg-cyan-400 transition"
          >
            Finish Quiz
          </button>
        )}
      </div>
    </div>
  );
}

export default QuizProgressPage;