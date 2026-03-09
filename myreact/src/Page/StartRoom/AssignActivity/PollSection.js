import React, { useState, useEffect } from "react";

export default function PollSection({ onChange }) {
  const [pollName, setPollName] = useState("");
  const [choices, setChoices] = useState(["", ""]);

  useEffect(() => {
    onChange?.({
      pollQuestion: pollName,
      choices: choices.filter((c) => c.trim() !== ""),
      allowMultiple: false,
      duration: null,
    });
  }, [pollName, choices]);

  const addChoice = () => {
    if (choices.length < 5) setChoices([...choices, ""]);
  };

  const updateChoice = (i, value) => {
    const copy = [...choices];
    copy[i] = value;
    setChoices(copy);
  };

  const removeChoice = (i) => {
    if (choices.length <= 2) return;
    setChoices(choices.filter((_, index) => index !== i));
  };

  return (
    <div className="space-y-4">
      <input
        placeholder="Poll name"
        value={pollName}
        onChange={(e) => setPollName(e.target.value)}
        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3
                   text-slate-100 placeholder-slate-500
                   focus:outline-none focus:ring-2 focus:ring-cyan-400"
      />

      <button
        onClick={addChoice}
        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3
                   text-slate-200 hover:bg-slate-700 transition"
      >
        + Add Choice (Max 5)
      </button>

      <div className="space-y-3">
        {choices.map((c, i) => (
          <div key={i} className="flex gap-3">
            <input
              value={c}
              onChange={(e) => updateChoice(i, e.target.value)}
              placeholder={`Choice ${i + 1}`}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3
                         text-slate-100 placeholder-slate-500
                         focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
            {choices.length > 2 && (
              <button onClick={() => removeChoice(i)} className="text-red-400">
                ✕
              </button>
            )}
          </div>
          
        ))}
      </div>
    </div>
  );
}