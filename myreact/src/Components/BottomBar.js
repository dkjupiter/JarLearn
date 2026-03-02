"use client";
import {
  ClipboardList,
  BarChart3,
  LayoutDashboard,
  Users,
} from "lucide-react";

const BottomBar = ({ activeTab, setActiveTab }) => {
  const menus = [
    { key: "activity", label: "Activity", icon: LayoutDashboard },
    { key: "plan", label: "Plan", icon: ClipboardList },
    { key: "report", label: "Report", icon: BarChart3 },
    { key: "management", label: "Manage", icon: Users },
  ];

  return (
    <div className="
      fixed bottom-0 left-0 right-0
      bg-slate-900 border-t border-slate-800
      h-20 flex justify-around items-center z-40
    ">
      {menus.map((menu) => {
        const Icon = menu.icon;
        const active = activeTab === menu.key;

        return (
          <button
            key={menu.key}
            onClick={() => setActiveTab(menu.key)}
            className="flex flex-col items-center gap-1 transition"
          >
            <Icon
              size={22}
              className={
                active
                  ? "text-cyan-400"
                  : "text-slate-500"
              }
            />
            <span
              className={`text-xs ${
                active
                  ? "text-cyan-400 font-semibold"
                  : "text-slate-500"
              }`}
            >
              {menu.label}
            </span>

            {/* Active indicator */}
            {active && (
              <div className="w-10 h-[2px] bg-cyan-400 rounded-full mt-1" />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default BottomBar;