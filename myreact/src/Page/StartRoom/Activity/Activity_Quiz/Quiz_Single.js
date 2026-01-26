import { useState, useEffect } from "react";
import { Maximize2 } from "lucide-react";

function Activity_quiz_single({ question, current, total, timeLimit, onNext }) {
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [timer, setTimer] = useState(30);
  const [showImage, setShowImage] = useState(false);

  // useEffect(() => {
  //   setTimer(timeLimit || null);
  // }, [question.Question_ID]);
  useEffect(() => {
    if (timeLimit) {
      setTimer(timeLimit);
    } else {
      setTimer(null);
    }
  }, [question.Question_ID, timeLimit]);

  // useEffect(() => {
  //   if (timer <= 0) return;

  //   const interval = setInterval(() => {
  //     setTimer((t) => t - 1);
  //   }, 1000);

  //   return () => clearInterval(interval);
  // }, [timer]);
  
  useEffect(() => {
    if (timer === null || timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((t) => t - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  // 🔐 กัน error
  if (!question || !question.choices) return <p>No choices</p>;;

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
      <p className="text-gray-700 mb-3">choose 1 choice</p>

      {/* Picture Box (แสดงเฉพาะถ้ามีรูป) */}
      {question.Question_Image && (
        <div className="w-[300px] h-[300px] bg-gray-300 flex flex-col items-center justify-center rounded-lg mb-4 relative">
          <img
            src={question.Question_Image}
            alt="question"
            className="w-full h-full object-contain"
          />

          <button
            onClick={() => setShowImage(true)}
            className="bg-black text-white px-4 py-1 rounded-lg absolute bottom-2 right-2 text-sm opacity-80 hover:opacity-100"
          >
            <Maximize2 className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Picture Modal */}
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
        {question.choices.map((c, idx) => (
          <button
            key={c.id}
            onClick={() => setSelectedChoice(idx)}
            className={`w-full py-4 rounded-xl ${
              selectedChoice === idx
                ? "bg-gray-600 text-white"
                : "bg-gray-300"
            }`}
          >
            {c.text}
          </button>
        ))}
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
          onClick={onNext}
          className="bg-gray-600 text-white px-10 py-3 rounded-xl"
          // disabled={selectedChoice === null}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default Activity_quiz_single;
