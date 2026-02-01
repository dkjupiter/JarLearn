import React, { useState, useEffect } from "react";

export default function OpenChatSection({ onChange }) {
  const [chatName, setChatName] = useState("");

  useEffect(() => {
    onChange?.({
      boardName: chatName,
      allowAnonymous: false, // เผื่ออนาคต
    });
    console.log("📤 Quiz config changed:", chatName);
  }, [chatName]);

  return (
    <input
      placeholder="Interactive Board name"
      value={chatName}
      onChange={(e) => setChatName(e.target.value)}
      className="w-full border rounded-xl px-4 py-3"
    />
  );
}
