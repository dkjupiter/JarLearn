// const db = require("../db");

// module.exports = (io, socket) => {
//   console.log("Assign Activity socket ready:", socket.id);

//   const activitySessions = {};

//   socket.on("create_activity_session", async ({ classId, activityType, teacherId }) => {
//     try {
//       if (!classId || !activityType || !teacherId) {
//         throw new Error("Missing required fields");
//       }

//       const result = await db.query(`
//             INSERT INTO "ActivitySessions"
//             (
//                 "Class_ID",
//                 "Activity_Type",
//                 "Assigned_By",
//                 "Status"
//             )
//             VALUES ($1, $2, $3, 'active')
//             RETURNING *
//             `, [classId, activityType, teacherId]);

//       console.log("🟥 emitting activity_session_created to:", socket.id);

//       socket.emit("activity_session_created", result.rows[0]);

//     } catch (err) {
//       console.error("❌ create_activity_session error:", err);
//       socket.emit("activity_session_created", {
//         success: false,
//         message: err.message,
//       });
//     }
//   });

//   socket.on("assign_quiz", async (payload) => {
//     const {
//       activitySessionId,
//       quizId,
//       mode,
//       studentPerTeam,
//       timerType,
//       questionTime,
//       quizTime,
//     } = payload;

//     try {
//       const result = await db.query(
//         `
//         INSERT INTO "AssignedQuiz"
//         (
//           "ActivitySession_ID",
//           "Quiz_ID",
//           "Mode",
//           "Student_Per_Team",
//           "Timer_Type",
//           "Question_Time",
//           "Quiz_Time"
//         )
//         VALUES ($1,$2,$3,$4,$5,$6,$7)
//         RETURNING *
//         `,
//         [
//           activitySessionId,
//           quizId,
//           mode,
//           studentPerTeam || null,
//           timerType,
//           questionTime || null,
//           quizTime || null,
//         ]
//       );

//       const assignedQuiz = result.rows[0];

//       let teams = null;

//       // 2️⃣ ดึงคำถาม
//       const qRes = await db.query(`
//           SELECT 
//             q."Question_ID",
//             q."Question_Text",
//             q."Question_Type",
//             o."Option_ID",
//             o."Option_Text"
//           FROM "Questions" q
//           LEFT JOIN "QuestionOptions" o
//             ON o."Question_ID" = q."Question_ID"
//           WHERE q."Set_ID" = $1
//           ORDER BY q."Question_ID", o."Option_ID"
//         `, [quizId]);

//       // 3️⃣ group questions
//       const grouped = {};
//       for (const row of qRes.rows) {
//         if (!grouped[row.Question_ID]) {
//           grouped[row.Question_ID] = {
//             Question_ID: row.Question_ID,
//             Question_Text: row.Question_Text,
//             Question_Type: row.Question_Type,
//             choices: []
//           };
//         }
//         if (row.Option_ID) {
//           grouped[row.Question_ID].choices.push({
//             Option_ID: row.Option_ID,
//             Option_Text: row.Option_Text
//           });
//         }
//       }

//       const questions = Object.values(grouped);


//       const classRes = await db.query(`
//           SELECT cr."Join_Code"
//           FROM "ActivitySessions" a
//           JOIN "ClassRooms" cr ON cr."Class_ID" = a."Class_ID"
//           WHERE a."ActivitySession_ID" = $1
//         `, [activitySessionId]);

//       if (!classRes.rows.length) {
//         throw new Error("Join code not found");
//       }

//       const joinCode = classRes.rows[0].Join_Code;

//       let timeLimit = null;

//       if (
//         assignedQuiz.Timer_Type === "question" ||
//         assignedQuiz.Timer_Type === "teacher"
//       ) {
//         timeLimit = Number(assignedQuiz.Question_Time); // วินาที
//       }

//       if (assignedQuiz.Timer_Type === "quiz") {
//         timeLimit = Number(assignedQuiz.Quiz_Time) * 60; // นาที → วินาที
//       }

