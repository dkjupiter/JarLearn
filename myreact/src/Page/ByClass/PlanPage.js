//mock data ทั้งหมด
// "use client";
// import React, { useState } from "react";
// import { Pencil, Trash2 } from "lucide-react";

// export default function PlanPage() {
//   // 👉 ย้าย state + helper ทั้งหมดมาไว้ตรงนี้
//     const [showAddPlan, setShowAddPlan] = useState(false);
//     const [errors, setErrors] = useState({});
//     const [showDelete, setShowDelete] = useState(false);
//     const [deleteIndex, setDeleteIndex] = useState(null);
  
//     const [mode, setMode] = useState("add"); // add | edit 
//     const [editingIndex, setEditingIndex] = useState(null);
  
//     /* ---------- Utils ---------- */
//     const formatDate = (dateStr) => {
//       if (!dateStr) return "";
//       if (dateStr.includes("/")) return dateStr;
//       const [y, m, d] = dateStr.split("-");
//       return `${d}/${m}/${y}`;
//     };
  
//     /* ---------- Data ---------- */
//     const [dummyPlans, setDummyPlans] = useState([
//       {
//         week: "Week 1",
//         date: "2025-08-22",
//         content: `บทที่ 1: Introduction
//   - ความหมายของระบบ
//   - ตัวอย่างการใช้งาน
//   - แบบฝึกหัดท้ายบท`,
//         activities: [
//           { type: "quiz", title: "quiz1" },
//           { type: "poll", title: "poll1" },
//           { type: "chat", title: "chat" },
//         ],
//       },
//     ]);
  
//     const [newPlan, setNewPlan] = useState({
//       week: "",
//       date: "",
//       content: "",
//     });
  
//     const [activityInput, setActivityInput] = useState({
//       quizChecked: false,
//       quizSelected: "",
//       quizCustom: "",
//       pollChecked: false,
//       pollInput: "",
//       chat: false,
//     });
  
//     const existingQuizzes = [
//       "Quiz: Introduction",
//       "Quiz: Basic Concept",
//       "Quiz: Midterm Review",
//     ];
  
//     const canSave =
//       newPlan.week.trim() &&
//       newPlan.date &&
//       newPlan.content.trim();
  
//     /* ---------- Helpers ---------- */
//     const openEdit = (plan, index) => {
//       setMode("edit");
//       setEditingIndex(index);
//       setErrors({});
//       setNewPlan({
//         week: plan.week,
//         date: plan.date,
//         content: plan.content,
//       });
//       setActivityInput({
//         quizChecked: plan.activities.some((a) => a.type === "quiz"),
//         quizSelected:
//           plan.activities.find((a) => a.type === "quiz")?.title || "",
//         quizCustom: "",
//         pollChecked: plan.activities.some((a) => a.type === "poll"),
//         pollInput:
//           plan.activities.find((a) => a.type === "poll")?.title || "",
//         chat: plan.activities.some((a) => a.type === "chat"),
//       });
//       setShowAddPlan(true);
//     };


//   return (
//     <div>
//         <h2 className="text-2xl font-semibold mb-4">Activity Plan</h2>
    
//         {dummyPlans.map((plan, index) => (
//             <div
//                 key={index}
//                 className="relative bg-gray-200 rounded-2xl p-4 mb-4"
//             >
//                 <div className="absolute top-4 right-4 flex gap-3">
//                     <Pencil
//                         size={20}
//                         className="cursor-pointer"
//                         onClick={() => openEdit(plan, index, "edit")}
//                     />
//                     <button
//                         onClick={() => {
//                           setDeleteIndex(index);
//                           setShowDelete(true);
//                         }}
//                         className="text-red-500"
//                     >
//                         <Trash2 size={20} />
//                     </button>
    
//                 </div>
    
//                 <div className="mb-3">
//                     <p className="font-semibold">{plan.week}</p>
//                     <p className="text-sm text-gray-600">
//                         {formatDate(plan.date)}
//                     </p>
//                 </div>
    
//                 <div className="grid grid-cols-2 pr-16">
//                     <div className="text-sm whitespace-pre-line">
//                         {plan.content}
//                     </div>
    
//                     <div className="text-sm flex flex-col pl-4">
//                         {plan.activities.map((act, i) => (
//                           <p key={i}>
//                             {act.type === "chat"
//                               ? "chat"
//                               : `${act.type}: ${act.title}`}
//                           </p>
//                         ))}
//                     </div>
//                 </div>
//             </div>
//         ))}

