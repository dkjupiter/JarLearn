"use client";
import React, { useState, useEffect } from "react";
import { ClipboardList, Pencil } from "lucide-react";
import { socket } from "../../socket";

export default function ManagementPage({ cls }) {
  const classId = cls?.id;

  const [showEditPopup, setShowEditPopup] = useState(false);
  const [editField, setEditField] = useState("");
  const [editValue, setEditValue] = useState("");
  const [editError, setEditError] = useState("");
  const [copied, setCopied] = useState(false);

  const [classInfo, setClassInfo] = useState({
    className: "",
    section: "",
    subject: "",
    joinCode: "",
  });

  /* ================= FETCH ================= */
  useEffect(() => {
    if (!classId) return;

    const handler = (data) => {
      if (!data) return;

      setClassInfo({
        className: data.Class_Name ?? "",
        section: data.Class_Section ?? "",
        subject: data.Class_Subject ?? "",
        joinCode: data.Join_Code ?? "",
      });
    };

    socket.on("class_detail_data", handler);
    socket.emit("get_class_detail", classId);

    return () => socket.off("class_detail_data", handler);
  }, [classId]);

  /* ================= HELPERS ================= */

  const openEdit = (field) => {
    setEditField(field);
    setEditValue(classInfo[field]);
    setShowEditPopup(true);
  };

  const copyJoinCode = () => {
    if (!classInfo.joinCode) return;
    navigator.clipboard.writeText(classInfo.joinCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* ================= UI ================= */

  return (
    <div className="px-6 pt-6 pb-32 max-w-4xl mx-auto space-y-8 text-slate-100">
      {/* ===== Title ===== */}
      <h2 className="text-3xl font-bold text-center">
        Management
      </h2>

      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 space-y-5">

        {/* ===== Editable Fields ===== */}
        {[
          { label: "Class Name", key: "className" },
          { label: "Section", key: "section" },
          { label: "Subject", key: "subject" },
        ].map(({ label, key }) => (
          <div key={key}>
            <label className="block text-sm text-slate-400 mb-1">
              {label}
            </label>

            {/* CLICKABLE BOX */}
            <div
              onClick={() => openEdit(key)}
              className="flex items-center bg-slate-900 border border-slate-700
                         rounded-xl px-4 py-3 cursor-pointer
                         hover:border-cyan-400 hover:bg-slate-800 transition"
            >
              <span className="flex-1 text-slate-300">
                {classInfo[key] || "-"}
              </span>

              <Pencil
                size={18}
                className="text-slate-400 hover:text-cyan-400 cursor-pointer transition"
                onClick={() => {
                  setEditField(key);
                  setEditValue(classInfo[key]);
                  setShowEditPopup(true);
                }}
              />
            </div>
          </div>
        ))}

        {/* ===== Join Code (Read Only) ===== */}
        <div className="pt-4 border-t border-slate-700">
          <h3 className="text-lg font-semibold mb-3">Join Code</h3>

          <div
            onClick={copyJoinCode}
            className="flex items-center bg-slate-950 border border-slate-700
                       rounded-xl px-4 py-3 cursor-pointer
                       hover:border-cyan-400 hover:bg-slate-900 transition"
          >
            <span className="flex-1 text-slate-200 tracking-widest">
              {classInfo.joinCode || "-"}
            </span>

            <ClipboardList
              size={18}
              className="text-slate-400"
            />
          </div>

          {copied && (
            <p className="text-xs text-cyan-400 mt-2">
              ✓ Copied join code
            </p>
          )}
        </div>
      </div>

      {/* ================= EDIT POPUP ================= */}
      {showEditPopup && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 w-[90%] max-w-sm rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-4">
              Edit {editField}
            </h3>

            <input
              autoFocus
              value={editValue}
              onChange={(e) => {
                setEditValue(e.target.value);
                if (e.target.value.trim()) setEditError("");
              }}
              className={`w-full bg-slate-900 border rounded-lg px-3 py-2 mb-1 outline-none
                ${editError ? "border-rose-500" : "border-slate-700"}
                focus:ring-2 focus:ring-cyan-400`}
            />

            {editError && (
              <p className="text-rose-400 text-xs mb-3">
                กรุณากรอกข้อมูล
              </p>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowEditPopup(false);
                  setEditError("");
                }}
                className="px-4 py-2 border border-slate-600 rounded-lg hover:bg-slate-700 transition"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  if (!editValue.trim()) {
                    setEditError("กรุณากรอกข้อมูล");
                    return;
                  }

                  socket.emit("update_class", {
                    classId,
                    field: editField,
                    value: editValue.trim(),
                  });

                  socket.once("update_class_result", (res) => {
                    if (res.success) {
                      setClassInfo((prev) => ({
                        ...prev,
                        [editField]: editValue.trim(),
                      }));
                      setShowEditPopup(false);
                    } else {
                      setEditError("บันทึกไม่สำเร็จ");
                    }
                  });
                }}
                className="px-4 py-2 bg-cyan-400 text-slate-900 font-semibold rounded-lg hover:bg-cyan-300 transition"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}