const pool = require("../db");

// key = joinCode, value = array of players
const lobbyRooms = {};


module.exports = (io, socket) => {
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

      // ❌ ห้องยังไม่เปิด
      if (!classRes.rows[0].is_open) {
        return socket.emit("join_result", {
          success: false,
          message: "Teacher has not started the room yet",
        });
      }
      const classId = classRes.rows[0].Class_ID;
      
      // หลังจากได้ classId แล้ว
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
      // 1️⃣ หา class จาก joinCode
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

      // 2️⃣ เช็ก student ใน class นี้
      const res = await pool.query(
        'SELECT * FROM "Students" WHERE "Student_Number"=$1 AND "Class_ID"=$2',
        [studentNumber, classId]
      );

      socket.emit("student_checked", {
        exists: res.rows.length > 0,
        student: res.rows[0],
      });
    } catch (err) {
      socket.emit("student_checked", {
        exists: false,
        error: err.message,
      });
    }
  });

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
        'INSERT INTO "Students" ("Student_Number", "Class_ID") VALUES ($1, $2) RETURNING *',
        [studentNumber, classId]
      );

      socket.emit("student_created", {
        success: true,
        student: insertRes.rows[0],
      });
    } catch (err) {
      socket.emit("student_created", {
        success: false,
        error: err.message,
      });
    }
  });

  // =====================
  // LOBBY REAL-TIME
  // =====================
  socket.on("join-room", ({ joinCode, player }) => {
    if (!joinCode || !player) return ;

    // join socket room (ใช้ joinCode ตรงๆ)
    socket.join(joinCode);

    if (!lobbyRooms[joinCode]) {
      lobbyRooms[joinCode] = [];
    }

    // กัน player ซ้ำ
    const exists = lobbyRooms[joinCode].some(
      (p) => p.id === player.id
    );

    const playerWithSocket = {
      ...player,
      socketId: socket.id,
    };

    if (!exists) {
      lobbyRooms[joinCode].push(playerWithSocket);
    }


    console.log(
      `👤 ${player.stageName} joined lobby ${joinCode}`
    );

    // ส่งรายชื่อทั้งหมดให้ทุกคน
    socket.server
      // .to(joinCode)
      // .emit("room-players", lobbyRooms[joinCode]);
      io.to(joinCode).emit("room-players", lobbyRooms[joinCode]);
      socket.to(joinCode).emit("player-joined", player);



    // แจ้งคนอื่นว่ามีคนเข้าใหม่
    socket.to(joinCode).emit("player-joined", player);
  });
  
  socket.on("disconnect", () => {
    for (const joinCode in lobbyRooms) {
      const before = lobbyRooms[joinCode].length;

      lobbyRooms[joinCode] = lobbyRooms[joinCode].filter(
        (p) => p.socketId !== socket.id
      );

      if (before !== lobbyRooms[joinCode].length) {
        socket.server
          .to(joinCode)
          .emit("room-players", lobbyRooms[joinCode]);
      }
    }

    console.log("❌ disconnected:", socket.id);
  });



};
