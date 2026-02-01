import React from "react";

export default function Segment({ options, value, onChange }) {
  return (
    <div className="flex border rounded-xl overflow-hidden">
      {options.map((o) => (
        <button
          key={o.key}
          onClick={() => onChange(o.key)}
          className={`flex-1 py-3 whitespace-pre-line
            ${
              value === o.key
                ? "bg-gray-400 text-white"
                : "bg-gray-200 text-gray-600"
            }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