//       // 4️⃣ broadcast เริ่ม quiz (🔥 จุดสำคัญ)
//       io.to(joinCode).emit("activity_started", {
//         activityType: "quiz",
//         activitySessionId,
//         quizId,
//         mode,
//         questions,
//         totalQuestions: questions.length,
//         timerType: assignedQuiz.Timer_Type,
//         timeLimit
//       });

//       socket.emit("assign_quiz_result", {
//         success: true,
//         assignedQuiz: result.rows[0],
//       });
//     } catch (err) {
//       console.error("❌ assign_quiz error:", err);
//       socket.emit("assign_quiz_result", {
//         success: false,
//         message: err.message,
//       });
//     }
//   });

//   socket.on("join_activity", ({ activitySessionId }) => {
//     socket.join(`activity_${activitySessionId}`);

//     if (!activitySessions[activitySessionId]) {
//       activitySessions[activitySessionId] = { currentIndex: 0 };
//     }
//   });

//   socket.on("next_question", ({ activitySessionId }) => {
//     if (!activitySessionId) return;

//     // 🔐 init กันพัง
//     if (!activitySessions[activitySessionId]) {
//       activitySessions[activitySessionId] = {
//         currentIndex: 0,
//       };
//       console.warn(
//         "⚠️ activitySession was not initialized, auto-init:",
//         activitySessionId
//       );
//     }

//     activitySessions[activitySessionId].currentIndex += 1;

//     const nextIndex =
//       activitySessions[activitySessionId].currentIndex;

//     io.to(`activity_${activitySessionId}`).emit("start_question", {
//       index: nextIndex,
//     });

//     console.log("🚀 start_question emitted:", nextIndex);
//   });

//   socket.on("force_submit", ({ activitySessionId }) => {
//     io.to(`activity_${activitySessionId}`).emit("force_submit");
//     console.log("🔥 force_submit emitted");
//   });

//   socket.on("end_quiz", ({ activitySessionId }) => {
//     console.log("🟥 [SERVER] end_quiz received:", activitySessionId);

//     io.to(`activity_${activitySessionId}`).emit("quiz_ended");

//     console.log("🟥 [SERVER] quiz_ended emitted");
//     io.emit("quiz_ended");
//   });

//   /* ===========================
//      ASSIGN POLL
//      =========================== */
//   socket.on("assign_poll", async (payload) => {
//     const {
//       activitySessionId,
//       pollQuestion,
//       choices,
//       allowMultiple,
//       duration,
//     } = payload;

//     try {
//       // 1️⃣ create AssignedPoll
//       const pollResult = await db.query(
//         `
//         INSERT INTO "AssignedPoll"
//         (
//           "ActivitySession_ID",
//           "Poll_Question",
//           "Allow_Multiple",
//           "Duration"
//         )
//         VALUES ($1,$2,$3,$4)
//         RETURNING *
//         `,
//         [
//           activitySessionId,
//           pollQuestion,
//           allowMultiple ?? false,
//           duration || null,
//         ]
//       );

//       const assignedPollId = pollResult.rows[0].AssignedPoll_ID;

//       // 2️⃣ create PollOptions
//       for (const option of choices) {
//         if (!option.trim()) continue;

//         await db.query(
//           `
//           INSERT INTO "PollOptions"
//           ("AssignedPoll_ID", "Option_Text")
//           VALUES ($1,$2)
//           `,
//           [assignedPollId, option]
//         );
//       }

//       socket.emit("assign_poll_result", {
//         success: true,
//         assignedPoll: pollResult.rows[0],
//       });
//     } catch (err) {
//       console.error("❌ assign_poll error:", err);
//       socket.emit("assign_poll_result", {
//         success: false,
//         message: err.message,
//       });
//     }
//   });

//   /* ===========================
//      ASSIGN INTERACTIVE BOARD
//      =========================== */
//   socket.on("assign_interactive_board", async (payload) => {
//     const {
//       activitySessionId,
//       boardName,
//       allowAnonymous,
//     } = payload;

