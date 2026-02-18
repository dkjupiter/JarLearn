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
        'INSERT INTO "Students" ("Student_Number", "Student_Name" , "Class_ID") VALUES ($1, $2, $3) RETURNING  "Student_ID","Student_Number","Student_Name"',
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

  socket.on("update-player", ({ joinCode, studentId, stageName }) => {
    if (!joinCode || !studentId) return;

    const players = lobbyRooms[joinCode];
    if (!players) return;

    const player = players.find(
      (p) => String(p.studentId) === String(studentId)
    );

    if (player) {
      player.stageName = stageName;

      console.log(
        `✏️ player ${studentId} updated stageName -> ${stageName}`
      );

      socket.server.to(joinCode).emit("room-players", players);
    }
  });





  // =====================
  // LOBBY REAL-TIME
  // =====================
  // socket.on("join-room", ({ joinCode, player }) => {
  //   if (!joinCode || !player) return ;

  //   // join socket room (ใช้ joinCode ตรงๆ)
  //   socket.join(joinCode);

  //   if (!lobbyRooms[joinCode]) {
  //     lobbyRooms[joinCode] = [];
  //   }

  //   // กัน player ซ้ำ
  //   const exists = lobbyRooms[joinCode].some(
  //     (p) => p.studentId === player.studentId
  //   );

  //   const playerWithSocket = {
  //     ...player,
  //     socketId: socket.id,
  //   };

  //   if (!exists) {
  //     lobbyRooms[joinCode].push(playerWithSocket);
  //   }


  //   console.log(
  //     `👤 ${player.stageName} joined lobby ${joinCode}`
  //   );

  //   // ส่งรายชื่อทั้งหมดให้ทุกคน
  //   socket.server
  //     .to(joinCode)
  //     .emit("room-players", lobbyRooms[joinCode]);

  //   // แจ้งคนอื่นว่ามีคนเข้าใหม่
  //   socket.to(joinCode).emit("player-joined", player);
  // });

  socket.on("join-room", ({ joinCode, player }) => {
    if (!joinCode || !player) return;

    socket.join(joinCode);

    if (!lobbyRooms[joinCode]) {
      lobbyRooms[joinCode] = [];
    }

    const players = lobbyRooms[joinCode];

    const idx = players.findIndex(
      (p) => String(p.studentId) === String(player.studentId)
    );

    const playerWithSocket = {
      ...player,
      socketId: socket.id,
    };

    if (idx !== -1) {
      // update player เดิม
      players[idx] = {
        ...players[idx],
        ...playerWithSocket,
      };
    } else {
      // add ใหม่
      players.push(playerWithSocket);
    }

    console.log(`👤 ${player.stageName} joined lobby ${joinCode}`);

    socket.server.to(joinCode).emit("room-players", players);
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

    socket.join(`activity_${activitySessionId}`);

    console.log("✅ joined room:", `activity_${activitySessionId}`);
    console.log("✅ student joined activity:", studentId);

  } catch (err) {
    console.error("join_activity error:", err.message);
  }
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