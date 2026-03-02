"use client";
import { useState, useEffect, useRef } from "react";
import { MoreVertical } from "lucide-react";

export default function HideClass({ cls, onHide, onShow, onClick }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      className={`relative flex flex-col justify-between p-5 rounded-xl transition cursor-pointer border
        ${
          cls.hidden
            ? "bg-slate-800 border-slate-700 text-slate-500"
            : "bg-slate-800 border-slate-700 hover:border-cyan-400/40 hover:bg-slate-800"
        }`}
      ref={dropdownRef}
      onClick={() => !cls.hidden && onClick && onClick()}
    >
      {/* Top */}
      <div className="flex justify-between items-center">
        <span className="text-base font-medium">{cls.name}</span>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen(!menuOpen);
          }}
          className="p-1 rounded-full hover:bg-slate-700 transition"
        >
          <MoreVertical size={18} />
        </button>
      </div>

      {/* Section */}
      {!cls.hidden && (
        <span className="text-sm text-slate-400 mt-1">{cls.section}</span>
      )}

      {/* Hidden label */}
      {cls.hidden && (
        <span className="text-xs text-rose-400 mt-1">Hidden</span>
      )}

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
              className="block w-full text-left px-4 py-2 text-slate-200 hover:bg-rose-500/10 hover:text-rose-400 transition"
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
              className="block w-full text-left px-4 py-2 text-slate-200 hover:bg-cyan-500/10 hover:text-cyan-300 transition"
            >
              Show Class
            </button>
          )}
        </div>
      )}
    </div>
  );
}