//         <button
//             onClick={() => {
//                 setMode("add");
//                 setEditingIndex(null);
//                 setErrors({});
//                 setNewPlan({ week: "", date: "", content: "" });
//                 setActivityInput({
//                     quizChecked: false,
//                     quizSelected: "",
//                     quizCustom: "",
//                     pollChecked: false,
//                     pollInput: "",
//                     chat: false,
//                 });
//                 setShowAddPlan(true);
//             }}
//             className="fixed bottom-28 left-1/2 -translate-x-1/2 w-72 py-3 bg-gray-600 text-white rounded-lg"
//         >
//                 Add Plan
//         </button>



//         {/* Add / Edit  Modal */}
//       {showAddPlan && (
//         <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
//           <div className="bg-white w-[90%] max-w-md rounded-2xl p-5">
//             <h3 className="text-xl font-semibold mb-3">
//               {mode === "add" && "Add Activity Plan"}
//               {mode === "edit" && "Edit Activity Plan"}
//             </h3>

//             {/* Week */}
//             <input
//               placeholder="Week"
//               value={newPlan.week}
//               onChange={(e) => {
//                 setNewPlan({ ...newPlan, week: e.target.value });
//                 setErrors((p) => ({ ...p, week: "" }));
//               }}
//               className={`w-full mb-1 border rounded-lg px-3 py-2 ${
//                 errors.week ? "border-red-500" : ""
//               }`}
//             />
//             {errors.week && (
//               <p className="text-red-500 text-xs mb-2">{errors.week}</p>
//             )}

//             {/* Date */}
//             <input
//               type="date"
//               value={newPlan.date}
//               onChange={(e) => {
//                 setNewPlan({ ...newPlan, date: e.target.value });
//                 setErrors((p) => ({ ...p, date: "" }));
//               }}
//               className={`w-full mb-1 border rounded-lg px-3 py-2 ${
//                 errors.date ? "border-red-500" : ""
//               }`}
//             />
//             {errors.date && (
//               <p className="text-red-500 text-xs mb-2">{errors.date}</p>
//             )}

//             {/* Content */}
//             <textarea
//               rows={4}
//               value={newPlan.content}
//               onChange={(e) => {
//                 setNewPlan({ ...newPlan, content: e.target.value });
//                 setErrors((p) => ({ ...p, content: "" }));
//               }}
//               className={`w-full mb-1 border rounded-lg px-3 py-2 whitespace-pre-line ${
//                 errors.content ? "border-red-500" : ""
//               }`}
//             />
//             {errors.content && (
//               <p className="text-red-500 text-xs mb-2">{errors.content}</p>
//             )}

//             {/* Activities */}
//             <div className="space-y-3 text-sm mb-4">
//               {/* Quiz */}
//               <label className="flex flex-col gap-2">
//                 <div className="flex items-center gap-2">
//                   <input
//                     type="checkbox"
//                     checked={activityInput.quizChecked}
//                     onChange={(e) => {
//                       setActivityInput({
//                         ...activityInput,
//                         quizChecked: e.target.checked,
//                         quizSelected: "",
//                         quizCustom: "",
//                       });
//                       setErrors((p) => ({ ...p, quiz: "" }));
//                     }}
//                   />
//                   Quiz
//                 </div>

//                 {activityInput.quizChecked && (
//                   <div className="pl-6 flex flex-col gap-2">
//                     <select
//                       value={activityInput.quizSelected}
//                       onChange={(e) => {
//                         setActivityInput({
//                           ...activityInput,
//                           quizSelected: e.target.value,
//                         });
//                         setErrors((p) => ({ ...p, quiz: "" }));
//                       }}
//                       className={`border rounded px-2 py-1 ${
//                         errors.quiz ? "border-red-500" : ""
//                       }`}
//                     >
//                       <option value="">-- เลือก Quiz --</option>
//                       {existingQuizzes.map((q, i) => (
//                         <option key={i} value={q}>
//                           {q}
//                         </option>
//                       ))}
//                       <option value="other">อื่นๆ</option>
//                     </select>

//                     {activityInput.quizSelected === "other" && (
//                       <input
//                         placeholder="พิมพ์ชื่อ Quiz คร่าวๆ"
//                         value={activityInput.quizCustom}
//                         onChange={(e) => {
//                           setActivityInput({
//                             ...activityInput,
//                             quizCustom: e.target.value,
//                           });
//                           if (e.target.value.trim()) {
//                             setErrors((p) => ({ ...p, quiz: "" }));
//                           }
//                         }}
//                         className={`border rounded px-2 py-1 ${
//                           errors.quiz ? "border-red-500" : ""
//                         }`}
//                       />
//                     )}
//                     {errors.quiz && (
//                       <p className="text-red-500 text-xs">{errors.quiz}</p>
//                     )}
//                   </div>
//                 )}
//               </label>

