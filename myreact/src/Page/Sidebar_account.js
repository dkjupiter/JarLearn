"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, BookOpen, FileText, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { useTeacher } from "./TeacherContext";

export default function Sidebar_account() {
  const [isOpen, setIsOpen] = useState(false);
  const { setTeacherId } = useTeacher();

  const handleSignOut = () => {
    setTeacherId(null);
    localStorage.removeItem("teacherId");
    setIsOpen(false);
  };

  const links = [
    { label: "Class", to: "/myclass", icon: BookOpen },
    { label: "Quiz", to: "/managequiz", icon: FileText },
    { label: "Sign out", to: "/", icon: LogOut, onClick: handleSignOut, danger: true },
  ];

  return (
    <div className="relative">
      {/* Top Navbar */}
      <div className="fixed top-0 left-0 w-full flex items-center justify-center p-4 
                      bg-slate-900/80 backdrop-blur-md border-b border-slate-800 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="absolute left-4 p-2 rounded-lg hover:bg-slate-800 transition"
        >
          {isOpen ? <X size={28} className="text-slate-200"/> : <Menu size={28} className="text-slate-200"/>}
        </button>

        <h1 className="text-xl font-bold text-slate-100 tracking-wide">
          Jar Learn!
        </h1>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-[20]"
              onClick={() => setIsOpen(false)}
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.25 }}
              className="fixed top-0 left-0 h-full w-72 
                         bg-slate-900 border-r border-slate-800
                         shadow-2xl p-6 z-50 flex flex-col"
            >
              {/* Profile */}
              <div className="mb-8">
                <div className="text-sm text-slate-400">Logged in as</div>
                <div className="text-lg font-semibold text-slate-100">
                  Teacher
                </div>
              </div>

              {/* Links */}
              <ul className="space-y-2 flex-1">
                {links.map((link, idx) => {
                  const Icon = link.icon;
                  return (
                    <li key={idx}>
                      <Link
                        to={link.to}
                        onClick={() => {
                          link.onClick?.();
                          setIsOpen(false);
                        }}
                        className={`
                          flex items-center gap-3 p-3 rounded-xl transition
                          ${
                            link.danger
                              ? "text-rose-400 hover:bg-rose-500/10"
                              : "text-slate-200 hover:bg-slate-800 hover:text-cyan-300"
                          }
                        `}
                      >
                        <Icon size={20} />
                        {link.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}