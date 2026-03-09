import { useState } from "react";

export default function SingleRenderer({ question }) {
  const [selected, setSelected] = useState(null);

  return (
    <div className="w-11/12 max-w-3xl space-y-3">
      {question.choices.map((c, idx) => (
        <button
          key={c.id}
          onClick={() => setSelected(idx)}
          className={`w-full py-4 rounded-xl border transition
            ${selected === idx
              ? "bg-cyan-400 text-slate-900 border-cyan-300"
              : "bg-slate-800 border-slate-700 hover:bg-slate-700"
            }`}
        >
          {c.text}
        </button>
      ))}
    </div>
  );
}