"use client";
import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import Sidebar_account from "../Sidebar_account";
import {
  MessageSquare,
  ClipboardList,
  BarChart3,
  Users,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";

import ManagementPage from "./ManagementPage";
import PlanPage from "./PlanPage";
import ActivityLogPage from "./ActivityLogPage";
import ReportPage from "./ReportPage";


export default function ClassRoom() {
  const [currentPage, setCurrentPage] = useState("plan");
  const location = useLocation();
  const cls = location.state?.cls;
  const isActive = (page) => currentPage === page ? "text-black" : "text-gray-500";
  console.log("cls in ClassRoom:", cls);

  
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Sidebar_account />

      <div className="flex-1 px-4 pt-20 pb-32 overflow-auto">
        {currentPage === "plan" && <PlanPage cls={cls}/>}
        {currentPage === "log" && <ActivityLogPage />}
        {currentPage === "report" && <ReportPage />}
        {currentPage === "management" && <ManagementPage cls={cls} />}
      </div>
      
      {/* Bottom Nav */}
      <nav className="fixed bottom-0 w-full h-[100px] bg-gray-200 flex justify-around items-center">
        <button
          onClick={() => setCurrentPage("plan")}
          className={`flex flex-col items-center ${isActive("plan")}`}
        >
          <ClipboardList size={28} />
          <span className="text-xs">Activity Plan</span>
        </button>

        <button
          onClick={() => setCurrentPage("log")}
          className={`flex flex-col items-center ${isActive("log")}`}
        >
          <MessageSquare size={28} />
          <span className="text-xs">Activity Log</span>
        </button>

        <button
          onClick={() => setCurrentPage("report")}
          className={`flex flex-col items-center ${isActive("report")}`}
        >
          <BarChart3 size={28} />
          <span className="text-xs">Report</span>
        </button>

        <button
          onClick={() => setCurrentPage("management")}
          className={`flex flex-col items-center ${isActive("management")}`}
        >
          <Users size={28} />
          <span className="text-xs">Management</span>
        </button>
      </nav>
    </div>
  );
}
