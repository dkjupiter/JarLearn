import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const shuffleArray = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export default function OrderingRenderer({ question }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    setItems(shuffleArray(question.choices));
  }, [question]);

  const onDragEnd = ({ source, destination }) => {
    if (!destination) return;
    const next = [...items];
    const [moved] = next.splice(source.index, 1);
    next.splice(destination.index, 0, moved);
    setItems(next);
  };

  return (
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
                    className="w-full py-4 px-4 bg-slate-800 border border-slate-700 rounded-xl flex items-center gap-4"
                  >
                    <div className="w-8 h-8 rounded-full bg-cyan-400 text-slate-900 flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1 text-left">{item.text}</div>
                    <div className="opacity-60">☰</div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}