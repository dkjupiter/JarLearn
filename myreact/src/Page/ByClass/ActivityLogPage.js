"use client";
import React from "react";

export default function ActivityLogPage() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Activity Log</h2>

      <div className="bg-gray-100 p-4 rounded-lg mb-3">
        Student A joined room
      </div>

      <div className="bg-gray-100 p-4 rounded-lg mb-3">
        Quiz 1 started
      </div>

      {/* Start Room Button */}
      <button className="fixed bottom-28 left-1/2 -translate-x-1/2 w-72 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition">
        Start Room
      </button>
    </div>
  );
}
