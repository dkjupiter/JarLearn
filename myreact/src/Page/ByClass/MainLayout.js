import Sidebar_account from "../Sidebar_account";
import BottomBar from "../../Components/BottomBar";
import { Outlet } from "react-router-dom";

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Top */}
      <Sidebar_account />

      {/* Content Area */}
      <main className="flex-1 pt-[56px] pb-[90px] overflow-auto">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <BottomBar />
    </div>
  );
}
