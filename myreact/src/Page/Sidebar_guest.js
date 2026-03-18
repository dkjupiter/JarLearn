"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import {
  Menu,
  X,
  BookOpen,
  FileText,
  LogIn,
  UserPlus,
  UserCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Sidebar_account() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const authLinks = [
    { label: "Sign in", to: "/teacher", icon: LogIn, primary: true },
    { label: "Register", to: "/register", icon: UserPlus },
  ];

  const guestLinks = [
    { label: "Class", to: "/myclass_guest", icon: BookOpen },
    { label: "Quiz", to: "/quiz_guest", icon: FileText },
  ];

  return (
    <div className="relative">
      {/* Navbar */}
      <div className="fixed top-0 left-0 w-full flex items-center justify-center p-4 
                      bg-slate-900/80 backdrop-blur-md border-b border-slate-800 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="absolute left-4 p-2 rounded-lg hover:bg-slate-800 transition"
        >
          {isOpen ? <X size={28} className="text-slate-200" /> : <Menu size={28} className="text-slate-200" />}
        </button>

        <h1 className="text-xl font-bold text-slate-100 tracking-wide">
          Jar Learn!
        </h1>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              className="fixed top-0 left-0 h-full w-72 
                         bg-slate-900 border-r border-slate-800
                         shadow-2xl p-6 z-50 flex flex-col"
            >
              {/* Guest Profile */}
              <div className="flex items-center gap-3 mb-8">
                <UserCircle size={40} className="text-slate-500" />
                <div>
                  <div className="text-sm text-slate-400">Browsing as</div>
                  <div className="text-lg font-semibold text-slate-100">
                    Guest
                  </div>
                </div>
              </div>

              {/* Account */}
              <div className="mb-6">
                <div className="text-xs uppercase text-slate-500 mb-2">
                  Account
                </div>
                <ul className="space-y-2">
                  {authLinks.map((link, idx) => {
                    const Icon = link.icon;
                    return (
                      <li key={idx}>
                        <Link
                          to={link.to}
                          onClick={() => setIsOpen(false)}
                          // className={`
                          //   flex items-center gap-3 p-3 rounded-xl transition
                          //   ${
                          //     link.primary
                          //       ? "bg-cyan-400 text-slate-900 font-semibold hover:bg-cyan-300"
                          //       : "text-slate-200 hover:bg-slate-800 hover:text-cyan-300"
                          //   }
                          // `}
                          className={`
                            flex items-center gap-3 p-3 rounded-xl transition
                            ${location.pathname === link.to
                              ? "bg-slate-800 text-cyan-300"
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
              </div>

              {/* Explore */}
              <div>
                <div className="text-xs uppercase text-slate-500 mb-2">
                  Explore
                </div>
                <ul className="space-y-2">
                  {guestLinks.map((link, idx) => {
                    const Icon = link.icon;
                    return (
                      <li key={idx}>
                        <Link
                          to={link.to}
                          onClick={() => setIsOpen(false)}
                          className={`
                          flex items-center gap-3 p-3 rounded-xl transition
                          ${location.pathname === link.to
                                          ? "bg-slate-800 text-cyan-300"
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
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}