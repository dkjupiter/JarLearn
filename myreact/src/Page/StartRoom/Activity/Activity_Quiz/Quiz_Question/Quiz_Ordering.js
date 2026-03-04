import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Maximize2 } from "lucide-react";

/* 🔀 shuffle helper */
function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function Activity_quiz_ordering({
  question,
  current,
  total,
  timeLimit,
  onNext,
  onTimeUp,
  answeredCount,
  totalStudents
}) {
  const [items, setItems] = useState([]);
  const [timer, setTimer] = useState(null);
  const [showImage, setShowImage] = useState(false);

  /* =========================
     Init per question
     ========================= */
  useEffect(() => {
    if (!question) return;

    setItems(shuffleArray(question.choices)); // 🔀 สำคัญที่สุด
    setTimer(timeLimit ?? null);
  }, [question, timeLimit]);

  /* =========================
     Countdown
     ========================= */
  useEffect(() => {
    if (timer === null || timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((t) => t - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  /* =========================
     Time up
     ========================= */
  useEffect(() => {
    if (timer === 0) {
      onTimeUp?.();
    }
  }, [timer, onTimeUp]);

  /* =========================
     Drag reorder
     ========================= */
  const onDragEnd = ({ source, destination }) => {
    if (!destination) return;

    setItems((prev) => {
      const next = [...prev];
      const [moved] = next.splice(source.index, 1);
      next.splice(destination.index, 0, moved);
      return next;
    });
  };

  if (!question || items.length === 0) {
    return <p className="text-center mt-20">Loading...</p>;
  }

  return (
    <div className="w-full min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center py-6">

      <p className="mb-4 text-slate-400 font-medium">
        Question {current}/{total}
      </p>

      <div className="w-11/12 max-w-3xl bg-slate-800 border border-slate-700 p-6 rounded-2xl text-center text-xl font-semibold mb-4">
        {question.Question_Text}
      </div>

      <p className="text-slate-400 mb-3">Drag to sort answers</p>

      {/* Image */}
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

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="ordering">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}
              className="w-11/12 max-w-3xl space-y-3">

              {items.map((item, index) => (
                <Draggable key={item.id} draggableId={String(item.id)} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="w-full py-4 px-4 bg-slate-800 border border-slate-700 rounded-xl flex items-center gap-4 cursor-move hover:bg-slate-700 transition"
                    >
                      <div className="w-8 h-8 rounded-full bg-cyan-400 text-slate-900 flex items-center justify-center font-bold">
                        {index + 1}
                      </div>

                      <div className="flex-1 text-left">
                        {item.text}
                      </div>

                      <div className="text-xl opacity-60">☰</div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

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

export default Activity_quiz_ordering;