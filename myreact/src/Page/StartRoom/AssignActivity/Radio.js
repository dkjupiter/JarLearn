import React from "react";

export default function Radio({ label, checked, onClick }) {
  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3 cursor-pointer"
    >
      <div className="w-6 h-6 rounded-full border flex items-center justify-center">
        {checked && (
          <div className="w-3 h-3 rounded-full bg-gray-700" />
        )}
      </div>
      <span>{label}</span>
    </div>
  );
}