//     try {
//       const result = await db.query(
//         `
//         INSERT INTO "AssignedInteractiveBoards"
//         (
//           "ActivitySession_ID",
//           "Board_Name",
//           "Allow_Anonymous"
//         )
//         VALUES ($1,$2,$3)
//         RETURNING *
//         `,
//         [
//           activitySessionId,
//           boardName || "Interactive Board",
//           allowAnonymous ?? false,
//         ]
//       );

//       socket.emit("assign_interactive_board_result", {
//         success: true,
//         board: result.rows[0],
//       });
//     } catch (err) {
//       console.error("❌ assign_interactive_board error:", err);
//       socket.emit("assign_interactive_board_result", {
//         success: false,
//         message: err.message,
//       });
//     }
//   });

//   socket.on("get_assigned_quiz", async ({ activitySessionId }) => {
//     try {
//       // 1️⃣ AssignedQuiz + QuestionSet
//       const assignedRes = await db.query(
//         `
//       SELECT 
//         aq.*,
//         qs."Set_ID",
//         qs."Title"
//       FROM "AssignedQuiz" aq
//       JOIN "QuestionSets" qs
//         ON qs."Set_ID" = aq."Quiz_ID"
//       WHERE aq."ActivitySession_ID" = $1
//       `,
//         [activitySessionId]
//       );

//       if (assignedRes.rows.length === 0) {
//         return socket.emit("assigned_quiz_data", {
//           success: false,
//           message: "Assigned quiz not found",
//         });
//       }

//       const assignedQuiz = assignedRes.rows[0];

//       // 2️⃣ Questions + Options + Correct
//       const questionRes = await db.query(
//         `
//       SELECT 
//         q."Question_ID",
//         q."Question_Text",
//         q."Question_Type",
//         q."Question_Image",
//         o."Option_ID",
//         o."Option_Text",

//         (
//           SELECT qco."Option_ID"
//           FROM "Question_Correct_Options" qco
//           WHERE qco."Question_ID" = q."Question_ID"
//             AND qco."Option_ID" = o."Option_ID"
//           LIMIT 1
//         ) AS "Correct_Option_ID"

//       FROM "Questions" q
//       LEFT JOIN "QuestionOptions" o
//         ON o."Question_ID" = q."Question_ID"

//       WHERE q."Set_ID" = $1

//       ORDER BY q."Question_ID", o."Option_ID"
//       `,
//         [assignedQuiz.Set_ID]
//       );

//       socket.emit("assigned_quiz_data", {
//         success: true,
//         assignedQuiz,
//         questions: questionRes.rows,
//       });
//     } catch (err) {
//       console.error("❌ get_assigned_quiz error:", err);
//       socket.emit("assigned_quiz_data", {
//         success: false,
//         message: err.message,
//       });
//     }
//   });

//   socket.on("end_quiz_session", async ({ activitySessionId }) => {
//     try {
//       await db.query(`
//       UPDATE "ActivitySessions"
//       SET
//         "Status" = 'finished',
//         "Ended_At" = NOW()
//       WHERE "ActivitySession_ID" = $1
//     `, [activitySessionId]);

//       socket.emit("end_quiz_session_result", {
//         success: true,
//         activitySessionId,
//       });
//     } catch (err) {
//       console.error("❌ end_quiz_session error:", err);
//       socket.emit("end_quiz_session_result", {
//         success: false,
//         message: err.message,
//       });
//     }
//   });

//   async function createTeams(activitySessionId, studentPerTeam) {
//     // 1️⃣ ดึงนักเรียนทั้งหมดใน session
//     const studentsRes = await db.query(`
//     SELECT 
//       ap."Student_ID",
//       s."Student_Name"
//     FROM "ActivityParticipants" ap
//     JOIN "Students" s
//       ON s."Student_ID" = ap."Student_ID"
//     WHERE ap."ActivitySession_ID" = $1
//       AND ap."Left_At" IS NULL
//   `, [activitySessionId]);

