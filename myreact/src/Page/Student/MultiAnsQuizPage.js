import { useState, useEffect, useRef } from "react";
import Navbar from "../Navbar";
import { socket } from "../../socket";
import { Maximize2 ,Clock } from "lucide-react";


function MultiAnsQuizPage({
  question,
  timeLimit,
  isQuizTimer,
  currentQuestion,
  totalQuestions,
  onSubmit,
}) {
  const [selectedChoices, setSelectedChoices] = useState([]);
  const [timer, setTimer] = useState(() =>
    Number.isFinite(timeLimit) ? timeLimit : 0
  );

  const [locked, setLocked] = useState(false);
  const startTimeRef = useRef(null);
  const [showImage, setShowImage] = useState(false);


 const autoSubmit = () => {
    if (locked) return;
    setLocked(true);

    localStorage.removeItem(`start_${question.Question_ID}`);

    const timeSpent = startTimeRef.current
      ? Math.floor((Date.now() - startTimeRef.current) / 1000)
      : 0;

    onSubmit(selectedChoices, timeSpent);
  };

  useEffect(() => {
    if (isQuizTimer) return;
    if (!Number.isFinite(timeLimit)) return;

    setLocked(false);
    setSelectedChoices([]);

    const key = `start_${question.Question_ID}`;
    const savedStart = localStorage.getItem(key);

    if (savedStart) {
      const elapsed =
        Math.floor((Date.now() - Number(savedStart)) / 1000);

      if (elapsed >= timeLimit) {
        const now = Date.now();
        startTimeRef.current = now;
        localStorage.setItem(key, now);
      } else {
        startTimeRef.current = Number(savedStart);
      }
    } else {
      const now = Date.now();
      startTimeRef.current = now;
      localStorage.setItem(key, now);
    }

  }, [question.Question_ID, timeLimit, isQuizTimer]);

  //countdown (เฉพาะที่ไม่ใช่ quiztimer)
  useEffect(() => {
    if (isQuizTimer) return;
    if (!Number.isFinite(timeLimit)) return;
    if (!startTimeRef.current) return;
    if (locked) return;

    const updateTimer = () => {
      const elapsed =
        Math.floor((Date.now() - startTimeRef.current) / 1000);

      const remaining = timeLimit - elapsed;

      if (remaining <= 0) {
        setTimer(0);
        autoSubmit();
      } else {
        setTimer(remaining);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);

  }, [question.Question_ID, locked, timeLimit, isQuizTimer]);

  //sync Quiz Timer (แสดงอย่างเดียว)
  useEffect(() => {
    if (!isQuizTimer) return;
    if (!Number.isFinite(timeLimit)) return;

    setTimer(timeLimit);
  }, [timeLimit, isQuizTimer]);

  /* 👩‍🏫 ครูกดตัดข้อ */
  useEffect(() => {
    socket.on("force_submit", autoSubmit);
    return () => socket.off("force_submit", autoSubmit);
  }, []);

  const toggle = (id) => {
    if (locked) return;

    setSelectedChoices((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  const formatTime = (seconds) => {
    if (!Number.isFinite(seconds)) return "";

    const m = Math.floor(seconds / 60);
    const s = seconds % 60;

    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-full min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center py-6">
      <Navbar />

      {/* Progress */}
      <p className="mt-16 mb-4 text-slate-400 font-medium">
        Now Question {currentQuestion}/{totalQuestions}
      </p>

      {/* Question */}
      <div className="w-11/12 max-w-3xl bg-slate-800 border border-slate-700 p-6 rounded-2xl text-center text-xl font-semibold mb-4">
        {question.Question_Text}
      </div>

      {/* Instruction */}
      <p className="text-cyan-300 mb-3 font-medium">
        Select all correct choices
      </p>

      {/* Image */}
      {question.Question_Image && (
        <div className="w-[240px] h-[240px] bg-slate-800 border border-slate-700 rounded-xl mb-4 relative">
          <img
            src={question.Question_Image}
            alt="question"
            className="w-full h-full object-contain"
          />

          <button
            onClick={() => setShowImage(true)}
            className="absolute bottom-2 right-2 bg-slate-900 text-slate-100 px-3 py-1 rounded-lg"
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
            className="max-w-[90%] max-h-[90%]"
            alt="full"
          />
        </div>
      )}

      {/* Choices */}
      <div className="w-11/12 max-w-3xl space-y-3 mt-4">
        {question.choices.map((c) => (
          <button
            key={c.Option_ID}
            onClick={() => toggle(c.Option_ID)}
            disabled={locked}
            className={`w-full py-4 rounded-xl transition font-medium
            ${
              selectedChoices.includes(c.Option_ID)
                ? "bg-cyan-500 text-slate-900"
                : "bg-slate-800 border border-slate-700 hover:bg-slate-700"
            }
            ${locked ? "opacity-50 cursor-not-allowed" : ""}
            `}
          >
            {c.Option_Text}
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-8 w-11/12 max-w-3xl flex items-center justify-between">

        {/* Timer */}
        <div>
          {!isQuizTimer && Number.isFinite(timer) && (
            <div
              className={`px-4 py-2 rounded-full font-semibold flex items-center gap-2
              ${
                timer <= 5
                  ? "bg-red-500 text-white"
                  : "bg-cyan-700 text-slate-100"
              }`}
            >
              <Clock size={18} />
              <span>{formatTime(timer)}s</span>
            </div>
          )}
        </div>

        {/* Next */}
        <button
          disabled={locked || selectedChoices.length === 0}
          onClick={autoSubmit}
          className="px-6 py-3 rounded-lg
          bg-cyan-400 text-slate-900 font-semibold
          hover:bg-cyan-300 hover:scale-[1.02]
          shadow-lg shadow-cyan-400/30
          transition disabled:opacity-50"
        >
          Next
        </button>

      </div>
    </div>
  );
}

export default MultiAnsQuizPage;
