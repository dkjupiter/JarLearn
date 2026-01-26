import React, { useState, useEffect, useRef } from "react";

const OpenChat = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "หิวข้าวแล้วจ้า ปล่อยช้ามากเลยจ้าาาาาาาาาาาาาาา",
      time: new Date("2025-01-01T08:00:00"),
    },
    {
      id: 2,
      text: "ยากเกินทน นศจะไม่ทน",
      time: new Date("2025-01-01T08:00:10"),
    },
  ]);

  const [input, setInput] = useState("");

  const scrollRef = useRef(null); // container
  const bottomRef = useRef(null); // point to scroll into view

  // Auto scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Format time (e.g., "8:00 AM")
  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // Show time divider if gap >= 1 hour
  const shouldShowTimestamp = (prev, curr) => {
    if (!prev) return true; // first message
    const diff = curr.time - prev.time;
    return diff >= 1000 * 60 * 60; // 1 hour
  };

  // Send message
  const handleSend = () => {
    if (!input.trim()) return;

    const newMsg = {
      id: Date.now(),
      text: input.trim(),
      time: new Date(),
    };

    setMessages([...messages, newMsg]);
    setInput("");
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">

      {/* Header */}
      <div className="sticky top-0 bg-gray-300 p-8 text-center text-3xl font-bold z-10">
        Open chat <br /> Quiz name
      </div>

      {/* Chat Body */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-6 pt-6"
      >
        {messages.map((msg, index) => {
          const showDivider = shouldShowTimestamp(messages[index - 1], msg);
          return (
            <div key={msg.id} className="mb-4">

              {/* Time Divider */}
              {showDivider && (
                <div className="text-center text-gray-500 my-4">
                  {formatTime(msg.time)}
                </div>
              )}

              {/* Chat Bubble */}
              <div className="bg-gray-300 p-4 rounded-2xl w-fit max-w-[85%]">
                <div>{msg.text}</div>

                <div className="text-right text-xs text-gray-600 mt-1">
                  {formatTime(msg.time)}
                </div>
              </div>
            </div>
          );
        })}

        {/* AUTO-SCROLL TARGET */}
        <div ref={bottomRef} />
      </div>

      {/* Bottom Input */}
      <div className="sticky bottom-0 left-0 w-full bg-gray-300 p-6 rounded-t-3xl">
        <p className="text-center mb-2 text-lg font-medium">
          Do you have any questions?
        </p>

        <div className="flex items-center gap-3">
          <input
            type="text"
            className="flex-1 bg-white px-4 py-3 rounded-xl outline-none"
            placeholder="Ask..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />

          <button
            onClick={handleSend}
            className="w-12 h-12 rounded-full bg-gray-500 flex items-center justify-center"
          >
            <span className="text-white text-xl">➤</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default OpenChat;
