
//UI แบบที่ 1
"use client";
import React from "react";

export default function ReportPage() {
  const overall = {
    student: 30,
    done: 18,
    percent: 60,
    quizCount: 10,
    avgScore: 70,
    avgTime: 10,
  };

  const quizzes = [
    { id: 1, percent: 80 },
    { id: 2, percent: 70 },
    { id: 3, percent: 60 },
    { id: 4, percent: 90 },
  ];

  return (
    <div className="px-4 pt-6 pb-[180px]">
      {/* Title */}
      <h2 className="text-3xl font-bold text-center mb-6">Report</h2>

      {/* Card */}
      <div className="border-2 border-black rounded-2xl p-4 space-y-6">
        {/* Chart placeholder */}
        <div className="bg-gray-300 rounded-2xl p-4">
          <div className="text-sm mb-2">
            รวมคะแนนนักเรียนทุกควิซ
          </div>
          <div className="h-40 flex items-center justify-center">
            📊
          </div>
        </div>

        {/* Overall */}
        <div>
          <h3 className="text-xl font-semibold mb-2">
            Overall
          </h3>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Student :</span>
              <span>{overall.student}</span>
            </div>
            <div className="flex justify-between">
              <span>Already Done :</span>
              <span>
                {overall.done} ({overall.percent}%)
              </span>
            </div>
            <div className="flex justify-between">
              <span>Number of Quiz :</span>
              <span>{overall.quizCount}</span>
            </div>
            <div className="flex justify-between">
              <span>Average Score :</span>
              <span>{overall.avgScore}%</span>
            </div>
            <div className="flex justify-between">
              <span>Average Time :</span>
              <span>{overall.avgTime} mins</span>
            </div>
          </div>
        </div>

        {/* Each Quiz */}
        <div>
          <h3 className="text-xl font-semibold mb-2">
            Each Quiz
          </h3>

          <div className="space-y-3">
            {quizzes.map((q) => (
              <div key={q.id}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{q.id}</span>
                  <span>{q.percent}%</span>
                </div>
                <div className="h-4 bg-gray-300 rounded-full">
                  <div
                    className="h-4 bg-gray-500 rounded-full"
                    style={{ width: `${q.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Export CSV */}
      <button className="fixed bottom-28 left-1/2 -translate-x-1/2 w-72 py-3 bg-gray-500 text-white rounded-lg text-lg">
        Export CSV
      </button>
    </div>
  );
}