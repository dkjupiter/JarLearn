"use client";
import React, { useState, useEffect, useRef } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { useTeacher } from "../TeacherContext";
import { socket } from "../../socket";
import toast from "react-hot-toast";

export default function PlanPage({ cls }) {
  const { teacherId } = useTeacher();
  const classId = cls?.id;

  const [showAddPlan, setShowAddPlan] = useState(false);
  const [errors, setErrors] = useState({});
  const [showDelete, setShowDelete] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [mode, setMode] = useState("add");
  const [editingIndex, setEditingIndex] = useState(null);

  const dateRef = useRef(null);

  const [plans, setPlans] = useState([]);
  const [quizList, setQuizList] = useState([]);

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

  const selectedQuiz = quizList.find(
    (q) => q.Set_ID === Number(activityInput.quizSelected)
  );

  const canSave =
    newPlan.week.trim() &&
    newPlan.date &&
    newPlan.content.trim();

  /* ================= FETCH ================= */

  useEffect(() => {
    if (!classId) return;
    socket.emit("get_activity_plans", classId);
  }, [classId]);

  useEffect(() => {
    const handler = (data) => {
      if (!Array.isArray(data)) return setPlans([]);

      const mapped = data.map((p) => ({
        id: p.Plan_ID,
        week: p.Week,
        date: p.Date_WeekPlan || "",
        content: p.Plan_Content,
        activities: p.Activity_Todo || [],
        createdAt: p.Plan_Created,
        updatedAt: p.Plan_Updated,
      }));
      setPlans(mapped);
    };

    socket.on("activity_plans_data", handler);
    return () => socket.off("activity_plans_data", handler);
  }, []);

  useEffect(() => {
    if (!teacherId) return;
    socket.emit("get_question_sets", teacherId);
  }, [teacherId]);

  useEffect(() => {
    const handler = (data) => {
      if (!Array.isArray(data)) return setQuizList([]);
      setQuizList(data);
    };

    socket.on("question_sets_data", handler);
    return () => socket.off("question_sets_data", handler);
  }, []);

  /* ================= HELPERS ================= */

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-");
    return `${d}/${m}/${y}`;
  };

  const formatDateTime = (ts) => {
    if (!ts) return "-";
    const d = new Date(ts);
    return d.toLocaleString();
  };

  const resetForm = () => {
    setNewPlan({ week: "", date: "", content: "" });
    setActivityInput({
      quizChecked: false,
      quizSelected: "",
      quizCustom: "",
      pollChecked: false,
      pollInput: "",
      chat: false,
    });
    setErrors({});
    setMode("add");
    setEditingIndex(null);
  };

  const openEdit = (plan, index) => {
    setMode("edit");
    setEditingIndex(index);
    setNewPlan({
      week: plan.week,
      date: plan.date,
      content: plan.content,
    });

    const quizAct = plan.activities.find((a) => a.type === "quiz");

    setActivityInput({
      quizChecked: !!quizAct,
      quizSelected: quizAct?.quizId ?? "",
      quizCustom: quizAct && !quizAct.quizId ? quizAct.title : "",
      pollChecked: plan.activities.some((a) => a.type === "poll"),
      pollInput:
        plan.activities.find((a) => a.type === "poll")?.title || "",
      chat: plan.activities.some((a) => a.type === "chat"),
    });

    setShowAddPlan(true);
  };

  /* ================= UI ================= */

  return (
    <div className="px-6 pt-6 pb-32 max-w-4xl mx-auto space-y-8 text-slate-100">
      {/* ===== Title ===== */}
      <h2 className="text-3xl font-bold text-center">
        Activity Plans
      </h2>

      {/* <div className="max-w-4xl mx-auto mt-6 px-6">
        <p className="text-center text-sm text-slate-400 mb-6">
          Plan your weekly activities for the class. You can include quizzes, polls, and interactive board sessions to engage your students.
        </p>
      </div> */}

      {/* ================= PLAN CARDS ================= */}
      <div className="space-y-4">
        {plans.map((plan, index) => (
          <div
            key={plan.id}
            className="relative bg-slate-800 border border-slate-700 rounded-2xl p-5 shadow-sm"
          >
            <div className="absolute top-4 right-4 flex gap-3">
              <Pencil
                size={18}
                className="text-slate-400 hover:text-cyan-400 cursor-pointer"
                onClick={() => openEdit(plan, index)}
              />
              <Trash2
                size={18}
                className="text-slate-400 hover:text-rose-400 cursor-pointer"
                onClick={() => {
                  setDeleteIndex(index);
                  setShowDelete(true);
                }}
              />
            </div>

            <p className="font-semibold text-lg">{plan.week}</p>
            <p className="text-sm text-slate-400">{formatDate(plan.date)}</p>

            {plan.updatedAt ? (
              <p className="text-xs text-slate-500">
                Updated: {formatDateTime(plan.updatedAt)}
              </p>
            ) : (
              <p className="text-xs text-slate-500">
                Created: {formatDateTime(plan.createdAt)}
              </p>
            )}

            <div className="grid grid-cols-2 gap-4 mt-3">
              <div className="text-sm whitespace-pre-line">
                {plan.content}
              </div>

              <div className="flex flex-wrap gap-2">
                {plan.activities.map((act, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 text-xs rounded-md bg-cyan-400/20 text-cyan-300 border border-cyan-400/30"
                  >
                    {act.type === "chat"
                      ? "Interactive Board"
                      : `${act.type}: ${act.title}`}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ================= ADD BUTTON ================= */}
      <button
        onClick={() => {
          resetForm();
          setShowAddPlan(true);
        }}
        className="fixed bottom-24 left-1/2 -translate-x-1/2 w-72 py-3 rounded-lg
                     bg-cyan-400 text-slate-900 font-semibold
                     hover:bg-cyan-300 hover:scale-[1.02]
                     shadow-lg shadow-cyan-400/30 transition"    
      >
        Add Plan
      </button>

      {/* ================= ADD / EDIT MODAL ================= */}
      {showAddPlan && (
        <div className="fixed inset-0 bg-black/60 flex justify-center">
          <div className="bg-slate-800 border border-slate-700 w-[90%] max-w-md rounded-2xl p-6 mt-10 mb-24 overflow-y-auto hide-scrollbar">
            <h3 className="text-xl font-semibold mb-4">
              {mode === "add" ? "Add Activity Plan" : "Edit Activity Plan"}
            </h3>

            {/* Week */} <div>
              <label className="block text-sm text-slate-400 mb-1"> Week </label>
              <input
                value={newPlan.week}
                onChange={(e) => setNewPlan({ ...newPlan, week: e.target.value })}
                className="w-full h-12 px-3 rounded-lg bg-slate-900 border border-slate-700 focus:ring-2 focus:ring-cyan-400 outline-none"
              />
            </div>

            {/* Date */} <div>
              <label className="block text-sm text-slate-400 mb-1"> Date </label>
              <div onClick={() => dateRef.current?.showPicker()} className="cursor-pointer input-wrapper" >
                <input
                  ref={dateRef}
                  type="date"
                  value={newPlan.date}
                  onChange={(e) => setNewPlan({ ...newPlan, date: e.target.value })}
                  className="date-input-fix mb-3 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 focus:ring-2 focus:ring-cyan-400 outline-none"
                />
              </div>
            </div>

            {/* Unit */} <div>
              <label className="block text-sm text-slate-400 mb-1"> Unit </label>
              <textarea
                rows={4}
                value={newPlan.content}
                onChange={(e) => setNewPlan({ ...newPlan, content: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 focus:ring-2 focus:ring-cyan-400 outline-none"
              />
            </div>

            {/* Activities */}
            <div className="space-y-3 text-sm mb-4">
              {/* Quiz */}
              <label className="block text-sm text-slate-400 mb-1"> Activities </label>
              <label className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-cyan-400 cursor-pointer"
                    checked={activityInput.quizChecked}
                    onChange={(e) => {
                      setActivityInput({
                        ...activityInput,
                        quizChecked: e.target.checked,
                      });

                      if (!e.target.checked) {
                        setErrors((prev) => ({
                          ...prev,
                          quiz: "",
                          quizCustom: "",
                        }));
                      }
                    }}
                  />
                  Quiz
                </div>

                {activityInput.quizChecked && (
                  <>
                    <select
                      className={`w-full px-3 py-2 rounded-lg
                                bg-slate-900 border
                                ${errors.quiz ? "border-rose-500 focus:ring-rose-400" : "border-slate-700 focus:ring-cyan-400"}
                                focus:ring-2 outline-none`}
                      value={activityInput.quizSelected}
                      onChange={(e) =>{
                        setActivityInput({
                          ...activityInput,
                          quizSelected: e.target.value,
                        });
                        setErrors((prev) => ({ ...prev, quiz: "" }));
                      }}
                    >
                      <option value="">-- Please Select a Quiz --</option>
                      {quizList.map((q) => (
                        <option key={q.Set_ID} value={q.Set_ID}>
                          {q.Title}
                        </option>
                      ))}
                      <option value="other">other</option>
                    </select>

                    {errors.quiz && (
                      <p className="text-rose-500 text-xs mt-0.5">
                        {errors.quiz}
                      </p>
                    )}

                    {activityInput.quizSelected === "other" && (
                      <>
                        <input
                          placeholder="Enter quiz name"
                          value={activityInput.quizCustom}
                          onChange={(e) => {
                            setActivityInput({
                              ...activityInput,
                              quizCustom: e.target.value,
                            });

                            setErrors((prev) => ({ ...prev, quizCustom: "" }));
                          }}
                          className={`w-full px-3 py-2 rounded-lg
                            bg-slate-900 border
                            ${errors.quizCustom ? "border-rose-500 focus:ring-rose-400" : "border-slate-700 focus:ring-cyan-400"}
                            focus:ring-2 outline-none`}
                        />

                        {errors.quizCustom && (
                          <p className="text-rose-500 text-xs mt-0.5">
                            {errors.quizCustom}
                          </p>
                        )}
                      </>
                    )}
                  </>
                )}
              </label>

              {/* Poll */}
              <div className="flex flex-col">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-cyan-400 cursor-pointer"
                    checked={activityInput.pollChecked}
                    onChange={(e) => {
                      setActivityInput({
                        ...activityInput,
                        pollChecked: e.target.checked,
                      });

                      if (!e.target.checked) {
                        setErrors((prev) => ({ ...prev, poll: "" }));
                      }
                    }}
                  />
                  Poll

                  {activityInput.pollChecked && (
                    <input
                      placeholder="Poll name"
                      value={activityInput.pollInput}
                      onChange={(e) => {
                        setActivityInput({
                          ...activityInput,
                          pollInput: e.target.value,
                        });

                        setErrors((prev) => ({ ...prev, poll: "" }));
                      }}
                      className={`flex-1 px-3 py-2 rounded-lg
                        bg-slate-900 border
                        ${errors.poll ? "border-rose-500 focus:ring-rose-400" : "border-slate-700 focus:ring-cyan-400"}
                        focus:ring-2 outline-none`}
                    />
                  )}
                </label>

                {/* ✅ error อยู่ใต้ทั้งหมด */}
                {errors.poll && (
                  <p className="text-rose-500 text-xs mt-0.5 ml-16">
                    {errors.poll}
                  </p>
                )}
              </div>

              {/* Chat */}
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-cyan-400 cursor-pointer"
                  checked={activityInput.chat}
                  onChange={(e) =>
                    setActivityInput({
                      ...activityInput,
                      chat: e.target.checked,
                    })
                  }
                />
                Interactive Board
              </label>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowAddPlan(false)}
                className="px-4 py-2 border border-slate-600 rounded-lg hover:bg-slate-700 transition"
              >
                Close
              </button>

              <button
                  disabled={!canSave}
                  onClick={() => {

                    /* ⭐ Validation เพิ่ม */
                    let newErrors = {};

                    if (activityInput.quizChecked) {
                      if (!activityInput.quizSelected) {
                        newErrors.quiz = "Please select quiz";
                      }

                      if (
                        activityInput.quizSelected === "other" &&
                        !activityInput.quizCustom.trim()
                      ) {
                        newErrors.quizCustom = "Please enter quiz name";
                      }
                    }

                    if (activityInput.pollChecked) {
                      if (!activityInput.pollInput.trim()) {
                        newErrors.poll = "Please enter poll name";
                      }
                    }

                    setErrors(newErrors);

                    if (Object.keys(newErrors).length > 0) return;
                    const activities = [];
                    if (activityInput.quizChecked) {
                    activities.push({
                      type: "quiz",
                      quizId:
                        activityInput.quizSelected === "other"
                          ? null
                          : selectedQuiz?.Set_ID,
                      title:
                        activityInput.quizSelected === "other"
                          ? activityInput.quizCustom
                          : selectedQuiz?.Title,
                    });
                  }

                  if (activityInput.pollChecked) {
                    activities.push({
                      type: "poll",
                      title: activityInput.pollInput,
                    });
                  }

                  if (activityInput.chat) {
                    activities.push({ type: "chat", title: "chat" });
                  }

                  const payload = {
                    classId,
                    week: newPlan.week,
                    date: newPlan.date,
                    content: newPlan.content,
                    activities,
                  };

                  if (mode === "add") {
                    socket.emit("create_activity_plan", payload);

                    socket.once("create_activity_plan_result", (res) => {
                      if (res.success) {
                        socket.emit("get_activity_plans", classId);
                        toast.success("Activity plan created");
                        setShowAddPlan(false);
                      } else {
                        toast.error("Failed to save activity plan");
                      }
                    });

                  } else {
                    socket.emit("update_activity_plan", {
                      ...payload,
                      planId: plans[editingIndex].id,
                    });

                    socket.once("update_activity_plan_result", (res) => {
                      if (res.success) {
                        socket.emit("get_activity_plans", classId);
                        toast.success("Activity plan updated");
                        setShowAddPlan(false);
                      } else {
                        toast.error("Failed to update activity plan");
                      }
                    });
                  }

                  setShowAddPlan(false);
                }}
                className={`px-4 py-2 rounded-lg font-semibold transition ${canSave
                  ? "bg-cyan-400 text-slate-900 hover:bg-cyan-300"
                  : "bg-slate-700 text-slate-500 cursor-not-allowed"
                  }`}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= DELETE MODAL ================= */}
      {showDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 text-slate-100  w-[90%] max-w-sm rounded-2xl p-5 ">
            <h3 className="text-lg font-semibold mb-3 text-red-600">
              Confirm Deletion
            </h3>

            <p className="text-sm mb-6">
              Are you sure you want to delete this Activity Plan?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDelete(false)}
                className="px-4 py-2 border border-slate-600 rounded-lg hover:bg-slate-700 transition"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  const planId = plans[deleteIndex]?.id;
                  if (!planId) return;
                  socket.emit("delete_activity_plan", planId);
                    socket.once("delete_activity_plan_result", (res) => {
                      if (res.success) {
                        socket.emit("get_activity_plans", classId);
                      } else {
                        alert("Delete failed");
                      }
                    });
                  setShowDelete(false);
                }}
                className="px-4 py-2 bg-rose-500 hover:bg-rose-400 text-white rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}