import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Maximize2 } from "lucide-react";

function Activity_quiz_ordering({ question, current, total, timeLimit, onNext, onTimeUp  }) {
  const [items, setItems] = useState([]);
  const [timer, setTimer] = useState(null);
  const [showImage, setShowImage] = useState(false);

  useEffect(() => {
    if (!question) return;

    const uniqueChoices = [];
    const seen = new Set();

    for (const c of question.choices) {
        if (!seen.has(c.id)) {
        seen.add(c.id);
        uniqueChoices.push(c);
        }
    }

    setItems(uniqueChoices);
    setTimer(timeLimit ?? null);
    }, [question, timeLimit]);

  /* ⏱ init */
//   useEffect(() => {
//     if (!question?.choices) return;

//     setItems(question.choices);
//     setTimer(timeLimit ?? null);
//   }, [question.Question_ID, timeLimit]);

  /* ⏱ countdown */
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

  /* 🔁 reorder */
  const onDragEnd = (result) => {
    if (!result.destination) return;

    const newItems = Array.from(items);
    const [removed] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, removed);

    setItems(newItems);
  };

  if (!question || !items.length) return <p>No choices</p>;

  return (
    <div className="w-full min-h-screen bg-white flex flex-col items-center py-6">

      {/* Progress */}
      <p className="mb-4 font-medium">
        Now Question {current}/{total}
      </p>

      {/* Question */}
      <div className="w-11/12 bg-gray-300 p-6 rounded-xl text-center text-xl font-semibold mb-4">
        {question.Question_Text}
      </div>

      {/* <p className="text-gray-700 mb-3">drag to sort answers</p> */}

      {/* 🖼 Image */}
      {question.Question_Image && (
        <div className="w-[300px] h-[300px] bg-gray-300 rounded-lg mb-4 relative">
          <img
            src={question.Question_Image}
            className="w-full h-full object-contain"
            alt="question"
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
      
      <p className="text-gray-700 mb-3">drag to sort answers</p>

      {/* 🔃 Ordering list */}
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="ordering">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="w-11/12 space-y-3"
            >
              {items.map((item, index) => (
                <Draggable
                  key={`${item.id}-${index}`}
                  draggableId={`${item.id}-${index}`}
                  index={index}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="w-full py-4 px-4 bg-gray-300 rounded-xl flex items-center gap-4 cursor-move hover:bg-gray-400"
                    >
                      {/* order number */}
                      <div className="w-8 h-8 rounded-full bg-gray-600 text-white flex items-center justify-center font-bold">
                        {index + 1}
                      </div>

                      {/* text */}
                      <div className="flex-1 text-left">
                        {item.text}
                      </div>

                      {/* drag icon */}
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
          onClick={() => onNext(items.map((item, index) => ({
    optionId: item.id,
    order: index + 1,
  })))}
          className="bg-gray-600 text-white px-10 py-3 rounded-xl"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default Activity_quiz_ordering;
