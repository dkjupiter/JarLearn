import React, { useState, useEffect } from "react";

export default function OpenChatSection({ onChange }) {
  const [chatName, setChatName] = useState("");

  useEffect(() => {
    onChange?.({
      boardName: chatName,
      allowAnonymous: false,
    });
  }, [chatName]);

  return (
    <input
      placeholder="Interactive Board name"
      value={chatName}
      onChange={(e) => setChatName(e.target.value)}
      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3
                 text-slate-100 placeholder-slate-500
                 focus:outline-none focus:ring-2 focus:ring-cyan-400"
    />
  );
}