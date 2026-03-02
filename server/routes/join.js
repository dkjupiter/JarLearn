const pool = require("../db");

// 🔥 ใช้โครงสร้างใหม่
const rooms = {}; // { joinCode: { teacher, students[] } }

module.exports = (io, socket, rooms) => {
  console.log("🎓 Student connected:", socket.id);

  // =====================
  // JOIN CLASS
  // =====================
  socket.on("join_class", async ({ joinCode }) => {
    try {
      const classRes = await pool.query(
        'SELECT * FROM "ClassRooms" WHERE "Join_Code"=$1',
        [joinCode]
      );

      if (classRes.rows.length === 0) {
        return socket.emit("join_result", {
          success: false,
          message: "invalid room code",
        });
      }

      if (!classRes.rows[0].is_open) {
        return socket.emit("join_result", {
          success: false,
          message: "Teacher has not started the room yet",
        });
      }

      const classId = classRes.rows[0].Class_ID;

      const countResult = await pool.query(
        'SELECT COUNT(*) FROM "Students" WHERE "Class_ID"=$1',
        [classId]
      );

      if (parseInt(countResult.rows[0].count) >= 200) {
        return socket.emit("join_result", {
          success: false,
          message: "This room is full (200 students)",
        });
      }

      const activityRes = await pool.query(
        'SELECT * FROM "ActivitiesRooms" WHERE "Class_ID"=$1',
        [classId]
      );

      socket.join(`class_${classId}`);

      socket.emit("join_result", {
        success: true,
        classId,
        activities: activityRes.rows,
      });
    } catch (err) {
      socket.emit("join_result", {
        success: false,
        message: err.message,
      });
    }
  });

  // =====================
  // CHECK STUDENT
  // =====================
  socket.on("check_student", async ({ joinCode, studentNumber }) => {
    try {
      const classRes = await pool.query(
        'SELECT "Class_ID" FROM "ClassRooms" WHERE "Join_Code"=$1',
        [joinCode]
      );

      if (classRes.rows.length === 0) {
        return socket.emit("student_checked", {
          exists: false,
          message: "Invalid room code",
        });
      }

      const classId = classRes.rows[0].Class_ID;

      const res = await pool.query(
        'SELECT * FROM "Students" WHERE "Student_Number"=$1 AND "Class_ID"=$2',
        [studentNumber, classId]
      );

      if (res.rows.length > 0) {
        const student = res.rows[0];

        socket.emit("student_checked", {
          exists: true,
          studentId: student.Student_ID,
          studentNumber: student.Student_Number,
          stageName: student.Student_Name,
        });
      } else {
        socket.emit("student_checked", {
          exists: false,
          studentId: null,
          studentNumber,
        });
      }
    } catch (err) {
      socket.emit("student_checked", {
        exists: false,
        error: err.message,
      });
    }
  });

  // =====================
  // CREATE STUDENT
  // =====================
  socket.on("create_student", async ({ joinCode, studentNumber }) => {
    try {
      const classRes = await pool.query(
        'SELECT "Class_ID" FROM "ClassRooms" WHERE "Join_Code"=$1',
        [joinCode]
      );

      if (classRes.rows.length === 0) {
        return socket.emit("student_created", {
          success: false,
          message: "Invalid room code",
        });
      }

      const classId = classRes.rows[0].Class_ID;

      const insertRes = await pool.query(
        `INSERT INTO "Students" 
         ("Student_Number", "Student_Name", "Class_ID") 
         VALUES ($1, $2, $3)
         RETURNING "Student_ID","Student_Number","Student_Name"`,
        [studentNumber, studentNumber, classId]
      );

      const student = insertRes.rows[0];

      socket.emit("student_created", {
        success: true,
        studentId: student.Student_ID,
        studentNumber: student.Student_Number,
        stageName: student.Student_Name || student.Student_Number,
      });
    } catch (err) {
      socket.emit("student_created", {
        success: false,
        error: err.message,
      });
    }
  });

  // =====================
  // JOIN ROOM (Lobby)
  // =====================
  socket.on("join-room", ({ joinCode, player, role }) => {
    if (!joinCode) return;

    socket.join(joinCode);

    // 🔥 สร้าง room ถ้ายังไม่มี
    if (!rooms[joinCode]) {
      rooms[joinCode] = {
        teacher: null,
        students: [],
      };
    }

    const room = rooms[joinCode];

    // 👩‍🏫 Teacher join
    if (role === "teacher") {
      room.teacher = { socketId: socket.id };
      console.log("👩‍🏫 Teacher joined", joinCode);

      socket.emit("room-players", room.students);
      return;
    }

    // 👨‍🎓 Student join
    if (!player) return;

    const exists = room.students.find(
      (p) => String(p.studentId) === String(player.studentId)
    );

    if (!exists) {
      room.students.push({
        ...player,
        socketId: socket.id,
      });
    }

    console.log(`👤 ${player.stageName} joined ${joinCode}`);

    io.to(joinCode).emit("room-players", room.students);
  });

  // =====================
  // UPDATE PLAYER NAME
  // =====================
  socket.on("update-player", ({ joinCode, studentId, stageName }) => {
    if (!joinCode || !studentId) return;

    const room = rooms[joinCode];
    if (!room) return;

    const player = room.students.find(
      (p) => String(p.studentId) === String(studentId)
    );

    if (player) {
      player.stageName = stageName;
      io.to(joinCode).emit("room-players", room.students);
    }
  });

  socket.on("join_activity", async ({ activitySessionId, studentId }) => {
    try {

      if (!studentId) {
        socket.join(`activity_${activitySessionId}`);
        return;
      }

      await pool.query(
        `
      INSERT INTO public."ActivityParticipants"
    ("ActivitySession_ID", "Student_ID", "Joined_At")
  VALUES ($1, $2, NOW())
  ON CONFLICT ("ActivitySession_ID", "Student_ID")
  DO NOTHING
      `,
        [activitySessionId, studentId]
      );

      // 🔎 เช็คว่าทีมถูกสร้างแล้วหรือยัง
      const teamRes = await pool.query(`
  SELECT COUNT(*) FROM "TeamAssignments"
  WHERE "ActivitySession_ID" = $1
`, [activitySessionId]);

      if (Number(teamRes.rows[0].count) > 0) {
        await addStudentToSmallestTeam(activitySessionId, studentId);
      }


      socket.join(`activity_${activitySessionId}`);

      console.log("✅ joined room:", `activity_${activitySessionId}`);
      console.log("✅ student joined activity:", studentId);

    } catch (err) {
      console.error("join_activity error:", err.message);
    }
  });

  // =====================
  // START ACTIVITY
  // =====================
  socket.on("start_activity", (payload) => {
    const room = rooms[payload.joinCode];
    if (!room) return;

    if (room.teacher?.socketId !== socket.id) {
      console.log("❌ Not teacher");
      return;
    }

    io.to(payload.joinCode).emit("activity_started", payload);
  });

  // =====================
  // DISCONNECT
  // =====================
  socket.on("disconnect", async () => {
    for (const joinCode in rooms) {
      const room = rooms[joinCode];

      // ลบ student
      room.students = room.students.filter(
        (p) => p.socketId !== socket.id
      );

      // teacher หลุด
      if (room.teacher?.socketId === socket.id) {
        room.teacher = null;
      }

      io.to(joinCode).emit("room-players", room.students);
    }

    console.log("❌ disconnected:", socket.id);
  });
};