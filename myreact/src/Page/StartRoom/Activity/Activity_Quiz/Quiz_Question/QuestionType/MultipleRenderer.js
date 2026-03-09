import { useState } from "react";

export default function MultipleRenderer({ question }) {
  const [selected, setSelected] = useState([]);

  const toggle = (idx) => {
    setSelected((prev) =>
      prev.includes(idx)
        ? prev.filter((i) => i !== idx)
        : [...prev, idx]
    );
  };

  return (
    <div className="w-11/12 max-w-3xl space-y-3">
      {question.choices.map((c, idx) => {
        const isSelected = selected.includes(idx);
        return (
          <button
            key={c.id}
            onClick={() => toggle(idx)}
            className={`w-full py-4 rounded-xl border transition
              ${isSelected
                ? "bg-cyan-400 text-slate-900 border-cyan-300"
                : "bg-slate-800 border-slate-700 hover:bg-slate-700"
              }`}
          >
            {c.text}
          </button>
        );
      })}
    </div>
  );
}