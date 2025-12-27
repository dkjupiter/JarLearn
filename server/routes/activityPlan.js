// const express = require("express");
// const router = express.Router();
// const db = require("../db");

// module.exports = (io) => {
//   io.on("connection", (socket) => {
//     console.log("ActivityPlan connected:", socket.id);

//     // 🔹 ดึง Activity Plan ตาม class
//     socket.on("get_activity_plans", async (classId) => {
//       console.log("get_activity_plans:", classId);
//       try {
//         const result = await db.query(
//           `SELECT 
//             "Plan_ID",
//             "Week",
//             "Date_WeekPlan",
//             "Plan_Content",
//             "Activity_Todo"
//           FROM "ActivityPlans"
//           WHERE "Class_ID" = $1
//           ORDER BY "Date_WeekPlan"`,
//           [classId]
//         );

//         socket.emit("activity_plans_data", result.rows);
//       } catch (err) {
//         socket.emit("activity_plans_data", {
//           error: err.message,
//         });
//       }
//     });

//     // 🔹 สร้าง Activity Plan
//     socket.on("create_activity_plan", async (data) => {
//         console.log("🔥 create_activity_plan received:", data);
//       try {
//         const { classId, week, date, content, activities } = data;

//         if (!classId || !week || !date || !content) {
//           return socket.emit("create_activity_plan_result", {
//             success: false,
//             message: "Missing fields",
//           });
//         }

//         const result = await db.query(
//           `INSERT INTO "ActivityPlans"
//            ("Class_ID","Week","Date_WeekPlan","Plan_Content","Activity_Todo")
//            VALUES ($1,$2,$3,$4,$5)
//            RETURNING "Plan_ID"`,
//           [
//             classId,
//             week,
//             date,
//             content,
//             JSON.stringify(activities),
//           ]
//         );

//         socket.emit("create_activity_plan_result", {
//           success: true,
//           planId: result.rows[0].Plan_ID,
//         });
//       } catch (err) {
//         socket.emit("create_activity_plan_result", {
//           success: false,
//           message: err.message,
//         });
//       }
//     });
//   });
// };







const db = require("../db");

module.exports = (socket) => {
  console.log("ActivityPlan socket ready:", socket.id);

  socket.on("get_activity_plans", async (classId) => {
    console.log("get_activity_plans:", classId);

    try {
      const result = await db.query(
        `SELECT 
          "Plan_ID",
          "Week",
          "Date_WeekPlan",
          "Plan_Content",
          "Activity_Todo",
          "Plan_Created",
          "Plan_Updated"
        FROM "ActivityPlans"
        WHERE "Class_ID" = $1
        ORDER BY "Date_WeekPlan"`,
        [classId]
      );

      socket.emit("activity_plans_data", result.rows);
    } catch (err) {
      socket.emit("activity_plans_data", { error: err.message });
    }
  });

  socket.on("create_activity_plan", async (data) => {
    console.log("🔥 create_activity_plan received:", data);

    try {
      const { classId, week, date, content, activities } = data;

      const result = await db.query(
        `INSERT INTO "ActivityPlans"
         ("Class_ID","Week","Date_WeekPlan","Plan_Content","Activity_Todo")
         VALUES ($1,$2,$3,$4,$5)
         RETURNING "Plan_ID"`,
        [classId, week, date, content, JSON.stringify(activities)]
      );

      socket.emit("create_activity_plan_result", {
        success: true,
        planId: result.rows[0].Plan_ID,
      });
    } catch (err) {
      console.error(err);
      socket.emit("create_activity_plan_result", {
        success: false,
        message: err.message,
      });
    }
  });
};
