"use client";
import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import Sidebar_account from "../Sidebar_account";
import {
  MessageSquare,
  ClipboardList,
  BarChart3,
  Users,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";

export default function ClassRoom() {
  const [currentPage, setCurrentPage] = useState("plan");
  const [showAddPlan, setShowAddPlan] = useState(false);
  const [errors, setErrors] = useState({});
  const [showDelete, setShowDelete] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);

  const [mode, setMode] = useState("add"); // add | edit | view
  const [editingIndex, setEditingIndex] = useState(null);

  const location = useLocation();
  const cls = location.state?.cls;

  const isActive = (page) =>
    currentPage === page ? "text-black" : "text-gray-500";

  /* ---------- Utils ---------- */
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    if (dateStr.includes("/")) return dateStr;
    const [y, m, d] = dateStr.split("-");
    return `${d}/${m}/${y}`;
  };

  /* ---------- Data ---------- */
  const [dummyPlans, setDummyPlans] = useState([
    {
      week: "Week 1",
      date: "2025-08-22",
      content: `บทที่ 1: Introduction
- ความหมายของระบบ
- ตัวอย่างการใช้งาน
- แบบฝึกหัดท้ายบท`,
      activities: [
        { type: "quiz", title: "quiz1" },
        { type: "poll", title: "poll1" },
        { type: "chat", title: "chat" },
      ],
    },
  ]);

  const [newPlan, setNewPlan] = useState({
    week: "",
    date: "",
    content: "",
  });

  const [activityInput, setActivityInput] = useState({
    quizChecked: false,
    quizSelected: "",
    quizCustom: "",
    pollChecked: false,
    pollInput: "",
    chat: false,
  });

  const existingQuizzes = [
    "Quiz: Introduction",
    "Quiz: Basic Concept",
    "Quiz: Midterm Review",
  ];

  const canSave =
    mode !== "view" &&
    newPlan.week.trim() &&
    newPlan.date &&
    newPlan.content.trim();

  /* ---------- Helpers ---------- */
  const openViewEdit = (plan, index, openMode) => {
    setMode(openMode);
    setEditingIndex(index);
    setErrors({});
    setNewPlan({
      week: plan.week,
      date: plan.date,
      content: plan.content,
    });
    setActivityInput({
      quizChecked: plan.activities.some((a) => a.type === "quiz"),
      quizSelected:
        plan.activities.find((a) => a.type === "quiz")?.title || "",
      quizCustom: "",
      pollChecked: plan.activities.some((a) => a.type === "poll"),
      pollInput:
        plan.activities.find((a) => a.type === "poll")?.title || "",
      chat: plan.activities.some((a) => a.type === "chat"),
    });
    setShowAddPlan(true);
  };



  //management
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [editField, setEditField] = useState(""); // className | section | subject
  const [editValue, setEditValue] = useState("");

  const [classInfo, setClassInfo] = useState({
    className: "",
    section: "",
    subject: "",
  });

  const [editError, setEditError] = useState("");



  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Sidebar_account />

      <div className="flex-1 px-4 pt-20 pb-32 overflow-auto">
        {currentPage === "plan" && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Activity Plan</h2>

            {dummyPlans.map((plan, index) => (
              <div
                key={index}
                className="relative bg-gray-200 rounded-2xl p-4 mb-4"
              >
                <div className="absolute top-4 right-4 flex gap-3">
                  <Eye
                    size={20}
                    className="cursor-pointer"
                    onClick={() => openViewEdit(plan, index, "view")}
                  />
                  <Pencil
                    size={20}
                    className="cursor-pointer"
                    onClick={() => openViewEdit(plan, index, "edit")}
                  />
                  <button
                    onClick={() => {
                      setDeleteIndex(index);
                      setShowDelete(true);
                    }}
                    className="text-red-500"
                  >
                    <Trash2 size={20} />
                  </button>

                </div>

                <div className="mb-3">
                  <p className="font-semibold">{plan.week}</p>
                  <p className="text-sm text-gray-600">
                    {formatDate(plan.date)}
                  </p>
                </div>

                <div className="grid grid-cols-2 pr-16">
                  <div className="text-sm whitespace-pre-line">
                    {plan.content}
                  </div>

                  <div className="text-sm flex flex-col pl-4">
                    {plan.activities.map((act, i) => (
                      <p key={i}>
                        {act.type === "chat"
                          ? "chat"
                          : `${act.type}: ${act.title}`}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {currentPage === "log" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Activity Log</h2>

            <div className="bg-gray-100 p-4 rounded-lg mb-3">
              Student A joined room
            </div>

            <div className="bg-gray-100 p-4 rounded-lg mb-3">
              Quiz 1 started
            </div>
          </div>
          
        )}

        {currentPage === "report" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Report</h2>
            <p className="text-gray-500">No report available</p>
          </div>
        )}

        {currentPage === "management" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Management</h2>

            {/* Class name */}
            <div>
              <label className="block mb-2 text-sm font-medium">Class name</label>
              <div className="flex items-center bg-gray-200 rounded-xl px-4 py-3">
                <input
                  disabled
                  value={classInfo.className}
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
                  value={classInfo.section}
                  placeholder="Section"
                  className="bg-transparent flex-1 outline-none text-gray-600"
                />

                <Pencil
                  size={18}
                  className="text-gray-600 cursor-pointer"
                  onClick={() => {
                    setEditField("section");
                    setEditValue(classInfo.className);
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
                  value={classInfo.subject}
                  placeholder="Subject"
                  className="bg-transparent flex-1 outline-none text-gray-600"
                />

                <Pencil
                  size={18}
                  className="text-gray-600 cursor-pointer"
                  onClick={() => {
                    setEditField("subject");
                    setEditValue(classInfo.className);
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
                  placeholder="Code"
                  className="bg-transparent flex-1 outline-none text-gray-600"
                />
                <ClipboardList size={18} className="text-gray-600" />
              </div>
            </div>
          </div>
        )}

      
      </div>
      {/* Start Room Button */}
        {currentPage === "log" && (
          <button className="fixed bottom-28 w-72 py-3 mb-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition self-center">
            Start Room
          </button>
        )}

      {currentPage === "plan" && (
        <button
          onClick={() => {
            setMode("add");
            setEditingIndex(null);
            setErrors({});
            setNewPlan({ week: "", date: "", content: "" });
            setActivityInput({
              quizChecked: false,
              quizSelected: "",
              quizCustom: "",
              pollChecked: false,
              pollInput: "",
              chat: false,
            });
            setShowAddPlan(true);
          }}
          className="fixed bottom-28 w-72 py-3 bg-gray-600 text-white rounded-lg self-center"
        >
          Add Plan
        </button>
      )}

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 w-full h-[100px] bg-gray-200 flex justify-around items-center">
        <button
          onClick={() => setCurrentPage("plan")}
          className={`flex flex-col items-center ${isActive("plan")}`}
        >
          <ClipboardList size={28} />
          <span className="text-xs">Activity Plan</span>
        </button>

        <button
          onClick={() => setCurrentPage("log")}
          className={`flex flex-col items-center ${isActive("log")}`}
        >
          <MessageSquare size={28} />
          <span className="text-xs">Activity Log</span>
        </button>

        <button
          onClick={() => setCurrentPage("report")}
          className={`flex flex-col items-center ${isActive("report")}`}
        >
          <BarChart3 size={28} />
          <span className="text-xs">Report</span>
        </button>

        <button
          onClick={() => setCurrentPage("management")}
          className={`flex flex-col items-center ${isActive("management")}`}
        >
          <Users size={28} />
          <span className="text-xs">Management</span>
        </button>
      </nav>

      {/* Add / Edit / View Modal */}
      {showAddPlan && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-[90%] max-w-md rounded-2xl p-5">
            <h3 className="text-xl font-semibold mb-3">
              {mode === "add" && "Add Activity Plan"}
              {mode === "edit" && "Edit Activity Plan"}
              {mode === "view" && "View Activity Plan"}
            </h3>

            {/* Week */}
            <input
              disabled={mode === "view"}
              placeholder="Week"
              value={newPlan.week}
              onChange={(e) => {
                setNewPlan({ ...newPlan, week: e.target.value });
                setErrors((p) => ({ ...p, week: "" }));
              }}
              className={`w-full mb-1 border rounded-lg px-3 py-2 ${
                errors.week ? "border-red-500" : ""
              }`}
            />
            {errors.week && (
              <p className="text-red-500 text-xs mb-2">{errors.week}</p>
            )}

            {/* Date */}
            <input
              disabled={mode === "view"}
              type="date"
              value={newPlan.date}
              onChange={(e) => {
                setNewPlan({ ...newPlan, date: e.target.value });
                setErrors((p) => ({ ...p, date: "" }));
              }}
              className={`w-full mb-1 border rounded-lg px-3 py-2 ${
                errors.date ? "border-red-500" : ""
              }`}
            />
            {errors.date && (
              <p className="text-red-500 text-xs mb-2">{errors.date}</p>
            )}

            {/* Content */}
            <textarea
              disabled={mode === "view"}
              rows={4}
              value={newPlan.content}
              onChange={(e) => {
                setNewPlan({ ...newPlan, content: e.target.value });
                setErrors((p) => ({ ...p, content: "" }));
              }}
              className={`w-full mb-1 border rounded-lg px-3 py-2 whitespace-pre-line ${
                errors.content ? "border-red-500" : ""
              }`}
            />
            {errors.content && (
              <p className="text-red-500 text-xs mb-2">{errors.content}</p>
            )}

            {/* Activities */}
            <div className="space-y-3 text-sm mb-4">
              {/* Quiz */}
              <label className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <input
                    disabled={mode === "view"}
                    type="checkbox"
                    checked={activityInput.quizChecked}
                    onChange={(e) => {
                      setActivityInput({
                        ...activityInput,
                        quizChecked: e.target.checked,
                        quizSelected: "",
                        quizCustom: "",
                      });
                      setErrors((p) => ({ ...p, quiz: "" }));
                    }}
                  />
                  Quiz
                </div>

                {activityInput.quizChecked && (
                  <div className="pl-6 flex flex-col gap-2">
                    <select
                      disabled={mode === "view"}
                      value={activityInput.quizSelected}
                      onChange={(e) => {
                        setActivityInput({
                          ...activityInput,
                          quizSelected: e.target.value,
                        });
                        setErrors((p) => ({ ...p, quiz: "" }));
                      }}
                      className={`border rounded px-2 py-1 ${
                        errors.quiz ? "border-red-500" : ""
                      }`}
                    >
                      <option value="">-- เลือก Quiz --</option>
                      {existingQuizzes.map((q, i) => (
                        <option key={i} value={q}>
                          {q}
                        </option>
                      ))}
                      <option value="other">อื่นๆ</option>
                    </select>

                    {activityInput.quizSelected === "other" && (
                      <input
                        disabled={mode === "view"}
                        placeholder="พิมพ์ชื่อ Quiz คร่าวๆ"
                        value={activityInput.quizCustom}
                        onChange={(e) => {
                          setActivityInput({
                            ...activityInput,
                            quizCustom: e.target.value,
                          });
                          if (e.target.value.trim()) {
                            setErrors((p) => ({ ...p, quiz: "" }));
                          }
                        }}
                        className={`border rounded px-2 py-1 ${
                          errors.quiz ? "border-red-500" : ""
                        }`}
                      />
                    )}
                    {errors.quiz && (
                      <p className="text-red-500 text-xs">{errors.quiz}</p>
                    )}
                  </div>
                )}
              </label>

              {/* Poll */}
              <label className="flex gap-2 items-start">
                <input
                  disabled={mode === "view"}
                  type="checkbox"
                  checked={activityInput.pollChecked}
                  onChange={(e) => {
                    setActivityInput({
                      ...activityInput,
                      pollChecked: e.target.checked,
                      pollInput: "",
                    });
                    setErrors((p) => ({ ...p, poll: "" }));
                  }}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span>Poll</span>

                    {activityInput.pollChecked && (
                      <input
                        disabled={mode === "view"}
                        className={`ml-auto border px-2 py-1 rounded w-32 ${
                          errors.poll ? "border-red-500" : ""
                        }`}
                        placeholder="poll name"
                        value={activityInput.pollInput}
                        onChange={(e) => {
                          setActivityInput({
                            ...activityInput,
                            pollInput: e.target.value,
                          });
                          if (e.target.value.trim()) {
                            setErrors((p) => ({ ...p, poll: "" }));
                          }
                        }}
                      />
                    )}
                  </div>

                  {errors.poll && (
                    <p className="text-red-500 text-xs mt-1 ml-auto w-32">
                      {errors.poll}
                    </p>
                  )}
                </div>
              </label>

              {/* Chat */}
              <label className="flex gap-2 items-center">
                <input
                  disabled={mode === "view"}
                  type="checkbox"
                  checked={activityInput.chat}
                  onChange={(e) =>
                    setActivityInput({
                      ...activityInput,
                      chat: e.target.checked,
                    })
                  }
                />
                Chat
              </label>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowAddPlan(false)}
                className="px-4 py-2 border rounded-lg"
              >
                Close
              </button>

              {mode !== "view" && (
                <button
                  disabled={!canSave}
                  onClick={() => {
                    const newErrors = {};
                    const activities = [];

                    if (!newPlan.week.trim())
                      newErrors.week = "กรุณากรอก Week";
                    if (!newPlan.date)
                      newErrors.date = "กรุณาเลือกวันที่";
                    if (!newPlan.content.trim())
                      newErrors.content = "กรุณากรอกเนื้อหา";

                    if (activityInput.quizChecked) {
                      const title =
                        activityInput.quizSelected === "other"
                          ? activityInput.quizCustom
                          : activityInput.quizSelected;
                      if (!title)
                        newErrors.quiz = "กรุณาเลือกหรือกรอกชื่อ Quiz";
                      else activities.push({ type: "quiz", title });
                    }

                    if (activityInput.pollChecked) {
                      if (!activityInput.pollInput.trim())
                        newErrors.poll = "กรุณากรอกชื่อ Poll";
                      else
                        activities.push({
                          type: "poll",
                          title: activityInput.pollInput,
                        });
                    }

                    if (activityInput.chat) {
                      activities.push({ type: "chat", title: "chat" });
                    }

                    if (Object.keys(newErrors).length > 0) {
                      setErrors(newErrors);
                      return;
                    }

                    if (mode === "add") {
                      setDummyPlans([
                        ...dummyPlans,
                        { ...newPlan, activities },
                      ]);
                    }

                    if (mode === "edit") {
                      const updated = [...dummyPlans];
                      updated[editingIndex] = {
                        ...newPlan,
                        activities,
                      };
                      setDummyPlans(updated);
                    }

                    setShowAddPlan(false);
                    setMode("add");
                  }}
                  className={`px-4 py-2 rounded-lg text-white ${
                    canSave
                      ? "bg-gray-600"
                      : "bg-gray-300 cursor-not-allowed"
                  }`}
                >
                  Save
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ลบ plan */}
      {showDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-[90%] max-w-sm rounded-2xl p-5">
            <h3 className="text-lg font-semibold mb-3 text-red-600">
              ยืนยันการลบ
            </h3>

            <p className="text-sm text-gray-700 mb-6">
              คุณต้องการลบ Activity Plan นี้หรือไม่  
              <br />
              <span className="text-red-500">
                (เมื่อลบแล้วจะไม่สามารถกู้คืนได้)
              </span>
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDelete(false);
                  setDeleteIndex(null);
                }}
                className="px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  setDummyPlans(
                    dummyPlans.filter((_, i) => i !== deleteIndex)
                  );
                  setShowDelete(false);
                  setDeleteIndex(null);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}


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
                if (e.target.value.trim()) {
                  setEditError("");
                }
              }}
              className={`w-full border rounded-lg px-3 py-2 mb-1 ${
                editError ? "border-red-500" : ""
              }`}
              placeholder={`Enter ${editField}`}
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

                  setClassInfo((prev) => ({
                    ...prev,
                    [editField]: editValue.trim(),
                  }));

                  setShowEditPopup(false);
                  setEditError("");
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
