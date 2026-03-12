import { useState, useEffect , useRef} from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Maximize2,Clock } from "lucide-react";
import Navbar from "../Navbar";

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
}) {
  const [items, setItems] = useState([]);
  const [timer, setTimer] = useState(null);
  const [showImage, setShowImage] = useState(false);
  const startTimeRef = useRef(null);


  /* =========================
     Init per question
     ========================= */
  useEffect(() => {
    if (!question) return;

    setItems(shuffleArray(question.choices)); // 🔀 สำคัญที่สุด
    setTimer(timeLimit ?? null);
    const key = `start_${question.Question_ID}`;
    const savedStart = localStorage.getItem(key);

    if (savedStart) {
      startTimeRef.current = Number(savedStart);
    } else {
      const now = Date.now();
      startTimeRef.current = now;
      localStorage.setItem(key, now);
    }
  }, [question?.Question_ID]);

  /* =========================
     Countdown
     ========================= */
  useEffect(() => {
    if (!Number.isFinite(timeLimit)) return;
    if (!startTimeRef.current) return;

    const updateTimer = () => {
      const elapsed =
        Math.floor((Date.now() - startTimeRef.current) / 1000);

      const remaining = timeLimit - elapsed;

      if (remaining <= 0) {
        setTimer(0);

        localStorage.removeItem(`start_${question.Question_ID}`);

        const actualTimeSpent = timeLimit;
        onTimeUp?.([], actualTimeSpent);

      } else {
        setTimer(remaining);
      }
    };

    updateTimer(); // ยิงทันทีตอน mount
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);

  }, [question?.Question_ID, timeLimit]);
  /* =========================
     Time up
     ========================= */
  useEffect(() => {
    if (timer === 0) {
      const actualTimeSpent = timeLimit;

      onTimeUp?.([], actualTimeSpent);
    }
  }, [timer]);



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
        Now Question {current}/{total}
      </p>

      {/* Question */}
      <div className="w-11/12 max-w-3xl bg-slate-800 border border-slate-700 p-6 rounded-2xl text-center text-xl font-semibold mb-4">
        {question.Question_Text}
      </div>

      {/* Image */}
      {question.Question_Image && (
        <div className="w-[260px] h-[260px] bg-slate-800 border border-slate-700 rounded-xl mb-4 relative">
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
            className="max-w-[90%] max-h-[90%] object-contain rounded-lg"
            alt="full"
          />
        </div>
      )}

      {/* Instruction */}
      <p className="text-cyan-300 mb-3 font-medium">
        Drag to sort answers
      </p>

      {/* Ordering list */}
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="ordering">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="w-11/12 max-w-3xl space-y-3"
            >
              {items.map((item, index) => (
                <Draggable
                  key={item.Option_ID}
                  draggableId={String(item.Option_ID)}
                  index={index}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="w-full py-4 px-4 bg-slate-800 border border-slate-700 rounded-xl flex items-center gap-4 cursor-move hover:bg-slate-700 transition"
                    >

                      {/* Order number */}
                      <div className="w-8 h-8 rounded-full bg-cyan-500 text-slate-900 flex items-center justify-center font-bold">
                        {index + 1}
                      </div>

                      {/* Text */}
                      <div className="flex-1 text-left">
                        {item.Option_Text}
                      </div>

                      {/* Drag icon */}
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
      <div className="w-11/12 mt-8 flex items-center justify-between">

        {/* Timer */}
        <div>
          {timer !== null && (
            <div
              className={`px-4 py-2 rounded-full flex items-center justify-center gap-1 text-lg font-bold
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
          onClick={() => {
            const payload = items.map((item, index) => ({
              optionId: item.Option_ID,
              order: index + 1,
            }));

            const actualTimeSpent = startTimeRef.current
              ? Math.floor((Date.now() - startTimeRef.current) / 1000)
              : 0;

            localStorage.removeItem(`start_${question.Question_ID}`);

            onNext(payload, actualTimeSpent);
          }}
          className="px-6 py-3 rounded-lg
          bg-cyan-400 text-slate-900 font-semibold
          hover:bg-cyan-300 hover:scale-[1.02]
          shadow-lg shadow-cyan-400/30 transition"
        >
          Next
        </button>

      </div>

    </div>
  );
}

export default Activity_quiz_ordering;