//               {/* Poll */}
//               <label className="flex items-center gap-3">
//                 <input
//                   type="checkbox"
//                   checked={activityInput.pollChecked}
//                   onChange={(e) => {
//                     setActivityInput({
//                       ...activityInput,
//                       pollChecked: e.target.checked,
//                       pollInput: "",
//                     });
//                     setErrors((p) => ({ ...p, poll: "" }));
//                   }}
//                 />

//                 <span className="w-12">Poll</span>

//                 {activityInput.pollChecked && (
//                   <input
//                     className={`border px-2 py-1 rounded w-40 ${
//                       errors.poll ? "border-red-500" : ""
//                     }`}
//                     placeholder="poll name"
//                     value={activityInput.pollInput}
//                     onChange={(e) => {
//                       setActivityInput({
//                         ...activityInput,
//                         pollInput: e.target.value,
//                       });
//                       if (e.target.value.trim()) {
//                         setErrors((p) => ({ ...p, poll: "" }));
//                       }
//                     }}
//                   />
//                 )}
//               </label>

//               {errors.poll && (
//                 <p className="text-red-500 text-xs ml-16">{errors.poll}</p>
//               )}


//               {/* Chat */}
//               <label className="flex gap-2 items-center">
//                 <input
//                   type="checkbox"
//                   checked={activityInput.chat}
//                   onChange={(e) =>
//                     setActivityInput({
//                       ...activityInput,
//                       chat: e.target.checked,
//                     })
//                   }
//                 />
//                 Chat
//               </label>
//             </div>

//             {/* Actions */}
//             <div className="flex justify-end gap-3">
//               <button
//                 onClick={() => setShowAddPlan(false)}
//                 className="px-4 py-2 border rounded-lg"
//               >
//                 Close
//               </button>

              
//               <button
//                 disabled={!canSave}
//                 onClick={() => {
//                   const newErrors = {};
//                   const activities = [];
//                   if (!newPlan.week.trim())
//                     newErrors.week = "กรุณากรอก Week";
//                   if (!newPlan.date)
//                     newErrors.date = "กรุณาเลือกวันที่";
//                   if (!newPlan.content.trim())
//                     newErrors.content = "กรุณากรอกเนื้อหา";
//                   if (activityInput.quizChecked) {
//                     const title =
//                       activityInput.quizSelected === "other"
//                         ? activityInput.quizCustom
//                         : activityInput.quizSelected;
//                     if (!title)
//                       newErrors.quiz = "กรุณาเลือกหรือกรอกชื่อ Quiz";
//                     else activities.push({ type: "quiz", title });
//                   }
//                   if (activityInput.pollChecked) {
//                     if (!activityInput.pollInput.trim())
//                       newErrors.poll = "กรุณากรอกชื่อ Poll";
//                     else
//                       activities.push({
//                         type: "poll",
//                         title: activityInput.pollInput,
//                       });
//                   }
//                   if (activityInput.chat) {
//                     activities.push({ type: "chat", title: "chat" });
//                   }
//                   if (Object.keys(newErrors).length > 0) {
//                     setErrors(newErrors);
//                     return;
//                   }
//                   if (mode === "add") {
//                     setDummyPlans([
//                       ...dummyPlans,
//                       { ...newPlan, activities },
//                     ]);
//                   }
//                   if (mode === "edit") {
//                     const updated = [...dummyPlans];
//                     updated[editingIndex] = {
//                       ...newPlan,
//                       activities,
//                     };
//                     setDummyPlans(updated);
//                   }
//                   setShowAddPlan(false);
//                   setMode("add");
//                 }}
//                 className={`px-4 py-2 rounded-lg text-white ${
//                   canSave
//                     ? "bg-gray-600"
//                     : "bg-gray-300 cursor-not-allowed"
//                 }`}
//               >
//                 Save
//               </button>
              
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ลบ plan */}
//       {showDelete && (
//         <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
//           <div className="bg-white w-[90%] max-w-sm rounded-2xl p-5">
//             <h3 className="text-lg font-semibold mb-3 text-red-600">
//               ยืนยันการลบ
//             </h3>

//             <p className="text-sm text-gray-700 mb-6">
//               คุณต้องการลบ Activity Plan นี้หรือไม่  
//               <br />
//               <span className="text-red-500">
//                 (เมื่อลบแล้วจะไม่สามารถกู้คืนได้)
//               </span>
//             </p>

//             <div className="flex justify-end gap-3">
//               <button
//                 onClick={() => {
//                   setShowDelete(false);
//                   setDeleteIndex(null);
//                 }}
//                 className="px-4 py-2 border rounded-lg"
//               >
//                 Cancel
//               </button>

