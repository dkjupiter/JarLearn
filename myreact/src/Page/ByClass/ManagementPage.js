"use client";
import React, { useState } from "react";
import { ClipboardList, Pencil } from "lucide-react";

import { useEffect } from "react";
import { io } from "socket.io-client";
const socket = io("http://localhost:4000"); // เปลี่ยนเป็น backend ของคุณ


export default function ManagementPage({cls}) {
  const classId = cls?.id;
  console.log("classId:", classId);



  const [showEditPopup, setShowEditPopup] = useState(false);
  const [editField, setEditField] = useState("");
  const [editValue, setEditValue] = useState("");
  const [editError, setEditError] = useState("");

  const [classInfo, setClassInfo] = useState({
    className: "",
    section: "",
    subject: "",
    joinCode: "",
  });



  useEffect(() => {
    if (!classId) return;

    const handler = (data) => {
        console.log("class_detail_data:", data);

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

    return () => {
        socket.off("class_detail_data", handler);
    };
  }, [classId]);




  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Management</h2>

      {/* Class name */}
      <div>
        <label className="block mb-2 text-sm font-medium">Class name</label>
        <div className="flex items-center bg-gray-200 rounded-xl px-4 py-3">
          <input
            disabled
            value={classInfo.className || ""}
            placeholder="Class name"
            className="bg-transparent flex-1 outline-none text-gray-600"
          />

          <Pencil
            size={18}
            className="text-gray-600 cursor-pointer"
            onClick={() => {
              setEditField("className");
              setEditValue(classInfo.className);
              setShowEditPopup(true);
            }}
          />
        </div>
      </div>

      {/* Section */}
      <div>
        <label className="block mb-2 text-sm font-medium">Section</label>
        <div className="flex items-center bg-gray-200 rounded-xl px-4 py-3">
          <input
            disabled
            value={classInfo.section || ""}
            placeholder="Class name"
            className="bg-transparent flex-1 outline-none text-gray-600"
          />

          <Pencil
            size={18}
            className="text-gray-600 cursor-pointer"
            onClick={() => {
              setEditField("section");
              setEditValue(classInfo.section);
              setShowEditPopup(true);
            }}
          />
        </div>
      </div>

      {/* Subject */}
      <div>
        <label className="block mb-2 text-sm font-medium">Subject</label>
        <div className="flex items-center bg-gray-200 rounded-xl px-4 py-3">
          <input
            disabled
            value={classInfo.subject || ""}
            placeholder="Class name"
            className="bg-transparent flex-1 outline-none text-gray-600"
          />

          <Pencil
            size={18}
            className="text-gray-600 cursor-pointer"
            onClick={() => {
              setEditField("subject");
              setEditValue(classInfo.subject);
              setShowEditPopup(true);
            }}
          />
        </div>
      </div>

      {/* Code join room */}
      <div className="pt-6">
        <h3 className="text-xl font-bold mb-3">Code join room</h3>
        <div className="flex items-center bg-gray-200 border border-gray-500 rounded-xl px-4 py-3">
          <input
            disabled
            value={classInfo.joinCode || ""}
            placeholder="Class name"
            className="bg-transparent flex-1 outline-none text-gray-600"
          />


          <ClipboardList size={18} className="text-gray-600" />
        </div>
      </div>

      {/* Edit Popup */}
      {showEditPopup && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-[90%] max-w-sm rounded-2xl p-5">
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
              className={`w-full border rounded-lg px-3 py-2 mb-1 ${
                editError ? "border-red-500" : ""
              }`}
            />

            {editError && (
              <p className="text-red-500 text-xs mb-3">
                กรุณากรอกข้อมูล
              </p>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowEditPopup(false);
                  setEditError("");
                }}
                className="px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                    if (!editValue.trim()) {
                    setEditError("กรุณากรอกข้อมูล");
                    return;
                    }

                    const payload = {
                    classId,
                    field: editField, // className | section | subject
                    value: editValue.trim(),
                    };

                    socket.emit("update_class", payload);

                    socket.once("update_class_result", (res) => {
                    if (res.success) {
                        setClassInfo((prev) => ({
                        ...prev,
                        [editField]: editValue.trim(),
                        }));
                        setShowEditPopup(false);
                        setEditError("");
                    } else {
                        setEditError("บันทึกไม่สำเร็จ");
                    }
                    });
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg"
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
