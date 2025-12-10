const express = require("express");
const router = express.Router();
const db = require("../db");

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected", socket.id);

    // get_classrooms
    socket.on("get_classrooms", async (teacherId) => {
      console.log("get_classrooms called with teacherId:", teacherId);
      try {
        const result = await db.query(
          'SELECT "Class_ID","Class_Name","Class_Section" FROM "ClassRooms" WHERE "Teacher_ID"=$1',
          [teacherId]
        );
        socket.emit("classrooms_data", result.rows);
      } catch (err) {
        console.error("Error in get_classrooms:", err);
        socket.emit("classrooms_data", { error: err.message });
      }
    });

    // create_class
    socket.on("create_class", async (data) => {
      console.log("create_class called with data:", data);
      try {
        const { name, section, subject, code, teacherId } = data;

        if (!name || !section || !subject || !code || !teacherId) {
          console.log("Missing fields:", data);
          return socket.emit("create_class_result", { success: false, message: "Missing required fields" });
        }

        const result = await db.query(
          `INSERT INTO "ClassRooms"("Class_Name","Class_Section","Class_Subject","Join_Code","Teacher_ID")
           VALUES($1,$2,$3,$4,$5) RETURNING "Class_ID"`,
          [name, section, subject, code, teacherId]
        );

        console.log("Class created with ID:", result.rows[0].Class_ID);
        socket.emit("create_class_result", { success: true, classId: result.rows[0].Class_ID });

      } catch (err) {
        console.error("Error in create_class:", err);
        socket.emit("create_class_result", { success: false, message: err.message });
      }
    });
  });
};
