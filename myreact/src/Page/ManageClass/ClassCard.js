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
      className={`relative flex flex-col justify-between p-6 rounded-xl transition cursor-pointer ${
        cls.hidden ? "bg-gray-200 text-gray-500" : "bg-gray-300 hover:bg-gray-400"
      }`}
      ref={dropdownRef}
      onClick={() => !cls.hidden && onClick && onClick()} // คลิก div ทั้งตัว
    >
      <div className="flex justify-between items-center">
        <span className="text-base">{cls.name}</span>

        <button
          onClick={(e) => {
            e.stopPropagation(); // ป้องกัน click หล่นไป div ด้านนอก
            setMenuOpen(!menuOpen);
          }}
          className="p-1 rounded-full hover:bg-gray-200"
        >
          <MoreVertical />
        </button>
      </div>

      {!cls.hidden && <span className="text-sm text-gray-600 mt-1">{cls.section}</span>}

      {menuOpen && (
        <div className="absolute right-2 top-12 w-32 bg-white shadow-lg rounded-md border z-50">
          {!cls.hidden && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onHide(cls.id);
                setMenuOpen(false);
              }}
              className="block w-full text-left px-4 py-2 hover:bg-gray-100"
            >
              Hide Class
            </button>
          )}
          {cls.hidden && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onShow(cls.id);
                setMenuOpen(false);
              }}
              className="block w-full text-left px-4 py-2 hover:bg-gray-100"
            >
              Show Class
            </button>
          )}
        </div>
      )}
    </div>
  );
}
