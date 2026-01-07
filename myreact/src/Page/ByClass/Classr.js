"use client";
import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import Sidebar_account from "../Sidebar_account";
import {
  MessageSquare,
  ClipboardList,
  BarChart3,
  Users
} from "lucide-react";


export default function ClassRoom() {
  const [currentPage, setCurrentPage] = useState("plan");
  const location = useLocation();
  const cls = location.state?.cls; // ดึงคลาสจาก state
  const isActive = (page) => currentPage === page ?"text-black":"text-gray-500";


  
  return (
    <div className="min-h-screen bg-white flex flex-col ">
      {/* Navbar */}
      <Sidebar_account />

      <div className="flex-1 px-4  pt-20 pb-32 overflow-auto ">
        {currentPage === "plan" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Activity Plan</h2>

            <div className="bg-gray-100 rounded-lg p-4 mb-3">
              <p className="font-medium">Quiz 1</p>
              <p className="text-sm text-gray-500">End: 10 Jan 2026</p>
            </div>

            <div className="bg-gray-100 rounded-lg p-4 mb-3">
              <p className="font-medium">Poll 1</p>
              <p className="text-sm text-gray-500">End: 12 Jan 2026</p>
            </div>
          </div>
        )}

        {currentPage === "log" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Activity Log</h2>

            <div className="bg-gray-100 p-4 rounded-lg mb-3">
              Student A joined room
            </div>

            <div className="bg-gray-100 p-4 rounded-lg mb-3">
              Quiz 1 started
            </div>
          </div>
          
        )}

        {currentPage === "report" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Report</h2>
            <p className="text-gray-500">No report available</p>
          </div>
        )}

        {currentPage === "management" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Management</h2>

            <button className="bg-gray-200 px-4 py-2 rounded-lg">
              Edit Classroom
            </button>
          </div>
        )}
      </div>


      {/* Start Room Button */}
        {currentPage === "log" && (
          <button className="fixed bottom-28 w-72 py-3 mb-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition self-center">
            Start Room
          </button>
        )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full h-[100px] bg-gray-200 flex justify-around items-center z-40">
        <button
          onClick={() => setCurrentPage("log")}
          className={`flex flex-col items-center gap-1 ${isActive("log")}`}
        >
          <MessageSquare size={28} />
          <span className="text-xs">Activity Log</span>
        </button>

        <button
          onClick={() => setCurrentPage("plan")}
          className={`flex flex-col items-center gap-1 ${isActive("plan")}`}
        >
          <ClipboardList size={28} />
          <span className="text-xs">Activity Plan</span>
        </button>

        <button
          onClick={() => setCurrentPage("report")}
          className={`flex flex-col items-center gap-1 ${isActive("report")}`}
        >
          <BarChart3 size={28} />
          <span className="text-xs">Report</span>
        </button>

        <button
          onClick={() => setCurrentPage("management")}
          className={`flex flex-col items-center gap-1 ${isActive("management")}`}
        >
          <Users size={28} />
          <span className="text-xs">Management</span>
        </button>
      </nav>


    </div>
  );
}
