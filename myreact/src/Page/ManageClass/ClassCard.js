"use client";
import { useState, useEffect, useRef } from "react";
import { MoreVertical, Users } from "lucide-react";

export default function HideClass({ cls, onHide, onShow, onClick }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      ref={dropdownRef}
      onClick={() => !cls.hidden && onClick && onClick()}
      className={`
        relative flex items-center justify-between p-4 rounded-xl cursor-pointer
        border transition
        ${
          cls.hidden
            ? "bg-slate-800 border-slate-700 text-slate-500 opacity-40"
            : "bg-slate-800 border-slate-700 hover:border-cyan-400/40 hover:shadow-lg hover:shadow-cyan-400/10"
        }
      `}
    >
      {/* Left */}
      <div className="flex items-center gap-4">
        {/* Icon block */}
        <div className="w-12 h-12 rounded-lg bg-cyan-400/40 flex items-center justify-center">
          <Users className="text-cyan-300" size={22} />
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <span className="text-base font-medium text-slate-100">
            {cls.name}
          </span>

          {!cls.hidden && (
            <span className="text-sm text-slate-400">Section : {cls.section}</span>
          )}

          {cls.hidden && (
            <span className="text-xs text-rose-400">Hidden class</span>
          )}
        </div>
      </div>

      {/* Menu */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setMenuOpen(!menuOpen);
        }}
        className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition"
      >
        <MoreVertical size={18} />
      </button>

      {/* Dropdown */}
      {menuOpen && (
        <div className="absolute right-2 top-12 w-36 bg-slate-900 border border-slate-700 shadow-xl rounded-lg z-50 overflow-hidden">
          {!cls.hidden ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onHide(cls.id);
                setMenuOpen(false);
              }}
              className="block w-full text-left px-4 py-2 text-slate-200
                         hover:bg-rose-500/10 hover:text-rose-400 transition"
            >
              Hide Class
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onShow(cls.id);
                setMenuOpen(false);
              }}
              className="block w-full text-left px-4 py-2 text-slate-200
                         hover:bg-cyan-500/10 hover:text-cyan-300 transition"
            >
              Show Class
            </button>
          )}
        </div>
      )}
    </div>
  );
}