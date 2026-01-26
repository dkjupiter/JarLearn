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
    console.log("config changed:", pollName, choices);
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
    <>
      <input
        placeholder="Poll name"
        value={pollName}
        onChange={(e) => setPollName(e.target.value)}
        className="w-full border rounded-xl px-4 py-3"
      />

      <div
        onClick={addChoice}
        className="bg-gray-200 rounded-xl px-4 py-3 flex justify-between cursor-pointer"
      >
        <span>Choice (Max 5)</span>
        <span>+ Add</span>
      </div>

      <div className="space-y-3">
        {choices.map((c, i) => (
          <div key={i} className="flex gap-3">
            <button onClick={() => removeChoice(i)}>✕</button>
            <input
              value={c}
              onChange={(e) => updateChoice(i, e.target.value)}
              placeholder={`Choice ${i + 1}`}
              className="flex-1 border rounded-xl px-4 py-3"
            />
          </div>
        ))}
      </div>
    </>
  );
}
