"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom"
import { useTeacher } from "./TeacherContext";

export default function Sidebar_account() {
  const [isOpen, setIsOpen] = useState(false);

  // กำหนด links
  const links = [
    { label: "Class", to: "/myclass" },
    { label: "Quiz", to: "/managequiz" },
    { label: "Sign out", to: "/" },
    // { label: "Avatar",  to: "/avatar"  },
  ];

  return (
    <div className="relative">
      {/* Navbar */}
      <div className="fixed top-0 left-0 w-full flex items-center justify-center p-4 bg-gray-200 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="absolute left-4"
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        <h1 className="text-lg font-bold">Jar Learn!</h1>
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed top-0 left-0 h-full w-64 bg-white shadow-lg p-6 z-50"
            >
              <ul className="space-y-6 text-lg">
                {links.map((link, idx) =>
                  link.to ? (
                    <li key={idx}>
                      <Link
                        to={link.to}
                        className="block hover:text-blue-600"
                        onClick={() => setIsOpen(false)}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ) : (
                    <li
                      key={idx}
                      className="hover:text-blue-600 cursor-pointer"
                      onClick={link.onClick}
                    >
                      {link.label}
                    </li>
                  )
                )}
              </ul>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
