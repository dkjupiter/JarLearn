"use client";
import React from "react";
import { useLocation } from "react-router-dom";
import Sidebar_account from "../Sidebar_account";

export default function ClassRoom() {
  const location = useLocation();
  const cls = location.state?.cls; // ดึงคลาสจาก state

  // ถ้าไม่มี state ส่งมา ให้แสดงข้อความ default
  const className = cls?.name || "Class name";
  const quizData = cls?.quizData || [
    { name: "Quiz name", end: "date end", count: 0 },
  ];
  const pollData = cls?.pollData || [
    { name: "Poll name", end: "date end", count: 0 },
  ];
  const chatData = cls?.chatData || [
    { name: "Chat name", end: "date end", count: 0 },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navbar */}
      <Sidebar_account />

      {/* Content */}
      <div className="flex-1 p-4 space-y-6 overflow-auto">
        <h2 className="text-lg font-semibold">{className}</h2>

        {/* Quiz Section */}
        <div>
          <h3 className="text-xl">Quiz</h3>
          <hr className="my-2" />
          {quizData.length === 0 ? (
            <div className="bg-gray-200 rounded-lg p-4 flex justify-between">
              <div>
                <p className="text-base">Quiz name</p>
                <p className="text-sm text-gray-500">date end</p>
              </div>
              <span className="text-base">Count</span>
            </div>
          ) : (
            quizData.map((q, idx) => (
              <div
                key={idx}
                className="bg-gray-200 rounded-lg p-4 flex justify-between mt-2"
              >
                <div>
                  <p className="text-base">{q.name}</p>
                  <p className="text-sm text-gray-500">End : {q.end}</p>
                </div>
                <span className="text-base">{q.count}</span>
              </div>
            ))
          )}
        </div>

        {/* Poll Section */}
        <div>
          <h3 className="text-xl">Poll</h3>
          <hr className="my-2" />
          {pollData.map((p, idx) => (
            <div
              key={idx}
              className="bg-gray-200 rounded-lg p-4 flex justify-between mt-2"
            >
              <div>
                <p className="ftext-base">{p.name}</p>
                <p className="text-sm text-gray-500">End: {p.end}</p>
              </div>
              <span className="text-base">{p.count}</span>
            </div>
          ))}
        </div>

        {/* Chat Section */}
        <div>
          <h3 className="text-xl">Chat</h3>
          <hr className="my-2" />
          {chatData.map((c, idx) => (
            <div
              key={idx}
              className="bg-gray-200 rounded-lg p-4 flex justify-between mt-2"
            >
              <div>
                <p className="text-base">{c.name}</p>
                <p className="text-sm text-gray-500">End: {c.end}</p>
              </div>
              <span className="text-base">{c.count}</span>
            </div>
          ))}
        </div>

      </div>

      {/* Start Room Button */}
        <button className="fixed bottom-28 w-72 py-3 mb-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition self-center">
          Start Room
        </button>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full h-[100px] bg-gray-200 flex justify-around items-center">
        <button className="flex flex-col items-center text-sm">
          <span>O</span>
          Activity Log
        </button>
        <button className="flex flex-col items-center text-sm">
          <span>O</span>
          Activity Plan
        </button>
        <button className="flex flex-col items-center text-sm">
          <span>O</span>
          Report
        </button>
        <button className="flex flex-col items-center text-sm">
          <span>O</span>
          Management
        </button>
      </nav>
    </div>
  );
}