//               <button
//                 onClick={() => {
//                   setDummyPlans(
//                     dummyPlans.filter((_, i) => i !== deleteIndex)
//                   );
//                   setShowDelete(false);
//                   setDeleteIndex(null);
//                 }}
//                 className="px-4 py-2 bg-red-600 text-white rounded-lg"
//               >
//                 Delete
//               </button>
//             </div>
//           </div>
//         </div>
//       )}


//     </div>
//   );
// }










// //mock quiz
// "use client";
// import React, { useState, useEffect } from "react";
// import { Pencil, Trash2 } from "lucide-react";

// import { io } from "socket.io-client";

// import { socket } from "../../socket"; // เพราะ PlanPage อยู่ใน src/Page/ByClass



// export default function PlanPage({cls}) {

//   const classId = cls?.id;

//   // 👉 ย้าย state + helper ทั้งหมดมาไว้ตรงนี้
//     const [showAddPlan, setShowAddPlan] = useState(false);
//     const [errors, setErrors] = useState({});
//     const [showDelete, setShowDelete] = useState(false);
//     const [deleteIndex, setDeleteIndex] = useState(null);
  
//     const [mode, setMode] = useState("add"); // add | edit 
//     const [editingIndex, setEditingIndex] = useState(null);
  
//     /* ---------- Utils ---------- */
//     const formatDate = (dateStr) => {
//       if (!dateStr) return "";
//       if (dateStr.includes("/")) return dateStr;
//       const [y, m, d] = dateStr.split("-");
//       return `${d}/${m}/${y}`;
//     };
  
//     const [plans, setPlans] = useState([]);
  
//     const [newPlan, setNewPlan] = useState({
//       week: "",
//       date: "",
//       content: "",
//     });
  
//     const [activityInput, setActivityInput] = useState({
//       quizChecked: false,
//       quizSelected: "",
//       quizCustom: "",
//       pollChecked: false,
//       pollInput: "",
//       chat: false,
//     });
  
//     const existingQuizzes = [
//       "Quiz: Introduction",
//       "Quiz: Basic Concept",
//       "Quiz: Midterm Review",
//     ];
  
//     const canSave =
//       newPlan.week.trim() &&
//       newPlan.date &&
//       newPlan.content.trim();
  
//     /* ---------- Helpers ---------- */
//     const openEdit = (plan, index) => {
//       setMode("edit");
//       setEditingIndex(index);
//       setErrors({});
//       setNewPlan({
//         week: plan.week,
//         date: plan.date,
//         content: plan.content,
//       });
//       setActivityInput({
//         quizChecked: plan.activities.some((a) => a.type === "quiz"),
//         quizSelected:
//           plan.activities.find((a) => a.type === "quiz")?.title || "",
//         quizCustom: "",
//         pollChecked: plan.activities.some((a) => a.type === "poll"),
//         pollInput:
//           plan.activities.find((a) => a.type === "poll")?.title || "",
//         chat: plan.activities.some((a) => a.type === "chat"),
//       });
//       setShowAddPlan(true);
//     };

//     useEffect(() => {
//           if (!classId) return;

//           console.log("📥 ขอ plans ใหม่ classId =", classId);
//           socket.emit("get_activity_plans", classId);
//         }, [classId]);


//     useEffect(() => {
//       const handler = (data) => {
//         console.log("📦 plans จาก backend:", data);

//         // 🔒 กัน error
//         if (!Array.isArray(data)) {
//           setPlans([]); // ให้เป็น array ว่าง
//           return;
//         }

//         const mapped = data.map((p) => ({
//           id: p.Plan_ID,
//           week: p.Week,
//           date: p.Date_WeekPlan?.split("T")[0],
//           content: p.Plan_Content,
//           activities: p.Activity_Todo || [],
//         }));

//         setPlans(mapped);
//       };

//       socket.on("activity_plans_data", handler);

//       return () => {
//         socket.off("activity_plans_data", handler);
//       };
//     }, []);






//   return (
//     <div>
//         <h2 className="text-2xl font-semibold mb-4">Activity Plan</h2>
    
//         {plans.map((plan, index) => (
//             <div
//                 key={index}
//                 className="relative bg-gray-200 rounded-2xl p-4 mb-4"
//             >
//                 <div className="absolute top-4 right-4 flex gap-3">
//                     <Pencil
//                         size={20}
//                         className="cursor-pointer"
//                         onClick={() => openEdit(plan, index, "edit")}
//                     />
//                     <button
//                         onClick={() => {
//                           setDeleteIndex(index);
//                           setShowDelete(true);
//                         }}
//                         className="text-red-500"
//                     >
//                         <Trash2 size={20} />
//                     </button>
    
//                 </div>
    
//                 <div className="mb-3">
//                     <p className="font-semibold">{plan.week}</p>
//                     <p className="text-sm text-gray-600">
//                         {formatDate(plan.date)}
//                     </p>
//                 </div>
    
