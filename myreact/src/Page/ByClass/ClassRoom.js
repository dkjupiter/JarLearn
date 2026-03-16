"use client";
import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import Sidebar_account from "../Sidebar_account";
import {
  MessageSquare,
  ClipboardList,
  BarChart3,
  Users,
} from "lucide-react";

import ManagementPage from "./ManagementPage";
import PlanPage from "./PlanPage";
import ActivityLogPage from "./ActivityLog/ActivityLogPage";
import ReportPage from "./ReportLog/ReportLog";

export default function ClassRoom() {
  const [currentPage, setCurrentPage] = useState("plan");
  const location = useLocation();
  const cls = location.state?.cls;

  const isActive = (page) =>
    currentPage === page
      ? "text-cyan-300"
      : "text-slate-500";

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* 🔹 Top bar */}
      <Sidebar_account />

      {/* 🔹 Content */}
      <div className="flex-1 pt-16 pb-28 px-4 overflow-y-auto">
        {/* Pages */}
        {currentPage === "plan" && <PlanPage cls={cls} />}
        {currentPage === "log" && <ActivityLogPage cls={cls} />}
        {currentPage === "report" && <ReportPage classId={cls?.id} />}
        {currentPage === "management" && <ManagementPage cls={cls} />}
      </div>

      {/* 🔹 Bottom Nav */}
      <nav className="fixed bottom-0 w-full h-20 bg-slate-900 border-t border-slate-800 flex justify-around items-center z-80">
        <NavButton
          icon={ClipboardList}
          label="Plan"
          active={isActive("plan")}
          onClick={() => setCurrentPage("plan")}
        />
        <NavButton
          icon={MessageSquare}
          label="Log"
          active={isActive("log")}
          onClick={() => setCurrentPage("log")}
        />
        <NavButton
          icon={BarChart3}
          label="Report"
          active={isActive("report")}
          onClick={() => setCurrentPage("report")}
        />
        <NavButton
          icon={Users}
          label="Manage"
          active={isActive("management")}
          onClick={() => setCurrentPage("management")}
        />
      </nav>
    </div>
  );
}

/* 🔹 Bottom Nav Button */
function NavButton({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 transition ${active}`}
    >
      <Icon size={26} />
      <span className="text-[12px]">{label}</span>
    </button>
  );
}