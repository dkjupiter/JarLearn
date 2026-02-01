import { Maximize2 } from "lucide-react";
import { useState } from "react";

function Solution_quiz_select_choice({
  question,
  current,
  total,
  onNext,
}) {
  const [showImage, setShowImage] = useState(false);

  return (
    <div className="w-full min-h-screen bg-white flex flex-col items-center py-6">

      {/* Progress */}
      <p className="mb-4 font-medium">
        Solution {current}/{total}
      </p>

      {/* Question */}
      <div className="w-11/12 bg-gray-300 p-6 rounded-xl text-center text-xl font-semibold mb-4">
        {question.Question_Text}
      </div>

      {/* Image */}
      {question.Question_Image && (
        <div className="w-[300px] h-[300px] bg-gray-300 rounded-lg mb-4 relative">
          <img
            src={question.Question_Image}
            alt="question"
            className="w-full h-full object-contain"
          />

          <button
            onClick={() => setShowImage(true)}
            className="absolute bottom-2 right-2 bg-black text-white px-3 py-1 rounded-lg"
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

      {/* Choices (เฉลยแบบครู) */}
      <div className="w-11/12 space-y-3">
        {question.choices.map((c) => {
          const bg = c.isCorrect
            ? "bg-green-400 text-white"
            : "bg-red-400 text-white";

          return (
            <div
              key={c.id}
              className={`w-full py-4 rounded-xl text-center font-medium ${bg}`}
            >
              {c.text}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-10">
        <button
          onClick={onNext}
          className="w-72 py-3 mt-9 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition"
        >
          Next Question
        </button>
      </div>
    </div>
  );
}

export default Solution_quiz_select_choice;