//                 <div className="grid grid-cols-2 pr-16">
//                     <div className="text-sm whitespace-pre-line">
//                         {plan.content}
//                     </div>
    
//                     <div className="text-sm flex flex-col pl-4">
//                         {plan.activities.map((act, i) => (
//                           <p key={i}>
//                             {act.type === "chat"
//                               ? "chat"
//                               : `${act.type}: ${act.title}`}
//                           </p>
//                         ))}
//                     </div>
//                 </div>
//             </div>
//         ))}

//         <button
//             onClick={() => {
//                 setMode("add");
//                 setEditingIndex(null);
//                 setErrors({});
//                 setNewPlan({ week: "", date: "", content: "" });
//                 setActivityInput({
//                     quizChecked: false,
//                     quizSelected: "",
//                     quizCustom: "",
//                     pollChecked: false,
//                     pollInput: "",
//                     chat: false,
//                 });
//                 setShowAddPlan(true);
//             }}
//             className="fixed bottom-28 left-1/2 -translate-x-1/2 w-72 py-3 bg-gray-600 text-white rounded-lg"
//         >
//                 Add Plan
//         </button>



//         {/* Add / Edit  Modal */}
//       {showAddPlan && (
//         <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
//           <div className="bg-white w-[90%] max-w-md rounded-2xl p-5">
//             <h3 className="text-xl font-semibold mb-3">
//               {mode === "add" && "Add Activity Plan"}
//               {mode === "edit" && "Edit Activity Plan"}
//             </h3>

//             {/* Week */}
//             <input
//               placeholder="Week"
//               value={newPlan.week}
//               onChange={(e) => {
//                 setNewPlan({ ...newPlan, week: e.target.value });
//                 setErrors((p) => ({ ...p, week: "" }));
//               }}
//               className={`w-full mb-1 border rounded-lg px-3 py-2 ${
//                 errors.week ? "border-red-500" : ""
//               }`}
//             />
//             {errors.week && (
//               <p className="text-red-500 text-xs mb-2">{errors.week}</p>
//             )}

//             {/* Date */}
//             <input
//               type="date"
//               value={newPlan.date}
//               onChange={(e) => {
//                 setNewPlan({ ...newPlan, date: e.target.value });
//                 setErrors((p) => ({ ...p, date: "" }));
//               }}
//               className={`w-full mb-1 border rounded-lg px-3 py-2 ${
//                 errors.date ? "border-red-500" : ""
//               }`}
//             />
//             {errors.date && (
//               <p className="text-red-500 text-xs mb-2">{errors.date}</p>
//             )}

//             {/* Content */}
//             <textarea
//               rows={4}
//               value={newPlan.content}
//               onChange={(e) => {
//                 setNewPlan({ ...newPlan, content: e.target.value });
//                 setErrors((p) => ({ ...p, content: "" }));
//               }}
//               className={`w-full mb-1 border rounded-lg px-3 py-2 whitespace-pre-line ${
//                 errors.content ? "border-red-500" : ""
//               }`}
//             />
//             {errors.content && (
//               <p className="text-red-500 text-xs mb-2">{errors.content}</p>
//             )}

//             {/* Activities */}
//             <div className="space-y-3 text-sm mb-4">
//               {/* Quiz */}
//               <label className="flex flex-col gap-2">
//                 <div className="flex items-center gap-2">
//                   <input
//                     type="checkbox"
//                     checked={activityInput.quizChecked}
//                     onChange={(e) => {
//                       setActivityInput({
//                         ...activityInput,
//                         quizChecked: e.target.checked,
//                         quizSelected: "",
//                         quizCustom: "",
//                       });
//                       setErrors((p) => ({ ...p, quiz: "" }));
//                     }}
//                   />
//                   Quiz
//                 </div>

//                 {activityInput.quizChecked && (
//                   <div className="pl-6 flex flex-col gap-2">
//                     <select
//                       value={activityInput.quizSelected}
//                       onChange={(e) => {
//                         setActivityInput({
//                           ...activityInput,
//                           quizSelected: e.target.value,
//                         });
//                         setErrors((p) => ({ ...p, quiz: "" }));
//                       }}
//                       className={`border rounded px-2 py-1 ${
//                         errors.quiz ? "border-red-500" : ""
//                       }`}
//                     >
//                       <option value="">-- เลือก Quiz --</option>
//                       {existingQuizzes.map((q, i) => (
//                         <option key={i} value={q}>
//                           {q}
//                         </option>
//                       ))}
//                       <option value="other">อื่นๆ</option>
//                     </select>

