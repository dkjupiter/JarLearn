import { useEffect, useState } from "react";
import { socket } from "../../../../../socket";

function QuizProgressPage({
  activitySessionId,
  totalQuestions,
  timeType,              // "question_timer" | "quiz_timer" | "manual_end"
  quizTimeLimit,     // ใช้เฉพาะ quiz_timer (วินาที)
  questionTimeLimit, // ใช้เฉพาะ question_timer (วินาที)
  onEndQuiz,         // callback ไป Final Ranking
}) {
  const [progress, setProgress] = useState([]);
  // const [timer, setTimer] = useState(quizTimeLimit ?? null);

  const [timer, setTimer] = useState(() => {
    if (timeType === "quiz" && quizTimeLimit != null) {
      return quizTimeLimit * 60; // นาที → วินาที
    }
    else if (timeType === "question" && questionTimeLimit != null) {
      return questionTimeLimit; // สมมติ client จะส่งมาเป็นวินาทีเลย
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
    <div className="w-full min-h-screen bg-white flex flex-col items-center py-6">

      {/* Title */}
      <h1 className="text-2xl font-bold mb-2">
        Quiz Progress
      </h1>

      <p className="text-gray-600 mb-6">
        นักเรียนที่ทำเสร็จแล้ว {finishedCount}/{progress.length}
      </p>

      {/* Quiz Timer */}
      {timeType === "quiz" && timer !== null && (
        <div
          className={`mb-6 w-32 h-32 rounded-full flex items-center justify-center text-3xl font-bold
            ${timer <= 5 ? "bg-red-400 text-white" : "bg-gray-300"}
          `}
        >
          {formatTime(timer)}
        </div>
      )}

      {/* Progress List */}
      <div className="w-11/12 max-w-2xl border rounded-2xl p-5 space-y-4">

        {progress.map((p) => {
          const percent =
            p.total_questions > 0
              ? Math.round((p.current_question / p.total_questions) * 100)
              : 0;

          const finished = percent >= 100;

          return (
            <div
              key={p.Student_ID}
              className="flex items-center gap-3"
            >
              {/* Name */}
              <div className="w-28 text-sm font-medium truncate">
                {p.Student_Name}
              </div>

              {/* Bar */}
              <div className="flex-1 h-4 bg-gray-200 rounded">
                <div
                  className={`h-full rounded transition-all
                    ${finished ? "bg-green-500" : "bg-gray-500"}
                  `}
                  style={{ width: `${percent}%` }}
                />
              </div>

              {/* Percent */}
              <div className="w-14 text-right text-sm">
                {percent}% ({p.current_question}/{p.total_questions})
              </div>
            </div>
          );
        })}

        {progress.length === 0 && (
          <p className="text-center text-gray-400">
            Waiting for students...
          </p>
        )}
      </div>

      {/* Footer buttons */}
      <div className="mt-10 space-y-3 w-72">

        {/* Manual End */}
        {timeType === "manual" && (
          <button
            onClick={() => {
              socket.emit("force_submit", { activitySessionId });
              socket.emit("end_quiz", { activitySessionId });
              onEndQuiz?.();
            }}
            className="w-full py-3 bg-red-500 text-white rounded-xl hover:bg-red-600"
          >
            End Quiz
          </button>
        )}

        {/* Question Timer (auto แต่ให้จบเองได้) */}
        {timeType === "question" && (
          <button
            onClick={onEndQuiz}
            className="w-full py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700"
          >
            Finish Quiz
          </button>
        )}
      </div>
    </div>
  );
}

export default QuizProgressPage;