//     const students = studentsRes.rows;

//     // ❗ กันกรณีไม่มีนักเรียน
//     if (!students.length) return [];

//     // 2️⃣ shuffle
//     for (let i = students.length - 1; i > 0; i--) {
//       const j = Math.floor(Math.random() * (i + 1));
//       [students[i], students[j]] = [students[j], students[i]];
//     }

//     // 3️⃣ แบ่งทีม
//     const teams = [];
//     let teamIndex = 1;

//     for (let i = 0; i < students.length; i += studentPerTeam) {
//       const members = students.slice(i, i + studentPerTeam);

//       const teamRes = await db.query(`
//       INSERT INTO "TeamAssignments"
//       ("ActivitySession_ID", "Team_Name")
//       VALUES ($1, $2)
//       RETURNING *
//     `, [activitySessionId, `Team ${teamIndex}`]);

//       const teamId = teamRes.rows[0].Team_ID;

//       for (const m of members) {
//         await db.query(`
//         INSERT INTO "TeamMembers"
//         ("Team_ID","Student_ID")
//         VALUES ($1,$2)
//       `, [teamId, m.Student_ID]);
//       }

//       teams.push({
//         teamId,
//         teamName: `Team ${teamIndex}`,
//         members
//       });

//       teamIndex++;
//     }

//     return teams;
//   }

//   // socket.on("get_teams", async ({ activitySessionId }) => {
//   //   try {
//   //     const res = await db.query(`
//   //     SELECT
//   //       ta."Team_ID",
//   //       ta."Team_Name",
//   //       s."Student_ID",
//   //       s."Student_Name"
//   //     FROM "TeamAssignments" ta
//   //     JOIN "TeamMembers" tm
//   //       ON tm."Team_ID" = ta."Team_ID"
//   //     JOIN "Students" s
//   //       ON s."Student_ID" = tm."Student_ID"
//   //     WHERE ta."ActivitySession_ID" = $1
//   //     ORDER BY ta."Team_ID", s."Student_Name"
//   //   `, [activitySessionId]);

//   //     // group ทีม
//   //     const map = {};

//   //     for (const row of res.rows) {
//   //       if (!map[row.Team_ID]) {
//   //         map[row.Team_ID] = {
//   //           teamId: row.Team_ID,
//   //           teamName: row.Team_Name,
//   //           members: []
//   //         };
//   //       }

//   //       map[row.Team_ID].members.push({
//   //         Student_ID: row.Student_ID,
//   //         Student_Name: row.Student_Name
//   //       });
//   //     }

//   //     socket.emit("teams_data", Object.values(map));

//   //   } catch (err) {
//   //     console.error("❌ get_teams error:", err.message);
//   //     socket.emit("teams_data", []);
//   //   }
//   // });

//   socket.on("get_teams", async ({ activitySessionId, studentPerTeam }) => {
//   try {

//     // 🔎 เช็คว่ามีทีมแล้วหรือยัง
//     const existing = await db.query(`
//       SELECT COUNT(*) FROM "TeamAssignments"
//       WHERE "ActivitySession_ID" = $1
//     `, [activitySessionId]);

//     let teams;

//     // ❗ ถ้ายังไม่มีทีม → สร้างทีมตอนนี้
//     if (Number(existing.rows[0].count) === 0) {
//       console.log("🔥 creating teams (on demand)");

//       teams = await createTeams(activitySessionId, studentPerTeam);
//     }

//     // 🔎 ดึงทีมจาก DB
//     const res = await db.query(`
//       SELECT
//         ta."Team_ID",
//         ta."Team_Name",
//         s."Student_ID",
//         s."Student_Name"
//       FROM "TeamAssignments" ta
//       JOIN "TeamMembers" tm
//         ON tm."Team_ID" = ta."Team_ID"
//       JOIN "Students" s
//         ON s."Student_ID" = tm."Student_ID"
//       WHERE ta."ActivitySession_ID" = $1
//       ORDER BY ta."Team_ID", s."Student_Name"
//     `, [activitySessionId]);