//                     {activityInput.quizSelected === "other" && (
//                       <input
//                         placeholder="พิมพ์ชื่อ Quiz คร่าวๆ"
//                         value={activityInput.quizCustom}
//                         onChange={(e) => {
//                           setActivityInput({
//                             ...activityInput,
//                             quizCustom: e.target.value,
//                           });
//                           if (e.target.value.trim()) {
//                             setErrors((p) => ({ ...p, quiz: "" }));
//                           }
//                         }}
//                         className={`border rounded px-2 py-1 ${
//                           errors.quiz ? "border-red-500" : ""
//                         }`}
//                       />
//                     )}
//                     {errors.quiz && (
//                       <p className="text-red-500 text-xs">{errors.quiz}</p>
//                     )}
//                   </div>
//                 )}
//               </label>

//               {/* Poll */}
//               <label className="flex items-center gap-3">
//                 <input
//                   type="checkbox"
//                   checked={activityInput.pollChecked}
//                   onChange={(e) => {
//                     setActivityInput({
//                       ...activityInput,
//                       pollChecked: e.target.checked,
//                       pollInput: "",
//                     });
//                     setErrors((p) => ({ ...p, poll: "" }));
//                   }}
//                 />

//                 <span className="w-12">Poll</span>

//                 {activityInput.pollChecked && (
//                   <input
//                     className={`border px-2 py-1 rounded w-40 ${
//                       errors.poll ? "border-red-500" : ""
//                     }`}
//                     placeholder="poll name"
//                     value={activityInput.pollInput}
//                     onChange={(e) => {
//                       setActivityInput({
//                         ...activityInput,
//                         pollInput: e.target.value,
//                       });
//                       if (e.target.value.trim()) {
//                         setErrors((p) => ({ ...p, poll: "" }));
//                       }
//                     }}
//                   />
//                 )}
//               </label>

//               {errors.poll && (
//                 <p className="text-red-500 text-xs ml-16">{errors.poll}</p>
//               )}


//               {/* Chat */}
//               <label className="flex gap-2 items-center">
//                 <input
//                   type="checkbox"
//                   checked={activityInput.chat}
//                   onChange={(e) =>
//                     setActivityInput({
//                       ...activityInput,
//                       chat: e.target.checked,
//                     })
//                   }
//                 />
//                 Chat
//               </label>
//             </div>

//             {/* Actions */}
//             <div className="flex justify-end gap-3">
//               <button
//                 onClick={() => setShowAddPlan(false)}
//                 className="px-4 py-2 border rounded-lg"
//               >
//                 Close
//               </button>

              
//               <button
//                 disabled={!canSave}
//                 onClick={() => {
//                   const newErrors = {};
//                   const activities = [];
//                   if (!newPlan.week.trim())
//                     newErrors.week = "กรุณากรอก Week";
//                   if (!newPlan.date)
//                     newErrors.date = "กรุณาเลือกวันที่";
//                   if (!newPlan.content.trim())
//                     newErrors.content = "กรุณากรอกเนื้อหา";
//                   if (activityInput.quizChecked) {
//                     const title =
//                       activityInput.quizSelected === "other"
//                         ? activityInput.quizCustom
//                         : activityInput.quizSelected;
//                     if (!title)
//                       newErrors.quiz = "กรุณาเลือกหรือกรอกชื่อ Quiz";
//                     else activities.push({ type: "quiz", title });
//                   }
//                   if (activityInput.pollChecked) {
//                     if (!activityInput.pollInput.trim())
//                       newErrors.poll = "กรุณากรอกชื่อ Poll";
//                     else
//                       activities.push({
//                         type: "poll",
//                         title: activityInput.pollInput,
//                       });
//                   }
//                   if (activityInput.chat) {
//                     activities.push({ type: "chat", title: "chat" });
//                   }
//                   if (Object.keys(newErrors).length > 0) {
//                     setErrors(newErrors);
//                     return;
//                   }
//                   if (mode === "add") {
//                     if (!classId) {
//                       alert("ไม่พบ classId");
//                       return;
//                     }

//                     console.log("CREATE PLAN PAYLOAD", {
//                       classId,
//                       week: newPlan.week,
//                       date: newPlan.date,
//                       content: newPlan.content,
//                       activities,
//                     });
//                     console.log("🔥 emitting create_activity_plan", {
//                       classId,
//                       week: newPlan.week,
//                       date: newPlan.date,
//                       content: newPlan.content,
//                       activities,
//                     });

//                     socket.emit("create_activity_plan", {
//                       classId,
//                       week: newPlan.week,
//                       date: newPlan.date,
//                       content: newPlan.content,
//                       activities,
//                     });

