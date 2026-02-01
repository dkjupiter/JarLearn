import { useState, useEffect } from "react";
import { Maximize2 } from "lucide-react";

function Activity_quiz_multiple({ question, current, total, timeLimit, onNext, onTimeUp  }) {
  const [selectedChoices, setSelectedChoices] = useState([]);
  const [timer, setTimer] = useState(null);
  const [showImage, setShowImage] = useState(false);

  /* ⏱ ตั้งเวลา */
  useEffect(() => {
    if (timeLimit) {
      setTimer(timeLimit);
    } else {
      setTimer(null);
    }
    setSelectedChoices([]); // reset เมื่อเปลี่ยนข้อ
  }, [question.Question_ID, timeLimit]);

  useEffect(() => {
    if (timer === null || timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((t) => t - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  useEffect(() => {
    if (timer === 0) {
      onTimeUp?.();
    }
  }, [timer]);

  /* 🔐 กันพัง */
  if (!question || !question.choices) return <p>No choices</p>;

  /* 🎯 toggle หลายคำตอบ */
  const toggleChoice = (idx) => {
    setSelectedChoices((prev) =>
      prev.includes(idx)
        ? prev.filter((i) => i !== idx)
        : [...prev, idx]
    );
  };

  console.log("choices:", question.choices);

  return (
    <div className="w-full min-h-screen bg-white flex flex-col items-center py-6">

      {/* Progress */}
      <p className="mb-4 font-medium">
        Now Question {current}/{total}
      </p>

      {/* Question text */}
      <div className="w-11/12 bg-gray-300 p-6 rounded-xl text-center text-xl font-semibold mb-4">
        {question.Question_Text}
      </div>

      {/* Choose text */}
      <p className="text-gray-700 mb-3">select all correct choices</p>

      {/* 🖼 Image (ถ้ามี) */}
      {question.Question_Image && (
        <div className="w-[300px] h-[300px] bg-gray-300 rounded-lg mb-4 relative">
          <img
            src={question.Question_Image}
            alt="question"
            className="w-full h-full object-contain"
          />

          <button
            onClick={() => setShowImage(true)}
            className="bg-black text-white px-3 py-1 rounded-lg absolute bottom-2 right-2 opacity-80"
          >
            <Maximize2 className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Fullscreen Image */}
      {showImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center"
          onClick={() => setShowImage(false)}
        >
          <img
            src={question.Question_Image}
            className="max-w-[90%] max-h-[90%] object-contain rounded-lg"
            alt="full"
          />
        </div>
      )}

      {/* Choices */}
      <div className="w-11/12 space-y-3">
        {question.choices.map((c, idx) => {
          const isSelected = selectedChoices.includes(idx);

          return (
            <button
              key={c.id}
              onClick={() => toggleChoice(idx)}
              className={`w-full py-4 rounded-xl transition ${
                isSelected
                  ? "bg-green-400 text-white"
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
            >
              {c.text}
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-8 flex items-center gap-6">
        {timer !== null && (
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold ${
              timer <= 5 ? "bg-red-400 text-white" : "bg-gray-300"
            }`}
          >
            {timer}s
          </div>
        )}

        <button
          onClick={() => onNext(selectedChoices)}
          className="w-72 py-3 mt-9 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition"
          // disabled={selectedChoices.length === 0}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default Activity_quiz_multiple;