//     // group ทีม
//     const map = {};

//     for (const row of res.rows) {
//       if (!map[row.Team_ID]) {
//         map[row.Team_ID] = {
//           teamId: row.Team_ID,
//           teamName: row.Team_Name,
//           members: []
//         };
//       }

//       map[row.Team_ID].members.push({
//         Student_ID: row.Student_ID,
//         Student_Name: row.Student_Name
//       });
//     }

//     socket.emit("teams_data", Object.values(map));

//   } catch (err) {
//     console.error("❌ get_teams error:", err.message);
//     socket.emit("teams_data", []);
//   }
// });


//   socket.on("preview_teams", async ({ activitySessionId, studentPerTeam }) => {
//     try {
//       const res = await db.query(`
//       SELECT ap."Student_ID", s."Student_Name"
//       FROM "ActivityParticipants" ap
//       JOIN "Students" s
//         ON s."Student_ID" = ap."Student_ID"
//       WHERE ap."ActivitySession_ID" = $1
//         AND ap."Left_At" IS NULL
//     `, [activitySessionId]);

//       const students = res.rows;

//       // 🔀 shuffle
//       for (let i = students.length - 1; i > 0; i--) {
//         const j = Math.floor(Math.random() * (i + 1));
//         [students[i], students[j]] = [students[j], students[i]];
//       }

//       // 👥 แบ่งทีม (preview)
//       const teams = [];
//       let teamIndex = 1;

//       for (let i = 0; i < students.length; i += studentPerTeam) {
//         teams.push({
//           teamId: teamIndex,
//           teamName: `Team ${teamIndex}`,
//           members: students.slice(i, i + studentPerTeam)
//         });
//         teamIndex++;
//       }

//       // socket.emit("preview_teams_data", teams);
//       io.to(`activity_${activitySessionId}`).emit("preview_teams_data", teams); // server emit เมื่อมีคน join

//     } catch (err) {
//       console.error("❌ preview_teams error:", err.message);
//       socket.emit("preview_teams_data", []);
//     }
//   });

// socket.on("start_quiz_with_teams", async ({
//   activitySessionId,
//   studentPerTeam
// }) => {
//   try {
//     const teams = await createTeams(activitySessionId, studentPerTeam);
//     const room = `activity_${activitySessionId}`;

//     // ส่งทีม
//     io.to(room).emit("teams_created", teams);

//     // 🔥 เริ่มข้อแรกทันที
//     if (!activitySessions[activitySessionId]) {
//       activitySessions[activitySessionId] = { currentIndex: 0 };
//     } else {
//       activitySessions[activitySessionId].currentIndex = 0;
//     }

//     io.to(room).emit("start_question", { index: 0 });

//     console.log("🚀 first question emitted");

//   } catch (err) {
//     console.error(err);
//   }
// });

//   async function addStudentToSmallestTeam(activitySessionId, studentId) {
//   // หา team ที่คนน้อยสุด
//   const teamRes = await db.query(`
//     SELECT ta."Team_ID"
//     FROM "TeamAssignments" ta
//     LEFT JOIN "TeamMembers" tm
//       ON tm."Team_ID" = ta."Team_ID"
//     WHERE ta."ActivitySession_ID" = $1
//     GROUP BY ta."Team_ID"
//     ORDER BY COUNT(tm."Student_ID") ASC
//     LIMIT 1
//   `, [activitySessionId]);

//   if (!teamRes.rows.length) return;

//   const teamId = teamRes.rows[0].Team_ID;

//   await db.query(`
//     INSERT INTO "TeamMembers" ("Team_ID","Student_ID")
//     VALUES ($1,$2)
//     ON CONFLICT DO NOTHING
//   `, [teamId, studentId]);

//   console.log(`➕ student ${studentId} added to team ${teamId}`);
// }

// }

const db = require("../db");