//                     socket.once("create_activity_plan_result", (res) => {
//                       if (res.success) {
//                         setPlans((prev) => [
//                           ...prev,
//                           {
//                             id: res.planId,
//                             week: newPlan.week,
//                             date: newPlan.date,
//                             content: newPlan.content,
//                             activities,
//                           },
//                         ]);
//                         setShowAddPlan(false);
//                         setMode("add");
//                       } else {
//                         alert("บันทึกไม่สำเร็จ");
//                       }
//                     });

//                   }

//                   if (mode === "edit") {
//                     const updated = [...plans];
//                     updated[editingIndex] = {
//                       ...newPlan,
//                       activities,
//                     };
//                     setPlans(updated);
//                   }
//                   setShowAddPlan(false);
//                   setMode("add");
//                 }}
//                 className={`px-4 py-2 rounded-lg text-white ${
//                   canSave
//                     ? "bg-gray-600"
//                     : "bg-gray-300 cursor-not-allowed"
//                 }`}
//               >
//                 Save
//               </button>
              
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ลบ plan */}
//       {showDelete && (
//         <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
//           <div className="bg-white w-[90%] max-w-sm rounded-2xl p-5">
//             <h3 className="text-lg font-semibold mb-3 text-red-600">
//               ยืนยันการลบ
//             </h3>

//             <p className="text-sm text-gray-700 mb-6">
//               คุณต้องการลบ Activity Plan นี้หรือไม่  
//               <br />
//               <span className="text-red-500">
//                 (เมื่อลบแล้วจะไม่สามารถกู้คืนได้)
//               </span>
//             </p>

//             <div className="flex justify-end gap-3">
//               <button
//                 onClick={() => {
//                   setShowDelete(false);
//                   setDeleteIndex(null);
//                 }}
//                 className="px-4 py-2 border rounded-lg"
//               >
//                 Cancel
//               </button>

//               <button
//                 onClick={() => {
//                   setPlans(
//                     plans.filter((_, i) => i !== deleteIndex)
//                   );
//                   setShowDelete(false);
//                   setDeleteIndex(null);
//                 }}
//                 className="px-4 py-2 bg-red-600 text-white rounded-lg"
//               >
//                 Delete
//               </button>
//             </div>
//           </div>
//         </div>
//       )}


//     </div>
//   );
// }






















"use client";
import React, { useState, useEffect } from "react";
import { Pencil, Trash2 } from "lucide-react";

import { io } from "socket.io-client";

import { socket } from "../../socket"; // เพราะ PlanPage อยู่ใน src/Page/ByClass



export default function PlanPage({cls}) {
  const user = JSON.parse(localStorage.getItem("user"));
  const teacherId = user?.id;
  console.log("🧑 teacherId from user:", teacherId);


  const classId = cls?.id;

  // 👉 ย้าย state + helper ทั้งหมดมาไว้ตรงนี้
    const [showAddPlan, setShowAddPlan] = useState(false);
    const [errors, setErrors] = useState({});
    const [showDelete, setShowDelete] = useState(false);
    const [deleteIndex, setDeleteIndex] = useState(null);
  
    const [mode, setMode] = useState("add"); // add | edit 
    const [editingIndex, setEditingIndex] = useState(null);
  
    /* ---------- Utils ---------- */
    const formatDate = (dateStr) => {
      if (!dateStr) return "";
      if (dateStr.includes("/")) return dateStr;
      const [y, m, d] = dateStr.split("-");
      return `${d}/${m}/${y}`;
    };

    const formatDateTime = (ts) => {
      if (!ts) return "-";
      const d = new Date(ts);
      if (isNaN(d.getTime())) return "-";
      return d.toLocaleString("th-TH", {
        dateStyle: "short",
        timeStyle: "short",
      });
    };


  
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
  
    /* ---------- Helpers ---------- */
    const openEdit = (plan, index) => {
      setMode("edit");
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

    const safeDate = (value) => {
      if (!value) return null;

      const d = new Date(value);
      if (isNaN(d.getTime())) return null;

      return d.toISOString();
    };



    useEffect(() => {
          if (!classId) return;

          console.log("📥 ขอ plans ใหม่ classId =", classId);
          socket.emit("get_activity_plans", classId);
        }, [classId]);


    useEffect(() => {
      const handler = (data) => {
        console.log("📦 plans จาก backend:", data);

        // 🔒 กัน error
        if (!Array.isArray(data)) {
          setPlans([]); // ให้เป็น array ว่าง
          return;
        }

        const mapped = data.map((p) => ({
          id: p.Plan_ID,
          week: p.Week,
          date: p.Date_WeekPlan
            ? new Date(p.Date_WeekPlan).toISOString().split("T")[0]
            : "",
          content: p.Plan_Content,
          activities: p.Activity_Todo || [],
          createdAt: safeDate(p.Plan_Created),
          updatedAt: safeDate(p.Plan_Updated),
        }));


        setPlans(mapped);
      };

      socket.on("activity_plans_data", handler);

      return () => {
        socket.off("activity_plans_data", handler);
      };
    }, []);

    useEffect(() => {
      if (!teacherId) return;

      console.log("📤 ขอ quiz list teacherId =", teacherId);
      socket.emit("get_question_sets", teacherId);
    }, [teacherId]);

    useEffect(() => {
      const handler = (data) => {
        console.log("📚 quiz list:", data);

        if (!Array.isArray(data)) {
          setQuizList([]);
          return;
        }

        setQuizList(data);
      };

      socket.on("question_sets_data", handler);

      return () => {
        socket.off("question_sets_data", handler);
      };
    }, []);







  return (
    <div>
        <h2 className="text-2xl font-semibold mb-4">Activity Plan</h2>
    
        {plans.map((plan, index) => (
            <div
                key={index}
                className="relative bg-gray-200 rounded-2xl p-4 mb-4"
            >
                <div className="absolute top-4 right-4 flex gap-3">
                    <Pencil
                        size={20}
                        className="cursor-pointer"
                        onClick={() => openEdit(plan, index, "edit")}
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

                    <p className="text-xs text-gray-500">
                      สร้างเมื่อ: {formatDateTime(plan.createdAt)}
                    </p>

                    {plan.updatedAt && (
                      <p className="text-xs text-gray-400">
                        แก้ไขล่าสุด: {formatDateTime(plan.updatedAt)}
                      </p>
                    )}


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
                console.log("📤 ขอ quiz list teacherId =", teacherId);
                socket.emit("get_question_sets", teacherId);
            }}
            className="fixed bottom-28 left-1/2 -translate-x-1/2 w-72 py-3 bg-gray-600 text-white rounded-lg"
        >
                Add Plan
        </button>


  
        {/* Add / Edit  Modal */}
        {showAddPlan && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white w-[90%] max-w-md rounded-2xl p-5">
              <h3 className="text-xl font-semibold mb-3">
                {mode === "add" && "Add Activity Plan"}
                {mode === "edit" && "Edit Activity Plan"}
              </h3>

              {/* Week */}
              <input
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
                        value={activityInput.quizSelected}
                        onChange={(e) =>
                          setActivityInput({
                            ...activityInput,
                            quizSelected: e.target.value,
                          })
                        }
                      >
                        <option value="">-- เลือก Quiz --</option>

                        {quizList.map((q) => (
                          <option key={q.Set_ID} value={q.Set_ID}>
                            {q.Title}
                          </option>
                        ))}

                        <option value="other">อื่นๆ</option>
                      </select>


                      {activityInput.quizSelected === "other" && (
                        <input
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
                <label className="flex items-center gap-3">
                  <input
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

                  <span className="w-12">Poll</span>

                  {activityInput.pollChecked && (
                    <input
                      className={`border px-2 py-1 rounded w-40 ${
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
                </label>

                {errors.poll && (
                  <p className="text-red-500 text-xs ml-16">{errors.poll}</p>
                )}


                {/* Chat */}
                <label className="flex gap-2 items-center">
                  <input
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
                      else activities.push({
                            type: "quiz",
                            quizId: selectedQuiz.Set_ID,
                            title: selectedQuiz.Title,
                          });
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
                      if (!classId) {
                        alert("ไม่พบ classId");
                        return;
                      }

                      console.log("CREATE PLAN PAYLOAD", {
                        classId,
                        week: newPlan.week,
                        date: newPlan.date,
                        content: newPlan.content,
                        activities,
                      });
                      console.log("🔥 emitting create_activity_plan", {
                        classId,
                        week: newPlan.week,
                        date: newPlan.date,
                        content: newPlan.content,
                        activities,
                      });

                      socket.emit("create_activity_plan", {
                        classId,
                        week: newPlan.week,
                        date: newPlan.date,
                        content: newPlan.content,
                        activities,
                      });

                      socket.once("create_activity_plan_result", (res) => {
                        if (res.success) {
                          setPlans((prev) => [
                            ...prev,
                            {
                              id: res.planId,
                              week: newPlan.week,
                              date: newPlan.date,
                              content: newPlan.content,
                              activities,
                              createdAt: new Date().toISOString(),
                              updatedAt: null,
                            },
                          ]);
                          setShowAddPlan(false);
                          setMode("add");
                        } else {
                          alert("บันทึกไม่สำเร็จ");
                        }
                      });

                    }

                    if (mode === "edit") {
                      const updated = [...plans];
                      updated[editingIndex] = {
                        ...newPlan,
                        activities,
                      };
                      setPlans(updated);
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
                    setPlans(
                      plans.filter((_, i) => i !== deleteIndex)
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


    </div>
  );
}