module.exports = (io, socket) => {
  console.log("Assign Activity socket ready:", socket.id);

  const activitySessions = {};

  // =====================
  // CREATE SESSION
  // =====================
  socket.on("create_activity_session", async ({ classId, activityType, teacherId }) => {
    try {
      const result = await db.query(`
        INSERT INTO "ActivitySessions"
        ("Class_ID","Activity_Type","Assigned_By","Status")
        VALUES ($1,$2,$3,'active')
        RETURNING *
      `, [classId, activityType, teacherId]);

      socket.emit("activity_session_created", result.rows[0]);
    } catch (err) {
      socket.emit("activity_session_created", { success:false, message: err.message });
    }
  });

  // =====================
  // ASSIGN QUIZ
  // =====================
  socket.on("assign_quiz", async (payload) => {
    const { activitySessionId, quizId, mode, studentPerTeam, timerType, questionTime, quizTime } = payload;

    try {
      const result = await db.query(`
        INSERT INTO "AssignedQuiz"
        ("ActivitySession_ID","Quiz_ID","Mode","Student_Per_Team","Timer_Type","Question_Time","Quiz_Time")
        VALUES ($1,$2,$3,$4,$5,$6,$7)
        RETURNING *
      `, [activitySessionId, quizId, mode, studentPerTeam || null, timerType, questionTime || null, quizTime || null]);

      const assignedQuiz = result.rows[0];

      // 🔥 load questions
      const qRes = await db.query(`
        SELECT q."Question_ID", q."Question_Text", q."Question_Type", o."Option_ID", o."Option_Text"
        FROM "Questions" q
        LEFT JOIN "QuestionOptions" o ON o."Question_ID"=q."Question_ID"
        WHERE q."Set_ID"=$1
        ORDER BY q."Question_ID", o."Option_ID"
      `, [quizId]);

      const grouped = {};
      for (const r of qRes.rows) {
        if (!grouped[r.Question_ID]) {
          grouped[r.Question_ID] = {
            Question_ID: r.Question_ID,
            Question_Text: r.Question_Text,
            Question_Type: r.Question_Type,
            choices: []
          };
        }
        if (r.Option_ID) grouped[r.Question_ID].choices.push(r);
      }

      const questions = Object.values(grouped);

      const classRes = await db.query(`
        SELECT cr."Join_Code"
        FROM "ActivitySessions" a
        JOIN "ClassRooms" cr ON cr."Class_ID"=a."Class_ID"
        WHERE a."ActivitySession_ID"=$1
      `, [activitySessionId]);

      const joinCode = classRes.rows[0].Join_Code;

      io.to(joinCode).emit("activity_started", {
        activityType:"quiz",
        activitySessionId,
        quizId,
        questions,
        totalQuestions: questions.length,
        timerType,
        timeLimit: timerType==="quiz" ? quizTime*60 : questionTime,
        quizStartTime: Date.now(),
        serverTime: Date.now()
      });

      socket.emit("assign_quiz_result", { success:true });

    } catch (err) {
      socket.emit("assign_quiz_result", { success:false, message: err.message });
    }
  });

  // =====================
  // TEAM SYSTEM
  // =====================
  async function addStudentToSmallestTeam(activitySessionId, studentId) {
    const teamRes = await db.query(`
      SELECT ta."Team_ID"
      FROM "TeamAssignments" ta
      LEFT JOIN "TeamMembers" tm ON tm."Team_ID"=ta."Team_ID"
      WHERE ta."ActivitySession_ID"=$1
      GROUP BY ta."Team_ID"
      ORDER BY COUNT(tm."Student_ID") ASC
      LIMIT 1
    `, [activitySessionId]);

    if (!teamRes.rows.length) return;

    await db.query(`
      INSERT INTO "TeamMembers" ("Team_ID","Student_ID")
      VALUES ($1,$2)
      ON CONFLICT DO NOTHING
    `, [teamRes.rows[0].Team_ID, studentId]);
  }

};