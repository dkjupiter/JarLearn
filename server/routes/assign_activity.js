// const db = require("../db");

// module.exports = (io, socket) => {
//   console.log("Assign Activity socket ready:", socket.id);

//   const activitySessions = {};

//   // =====================
//   // CREATE SESSION
//   // =====================
//   socket.on("create_activity_session", async ({ classId, activityType, teacherId }) => {
//     try {
//       if (!classId || !activityType || !teacherId) {
//         throw new Error("Missing required fields");
//       }

//       const result = await db.query(`
//         INSERT INTO "ActivitySessions"
//         ("Class_ID","Activity_Type","Assigned_By","Status")
//         VALUES ($1,$2,$3,'active')
//         RETURNING *
//       `, [classId, activityType, teacherId]);

//       socket.emit("activity_session_created", result.rows[0]);
//     } catch (err) {
//       socket.emit("activity_session_created", { success:false, message: err.message });
//     }
//   });

//   // =====================
//   // ASSIGN QUIZ
//   // =====================
//   socket.on("assign_quiz", async (payload) => {
//     const { activitySessionId, quizId, mode, studentPerTeam, timerType, questionTime, quizTime } = payload;

//     try {
//       const result = await db.query(`
//         INSERT INTO "AssignedQuiz"
//         ("ActivitySession_ID","Quiz_ID","Mode","Student_Per_Team","Timer_Type","Question_Time","Quiz_Time")
//         VALUES ($1,$2,$3,$4,$5,$6,$7)
//         RETURNING *
//       `, [activitySessionId, quizId, mode, studentPerTeam || null, timerType, questionTime || null, quizTime || null]);

//       const assignedQuiz = result.rows[0];

//       let teams = null;

//       // 🔥 load questions
//       const qRes = await db.query(`
//         SELECT q."Question_ID", q."Question_Text", q."Question_Type",q."Question_Image", o."Option_ID", o."Option_Text"
//         FROM "Questions" q
//         LEFT JOIN "QuestionOptions" o ON o."Question_ID"=q."Question_ID"
//         WHERE q."Set_ID"=$1
//         ORDER BY q."Question_ID", o."Option_ID"
//       `, [quizId]);

//       const grouped = {};
//       for (const r of qRes.rows) {
//         if (!grouped[r.Question_ID]) {
//           grouped[r.Question_ID] = {
//             Question_ID: r.Question_ID,
//             Question_Text: r.Question_Text,
//             Question_Type: r.Question_Type,
//             Question_Image: r.Question_Image, 
//             choices: []
//           };
//         }
//         if (r.Option_ID) grouped[r.Question_ID].choices.push({
//             Option_ID: r.Option_ID,
//             Option_Text: r.Option_Text
//           });;
//       }

//       const questions = Object.values(grouped);

//       const classRes = await db.query(`
//         SELECT cr."Join_Code"
//         FROM "ActivitySessions" a
//         JOIN "ClassRooms" cr ON cr."Class_ID"=a."Class_ID"
//         WHERE a."ActivitySession_ID"=$1
//       `, [activitySessionId]);

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

//       io.to(joinCode).emit("activity_started", {
//         activityType:"quiz",
//         activitySessionId,
//         quizId,
//         mode,
//         questions,
//         totalQuestions: questions.length,
//         timerType: assignedQuiz.Timer_Type,
//         timeLimit,
//         quizStartTime: Date.now(),
//         serverTime: Date.now()
//       });

//       socket.emit("assign_quiz_result", { 
//         success:true, assignedQuiz: result.rows[0], 
//       });

//     } catch (err) {
//       socket.emit("assign_quiz_result", { success:false, message: err.message });
//     }
//   });

//   socket.on("join_activity", ({ activitySessionId }) => {
//     socket.join(`activity_${activitySessionId}`);

//     if (!activitySessions[activitySessionId]) {
//       activitySessions[activitySessionId] = { currentIndex: 0 };
//     }

//     socket.emit("joined_activity"); 
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
//     io.to(`activity_${activitySessionId}`).emit("force_submit", { activitySessionId });
//     console.log("🔥 force_submit emitted");
//   });

//   socket.on("end_quiz", async ({ activitySessionId }) => {

//     console.log("🟥 [SERVER] end_quiz received:", activitySessionId);

//     const res = await db.query(`
//       SELECT "Mode", "Timer_Type"
//       FROM "AssignedQuiz"
//       WHERE "ActivitySession_ID" = $1
//     `, [activitySessionId]);

//     const mode = res.rows[0]?.Mode || "individual";
//     const timerType = res.rows[0]?.Timer_Type || "none";

//     io.to(`activity_${activitySessionId}`).emit("quiz_ended", { mode });

//     console.log("🟥 [SERVER] quiz_ended emitted");

//   });

//   socket.on("finish_game", async ({ activitySessionId }) => {

//     const res = await db.query(`
//       SELECT "Mode"
//       FROM "AssignedQuiz"
//       WHERE "ActivitySession_ID" = $1
//     `,[activitySessionId]);

//     const mode = res.rows[0]?.Mode;

//     if (mode === "team") {
//       io.to(`activity_${activitySessionId}`)
//         .emit("show_final_team_ranking");
//     } else {
    
//     io.to(`activity_${activitySessionId}`)
//       .emit("show_final_ranking");

//     }

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

//         await db.query(
//           `
//           INSERT INTO "PollOptions"
//           ("AssignedPoll_ID", "Option_Text")
//           VALUES ($1,$2)
//           `,
//           [assignedPollId, option]
//         );
//       }

//        // load options
//       const options = await db.query(`
//         SELECT *
//         FROM "PollOptions"
//         WHERE "AssignedPoll_ID"=$1
//         ORDER BY "PollOption_ID"
//         `, [assignedPollId])

//       // broadcast poll start
//       io.to(`activity_${activitySessionId}`).emit("poll_started", {

//         pollId: assignedPollId,
//         question: pollQuestion,
//         options: options.rows

//       })

//       // 🔥 บอก student ว่า poll เริ่มแล้ว

//       const classRes = await db.query(`
//         SELECT cr."Join_Code"
//         FROM "ActivitySessions" a
//         JOIN "ClassRooms" cr
//         ON cr."Class_ID" = a."Class_ID"
//         WHERE a."ActivitySession_ID"=$1
//         `, [activitySessionId])

//       const joinCode = classRes.rows[0].Join_Code

//       io.to(joinCode).emit("activity_started", {
//         activityType: "poll",
//         activitySessionId
//       })

//       socket.emit("assign_poll_result", {
//         success: true
//       });

//     } catch (err) {

//       console.error("❌ assign_poll error:", err);
//     }
//   });

//   /* ===========================
//      ASSIGN INTERACTIVE BOARD
//      =========================== */
//    socket.on("assign_interactive_board", async (payload) => {

//     const {
//       activitySessionId,
//       boardName,
//       allowAnonymous
//     } = payload;

//     try {

//       const result = await db.query(`
//       INSERT INTO "AssignedInteractiveBoards"
//       (
//         "ActivitySession_ID",
//         "Board_Name",
//         "Allow_Anonymous"
//       )
//       VALUES ($1,$2,$3)
//       RETURNING *
//     `, [
//         activitySessionId,
//         boardName || "Interactive Board",
//         allowAnonymous ?? false
//       ]);

//       /* 🔥 หา joinCode */

//       const classRes = await db.query(`
//       SELECT cr."Join_Code"
//       FROM "ActivitySessions" a
//       JOIN "ClassRooms" cr
//       ON cr."Class_ID" = a."Class_ID"
//       WHERE a."ActivitySession_ID"=$1
//     `, [activitySessionId])

//       const joinCode = classRes.rows[0].Join_Code

//       /* 🔥 broadcast ให้ student */

//       io.to(joinCode).emit("activity_started", {
//         activityType: "chat",
//         activitySessionId
//       })

//       socket.emit("assign_interactive_board_result", {
//         success: true,
//         board: result.rows[0]
//       })

//     } catch (err) {

//       console.error("assign_interactive_board error:", err)

//     }

//   })

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

//   // socket.on("end_quiz_session", async ({ activitySessionId }) => {
//   //   try {

//   //     /* 1️⃣ update activity และดึง Ended_At */
//   //     const result = await db.query(`
//   //       UPDATE "ActivitySessions"
//   //       SET
//   //         "Status" = 'finished',
//   //         "Ended_At" = NOW()
//   //       WHERE "ActivitySession_ID" = $1
//   //       RETURNING "Ended_At"
//   //     `, [activitySessionId]);

//   //     const endedAt = result.rows[0].Ended_At;

//   //     /* 2️⃣ update participants */
//   //     const res = await db.query(`
//   //       UPDATE "ActivityParticipants"
//   //       SET "Left_At"=$1
//   //       WHERE "ActivitySession_ID"=$2
//   //       AND "Left_At" IS NULL
//   //       RETURNING *
//   //     `, [endedAt, activitySessionId]);

//   //     console.log("participants updated:", res.rowCount);
//   //     console.log(res.rows);
//   //     socket.emit("end_quiz_session_result", {
//   //       success: true,
//   //       activitySessionId,
//   //     });

//   //   } catch (err) {

//   //     console.error("❌ end_quiz_session error:", err);

//   //     socket.emit("end_quiz_session_result", {
//   //       success: false,
//   //       message: err.message,
//   //     });

//   //   }
//   // });


//   async function createTeams(activitySessionId, studentPerTeam) {
//     // 1️⃣ ดึงนักเรียนทั้งหมดใน session
//     const studentsRes = await db.query(`
//     SELECT
//       ap."Student_ID",
//       s."Student_Name",
//       b."Body_Image",
//       c."Costume_Image",
//       m."Mask_Image",
//       a."Accessory_Image"

//     FROM "ActivityParticipants" ap

//     JOIN "Students" s
//       ON s."Student_ID" = ap."Student_ID"

//     LEFT JOIN "Avatars" av
//       ON s."Avatar_ID" = av."Avatar_ID"

//     LEFT JOIN "AvatarBodies" b
//       ON av."Body_ID" = b."Body_ID"

//     LEFT JOIN "AvatarCostumes" c
//       ON av."Costume_ID" = c."Costume_ID"

//     LEFT JOIN "AvatarMasks" m
//       ON av."Mask_ID" = m."Mask_ID"

//     LEFT JOIN "AvatarAccessories" a
//       ON av."Accessory_ID" = a."Accessory_ID"

//     WHERE ap."ActivitySession_ID" = $1
//     AND ap."Left_At" IS NULL
//   `, [activitySessionId]);

//     const students = studentsRes.rows;

//     // ❗ กันกรณีไม่มีนักเรียน
//     if (!students.length) return [];

//     // 2️⃣ shuffle
//     // for (let i = students.length - 1; i > 0; i--) {
//     //   const j = Math.floor(Math.random() * (i + 1));
//     //   [students[i], students[j]] = [students[j], students[i]];
//     // }

//     // 3️⃣ แบ่งทีม
//     const teams = [];
//     let teamIndex = 1;

//     for (let i = 0; i < students.length; i += studentPerTeam) {
//       const members = students
//       .slice(i, i + studentPerTeam)
//       .map((s) => ({
//         Student_ID: s.Student_ID,
//         Student_Name: s.Student_Name,
//         avatar: {
//           bodyPath: s.Body_Image,
//           costumePath: s.Costume_Image,
//           facePath: s.Mask_Image,
//           hairPath: s.Accessory_Image
//         }
//       }));

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

//   socket.on("get_teams", async ({ activitySessionId, studentPerTeam }) => {
//     try {

//       // 🔎 ดึงทีมจาก DB
//       const res = await db.query(`
//         SELECT
//           ta."Team_ID",
//           ta."Team_Name",

//           s."Student_ID",
//           s."Student_Name",

//           b."Body_Image",
//           c."Costume_Image",
//           m."Mask_Image",
//           a."Accessory_Image"

//         FROM "TeamAssignments" ta

//         JOIN "TeamMembers" tm
//           ON tm."Team_ID" = ta."Team_ID"

//         JOIN "Students" s
//           ON s."Student_ID" = tm."Student_ID"

//         LEFT JOIN "Avatars" av
//           ON s."Avatar_ID" = av."Avatar_ID"

//         LEFT JOIN "AvatarBodies" b
//           ON av."Body_ID" = b."Body_ID"

//         LEFT JOIN "AvatarCostumes" c
//           ON av."Costume_ID" = c."Costume_ID"

//         LEFT JOIN "AvatarMasks" m
//           ON av."Mask_ID" = m."Mask_ID"

//         LEFT JOIN "AvatarAccessories" a
//           ON av."Accessory_ID" = a."Accessory_ID"

//         WHERE ta."ActivitySession_ID" = $1
//         ORDER BY ta."Team_ID", s."Student_Name"
//       `, [activitySessionId]);

//       // group ทีม
//       const map = {};

//       for (const row of res.rows) {
//         if (!map[row.Team_ID]) {
//           map[row.Team_ID] = {
//             teamId: row.Team_ID,
//             teamName: row.Team_Name,
//             members: []
//           };
//         }

//         map[row.Team_ID].members.push({
//           Student_ID: row.Student_ID,
//           Student_Name: row.Student_Name,
//           avatar: {
//             bodyPath: row.Body_Image,
//             costumePath: row.Costume_Image,
//             facePath: row.Mask_Image,
//             hairPath: row.Accessory_Image
//           }
//         });
//       }

//       socket.emit("teams_data", Object.values(map));

//     } catch (err) {
//       console.error("❌ get_teams error:", err.message);
//       socket.emit("teams_data", []);
//     }
//   });


//   socket.on("preview_teams", async ({ activitySessionId, studentPerTeam }) => {
//   try {

//     const res = await db.query(`
//       SELECT
//         ap."Student_ID",
//         s."Student_Name",

//         b."Body_Image",
//         c."Costume_Image",
//         m."Mask_Image",
//         a."Accessory_Image"

//       FROM "ActivityParticipants" ap

//       JOIN "Students" s
//         ON s."Student_ID" = ap."Student_ID"

//       LEFT JOIN "Avatars" av
//         ON s."Avatar_ID" = av."Avatar_ID"

//       LEFT JOIN "AvatarBodies" b
//         ON av."Body_ID" = b."Body_ID"

//       LEFT JOIN "AvatarCostumes" c
//         ON av."Costume_ID" = c."Costume_ID"

//       LEFT JOIN "AvatarMasks" m
//         ON av."Mask_ID" = m."Mask_ID"

//       LEFT JOIN "AvatarAccessories" a
//         ON av."Accessory_ID" = a."Accessory_ID"

//       WHERE ap."ActivitySession_ID" = $1
//       AND ap."Left_At" IS NULL
//     `, [activitySessionId]);

//     const students = res.rows.map((row) => ({
//       Student_ID: row.Student_ID,
//       Student_Name: row.Student_Name,
//       avatar: {
//         bodyPath: row.Body_Image,
//         costumePath: row.Costume_Image,
//         facePath: row.Mask_Image,
//         hairPath: row.Accessory_Image
//       }
//     }));


//     // 🔀 shuffle
//     for (let i = students.length - 1; i > 0; i--) {
//       const j = Math.floor(Math.random() * (i + 1));
//       [students[i], students[j]] = [students[j], students[i]];
//     }


//     // 👥 แบ่งทีม
//     const teams = [];
//     let teamIndex = 1;

//     for (let i = 0; i < students.length; i += studentPerTeam) {
//       teams.push({
//         teamId: teamIndex,
//         teamName: `Team ${teamIndex}`,
//         members: students.slice(i, i + studentPerTeam)
//       });

//       teamIndex++;
//     }


//     io.to(`activity_${activitySessionId}`)
//       .emit("preview_teams_data", teams);

//   } catch (err) {
//     console.error("❌ preview_teams error:", err.message);
//     socket.emit("preview_teams_data", []);
//   }
// });


//   socket.on("create_teams", async ({ activitySessionId, teams }) => {

//     for (const team of teams) {

//       const teamRes = await db.query(`
//         INSERT INTO "TeamAssignments"
//         ("ActivitySession_ID","Team_Name")
//         VALUES ($1,$2)
//         RETURNING *
//       `,[activitySessionId, team.teamName]);

//       const teamId = teamRes.rows[0].Team_ID;

//       for (const m of team.members) {

//         await db.query(`
//           INSERT INTO "TeamMembers"
//           ("Team_ID","Student_ID")
//           VALUES ($1,$2)
//         `,[teamId, m.Student_ID]);

//       }

//     }

//     io.to(`activity_${activitySessionId}`).emit("teams_created", teams);


//   });

//   socket.on("start_team_quiz", ({ activitySessionId }) => {

//     const room = `activity_${activitySessionId}`;

//     if (!activitySessions[activitySessionId]) {
//       activitySessions[activitySessionId] = { currentIndex: 0 };
//     } else {
//       activitySessions[activitySessionId].currentIndex = 0;
//     }

//     io.to(room).emit("start_question", {
//       index: 0
//     });

//     console.log("🚀 first question emitted");

//   });

//   // =====================
//   // TEAM SYSTEM
//   // =====================
//   async function addStudentToSmallestTeam(activitySessionId, studentId) {
//     console.log("⚠️ addStudentToSmallestTeam called", activitySessionId, studentId);
//     const existing = await db.query(`
//       SELECT 1
//       FROM "TeamMembers" tm
//       JOIN "TeamAssignments" ta
//         ON ta."Team_ID" = tm."Team_ID"
//       WHERE ta."ActivitySession_ID" = $1
//       AND tm."Student_ID" = $2
//       LIMIT 1
//     `, [activitySessionId, studentId]);

//     if (existing.rows.length) return;

//     const teamRes = await db.query(`
//       SELECT ta."Team_ID"
//       FROM "TeamAssignments" ta
//       LEFT JOIN "TeamMembers" tm ON tm."Team_ID"=ta."Team_ID"
//       WHERE ta."ActivitySession_ID"=$1
//       GROUP BY ta."Team_ID"
//       ORDER BY COUNT(tm."Student_ID") ASC
//       LIMIT 1
//     `, [activitySessionId]);

//     if (!teamRes.rows.length) return;

//     await db.query(`
//       INSERT INTO "TeamMembers" ("Team_ID","Student_ID")
//       VALUES ($1,$2)
//       ON CONFLICT DO NOTHING
//     `, [teamRes.rows[0].Team_ID, studentId]);
//   }


//   // socket.on("student_join_activity", async ({ activitySessionId, studentId }) => {
//   //   try {

//   //     // 1️⃣ เพิ่ม student เข้า participants
//   //     await db.query(`
//   //       INSERT INTO "ActivityParticipants"
//   //       ("ActivitySession_ID","Student_ID")
//   //       VALUES ($1,$2)
//   //       ON CONFLICT DO NOTHING
//   //     `,[activitySessionId, studentId]);

//   //     // 2️⃣ ถ้ามีทีมแล้ว → assign เข้า team อัตโนมัติ
//   //     const teamCheck = await db.query(`
//   //       SELECT 1
//   //       FROM "TeamAssignments"
//   //       WHERE "ActivitySession_ID" = $1
//   //       LIMIT 1
//   //     `,[activitySessionId]);

//   //     if (teamCheck.rows.length > 0) {
//   //       await addStudentToSmallestTeam(activitySessionId, studentId);
//   //     }

//   //     // 3️⃣ join socket room
//   //     socket.join(`activity_${activitySessionId}`);

//   //     socket.emit("student_joined_success");

//   //   } catch (err) {
//   //     console.error("❌ student_join_activity error:", err);
//   //   }
//   // });

// };



// const db = require("../db");

// module.exports = (io, socket) => {
//   console.log("Assign Activity socket ready:", socket.id);

//   const activitySessions = {};

//   // =====================
//   // CREATE SESSION
//   // =====================
//   socket.on("create_activity_session", async ({ classId, activityType, teacherId }) => {
//     try {
//       if (!classId || !activityType || !teacherId) {
//         throw new Error("Missing required fields");
//       }

//       const result = await db.query(`
//         INSERT INTO "ActivitySessions"
//         ("Class_ID","Activity_Type","Assigned_By","Status")
//         VALUES ($1,$2,$3,'active')
//         RETURNING *
//       `, [classId, activityType, teacherId]);

//       socket.emit("activity_session_created", result.rows[0]);
//     } catch (err) {
//       socket.emit("activity_session_created", { success:false, message: err.message });
//     }
//   });

//   // =====================
//   // ASSIGN QUIZ
//   // =====================
//   socket.on("assign_quiz", async (payload) => {
//     const { activitySessionId, quizId, mode, studentPerTeam, timerType, questionTime, quizTime } = payload;

//     try {
//       const result = await db.query(`
//         INSERT INTO "AssignedQuiz"
//         ("ActivitySession_ID","Quiz_ID","Mode","Student_Per_Team","Timer_Type","Question_Time","Quiz_Time")
//         VALUES ($1,$2,$3,$4,$5,$6,$7)
//         RETURNING *
//       `, [activitySessionId, quizId, mode, studentPerTeam || null, timerType, questionTime || null, quizTime || null]);

//       const assignedQuiz = result.rows[0];

//       let teams = null;

//       // 🔥 load questions
//       const qRes = await db.query(`
//         SELECT q."Question_ID", q."Question_Text", q."Question_Type",q."Question_Image", o."Option_ID", o."Option_Text"
//         FROM "Questions" q
//         LEFT JOIN "QuestionOptions" o ON o."Question_ID"=q."Question_ID"
//         WHERE q."Set_ID"=$1
//         ORDER BY q."Question_ID", o."Option_ID"
//       `, [quizId]);

//       const grouped = {};
//       for (const r of qRes.rows) {
//         if (!grouped[r.Question_ID]) {
//           grouped[r.Question_ID] = {
//             Question_ID: r.Question_ID,
//             Question_Text: r.Question_Text,
//             Question_Type: r.Question_Type,
//             Question_Image: r.Question_Image, 
//             choices: []
//           };
//         }
//         if (r.Option_ID) grouped[r.Question_ID].choices.push({
//             Option_ID: r.Option_ID,
//             Option_Text: r.Option_Text
//           });;
//       }

//       const questions = Object.values(grouped);

//       const classRes = await db.query(`
//         SELECT cr."Join_Code"
//         FROM "ActivitySessions" a
//         JOIN "ClassRooms" cr ON cr."Class_ID"=a."Class_ID"
//         WHERE a."ActivitySession_ID"=$1
//       `, [activitySessionId]);

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

//       io.to(joinCode).emit("activity_started", {
//         activityType:"quiz",
//         activitySessionId,
//         quizId,
//         mode,
//         questions,
//         totalQuestions: questions.length,
//         timerType: assignedQuiz.Timer_Type,
//         timeLimit,
//         quizStartTime: Date.now(),
//         serverTime: Date.now()
//       });

//       socket.emit("assign_quiz_result", { 
//         success:true, assignedQuiz: result.rows[0], 
//       });

//     } catch (err) {
//       socket.emit("assign_quiz_result", { success:false, message: err.message });
//     }
//   });

//   socket.on("join_activity", ({ activitySessionId }) => {
//     socket.join(`activity_${activitySessionId}`);

//     if (!activitySessions[activitySessionId]) {
//       activitySessions[activitySessionId] = { currentIndex: 0 };
//     }

//     socket.emit("joined_activity"); 
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
//     io.to(`activity_${activitySessionId}`).emit("force_submit", { activitySessionId });
//     console.log("🔥 force_submit emitted");
//   });

//   socket.on("end_quiz", async ({ activitySessionId }) => {

//     console.log("🟥 [SERVER] end_quiz received:", activitySessionId);

//     const res = await db.query(`
//       SELECT "Mode", "Timer_Type"
//       FROM "AssignedQuiz"
//       WHERE "ActivitySession_ID" = $1
//     `, [activitySessionId]);

//     const mode = res.rows[0]?.Mode || "individual";
//     const timerType = res.rows[0]?.Timer_Type || "none";

//     io.to(`activity_${activitySessionId}`).emit("quiz_ended", { mode });

//     console.log("🟥 [SERVER] quiz_ended emitted");

//   });

//   socket.on("finish_game", async ({ activitySessionId }) => {

//     const res = await db.query(`
//       SELECT "Mode"
//       FROM "AssignedQuiz"
//       WHERE "ActivitySession_ID" = $1
//     `,[activitySessionId]);

//     const mode = res.rows[0]?.Mode;

//     if (mode === "team") {
//       io.to(`activity_${activitySessionId}`)
//         .emit("show_final_team_ranking");
//     } else {
    
//     io.to(`activity_${activitySessionId}`)
//       .emit("show_final_ranking");

//     }

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

//         await db.query(
//           `
//           INSERT INTO "PollOptions"
//           ("AssignedPoll_ID", "Option_Text")
//           VALUES ($1,$2)
//           `,
//           [assignedPollId, option]
//         );
//       }

//        // load options
//       const options = await db.query(`
//         SELECT *
//         FROM "PollOptions"
//         WHERE "AssignedPoll_ID"=$1
//         ORDER BY "PollOption_ID"
//         `, [assignedPollId])

//       // broadcast poll start
//       io.to(`activity_${activitySessionId}`).emit("poll_started", {

//         pollId: assignedPollId,
//         question: pollQuestion,
//         options: options.rows

//       })

//       // 🔥 บอก student ว่า poll เริ่มแล้ว

//       const classRes = await db.query(`
//         SELECT cr."Join_Code"
//         FROM "ActivitySessions" a
//         JOIN "ClassRooms" cr
//         ON cr."Class_ID" = a."Class_ID"
//         WHERE a."ActivitySession_ID"=$1
//         `, [activitySessionId])

//       const joinCode = classRes.rows[0].Join_Code

//       io.to(joinCode).emit("activity_started", {
//         activityType: "poll",
//         activitySessionId
//       })

//       socket.emit("assign_poll_result", {
//         success: true
//       });

//     } catch (err) {

//       console.error("❌ assign_poll error:", err);
//     }
//   });

//   /* ===========================
//      ASSIGN INTERACTIVE BOARD
//      =========================== */
//    socket.on("assign_interactive_board", async (payload) => {

//     const {
//       activitySessionId,
//       boardName,
//       allowAnonymous
//     } = payload;

//     try {

//       const result = await db.query(`
//       INSERT INTO "AssignedInteractiveBoards"
//       (
//         "ActivitySession_ID",
//         "Board_Name",
//         "Allow_Anonymous"
//       )
//       VALUES ($1,$2,$3)
//       RETURNING *
//     `, [
//         activitySessionId,
//         boardName || "Interactive Board",
//         allowAnonymous ?? false
//       ]);

//       /* 🔥 หา joinCode */

//       const classRes = await db.query(`
//       SELECT cr."Join_Code"
//       FROM "ActivitySessions" a
//       JOIN "ClassRooms" cr
//       ON cr."Class_ID" = a."Class_ID"
//       WHERE a."ActivitySession_ID"=$1
//     `, [activitySessionId])

//       const joinCode = classRes.rows[0].Join_Code

//       /* 🔥 broadcast ให้ student */

//       io.to(joinCode).emit("activity_started", {
//         activityType: "chat",
//         activitySessionId
//       })

//       socket.emit("assign_interactive_board_result", {
//         success: true,
//         board: result.rows[0]
//       })

//     } catch (err) {

//       console.error("assign_interactive_board error:", err)

//     }

//   })

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

//   // socket.on("end_quiz_session", async ({ activitySessionId }) => {
//   //   try {

//   //     /* 1️⃣ update activity และดึง Ended_At */
//   //     const result = await db.query(`
//   //       UPDATE "ActivitySessions"
//   //       SET
//   //         "Status" = 'finished',
//   //         "Ended_At" = NOW()
//   //       WHERE "ActivitySession_ID" = $1
//   //       RETURNING "Ended_At"
//   //     `, [activitySessionId]);

//   //     const endedAt = result.rows[0].Ended_At;

//   //     /* 2️⃣ update participants */
//   //     const res = await db.query(`
//   //       UPDATE "ActivityParticipants"
//   //       SET "Left_At"=$1
//   //       WHERE "ActivitySession_ID"=$2
//   //       AND "Left_At" IS NULL
//   //       RETURNING *
//   //     `, [endedAt, activitySessionId]);

//   //     console.log("participants updated:", res.rowCount);
//   //     console.log(res.rows);
//   //     socket.emit("end_quiz_session_result", {
//   //       success: true,
//   //       activitySessionId,
//   //     });

//   //   } catch (err) {

//   //     console.error("❌ end_quiz_session error:", err);

//   //     socket.emit("end_quiz_session_result", {
//   //       success: false,
//   //       message: err.message,
//   //     });

//   //   }
//   // });


//   async function createTeams(activitySessionId, studentPerTeam) {
//     // 1️⃣ ดึงนักเรียนทั้งหมดใน session
//     const studentsRes = await db.query(`
//     SELECT
//       ap."Student_ID",
//       s."Student_Name",
//       b."Body_Image",
//       c."Costume_Image",
//       m."Mask_Image",
//       a."Accessory_Image"

//     FROM "ActivityParticipants" ap

//     JOIN "Students" s
//       ON s."Student_ID" = ap."Student_ID"

//     LEFT JOIN "Avatars" av
//       ON s."Avatar_ID" = av."Avatar_ID"

//     LEFT JOIN "AvatarBodies" b
//       ON av."Body_ID" = b."Body_ID"

//     LEFT JOIN "AvatarCostumes" c
//       ON av."Costume_ID" = c."Costume_ID"

//     LEFT JOIN "AvatarMasks" m
//       ON av."Mask_ID" = m."Mask_ID"

//     LEFT JOIN "AvatarAccessories" a
//       ON av."Accessory_ID" = a."Accessory_ID"

//     WHERE ap."ActivitySession_ID" = $1
//     AND ap."Left_At" IS NULL
//   `, [activitySessionId]);

//     const students = studentsRes.rows;

//     // ❗ กันกรณีไม่มีนักเรียน
//     if (!students.length) return [];

//     // 2️⃣ shuffle
//     // for (let i = students.length - 1; i > 0; i--) {
//     //   const j = Math.floor(Math.random() * (i + 1));
//     //   [students[i], students[j]] = [students[j], students[i]];
//     // }

//     // 3️⃣ แบ่งทีม
//     const teams = [];
//     let teamIndex = 1;

//     for (let i = 0; i < students.length; i += studentPerTeam) {
//       const members = students
//       .slice(i, i + studentPerTeam)
//       .map((s) => ({
//         Student_ID: s.Student_ID,
//         Student_Name: s.Student_Name,
//         avatar: {
//           bodyPath: s.Body_Image,
//           costumePath: s.Costume_Image,
//           facePath: s.Mask_Image,
//           hairPath: s.Accessory_Image
//         }
//       }));

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

//   socket.on("get_teams", async ({ activitySessionId, studentPerTeam }) => {
//     try {

//       // 🔎 ดึงทีมจาก DB
//       const res = await db.query(`
//         SELECT
//           ta."Team_ID",
//           ta."Team_Name",

//           s."Student_ID",
//           s."Student_Name",

//           b."Body_Image",
//           c."Costume_Image",
//           m."Mask_Image",
//           a."Accessory_Image"

//         FROM "TeamAssignments" ta

//         JOIN "TeamMembers" tm
//           ON tm."Team_ID" = ta."Team_ID"

//         JOIN "Students" s
//           ON s."Student_ID" = tm."Student_ID"

//         LEFT JOIN "Avatars" av
//           ON s."Avatar_ID" = av."Avatar_ID"

//         LEFT JOIN "AvatarBodies" b
//           ON av."Body_ID" = b."Body_ID"

//         LEFT JOIN "AvatarCostumes" c
//           ON av."Costume_ID" = c."Costume_ID"

//         LEFT JOIN "AvatarMasks" m
//           ON av."Mask_ID" = m."Mask_ID"

//         LEFT JOIN "AvatarAccessories" a
//           ON av."Accessory_ID" = a."Accessory_ID"

//         WHERE ta."ActivitySession_ID" = $1
//         ORDER BY ta."Team_ID", s."Student_Name"
//       `, [activitySessionId]);

//       // group ทีม
//       const map = {};

//       for (const row of res.rows) {
//         if (!map[row.Team_ID]) {
//           map[row.Team_ID] = {
//             teamId: row.Team_ID,
//             teamName: row.Team_Name,
//             members: []
//           };
//         }

//         map[row.Team_ID].members.push({
//           Student_ID: row.Student_ID,
//           Student_Name: row.Student_Name,
//           avatar: {
//             bodyPath: row.Body_Image,
//             costumePath: row.Costume_Image,
//             facePath: row.Mask_Image,
//             hairPath: row.Accessory_Image
//           }
//         });
//       }

//       socket.emit("teams_data", Object.values(map));

//     } catch (err) {
//       console.error("❌ get_teams error:", err.message);
//       socket.emit("teams_data", []);
//     }
//   });


//   socket.on("preview_teams", async ({ activitySessionId, studentPerTeam }) => {
//   try {

//     const res = await db.query(`
//       SELECT
//         ap."Student_ID",
//         s."Student_Name",

//         b."Body_Image",
//         c."Costume_Image",
//         m."Mask_Image",
//         a."Accessory_Image"

//       FROM "ActivityParticipants" ap

//       JOIN "Students" s
//         ON s."Student_ID" = ap."Student_ID"

//       LEFT JOIN "Avatars" av
//         ON s."Avatar_ID" = av."Avatar_ID"

//       LEFT JOIN "AvatarBodies" b
//         ON av."Body_ID" = b."Body_ID"

//       LEFT JOIN "AvatarCostumes" c
//         ON av."Costume_ID" = c."Costume_ID"

//       LEFT JOIN "AvatarMasks" m
//         ON av."Mask_ID" = m."Mask_ID"

//       LEFT JOIN "AvatarAccessories" a
//         ON av."Accessory_ID" = a."Accessory_ID"

//       WHERE ap."ActivitySession_ID" = $1
//       AND ap."Left_At" IS NULL
//     `, [activitySessionId]);

//     const students = res.rows.map((row) => ({
//       Student_ID: row.Student_ID,
//       Student_Name: row.Student_Name,
//       avatar: {
//         bodyPath: row.Body_Image,
//         costumePath: row.Costume_Image,
//         facePath: row.Mask_Image,
//         hairPath: row.Accessory_Image
//       }
//     }));


//     // 🔀 shuffle
//     for (let i = students.length - 1; i > 0; i--) {
//       const j = Math.floor(Math.random() * (i + 1));
//       [students[i], students[j]] = [students[j], students[i]];
//     }


//     // 👥 แบ่งทีม
//     const teams = [];
//     let teamIndex = 1;

//     for (let i = 0; i < students.length; i += studentPerTeam) {
//       teams.push({
//         teamId: teamIndex,
//         teamName: `Team ${teamIndex}`,
//         members: students.slice(i, i + studentPerTeam)
//       });

//       teamIndex++;
//     }


//     io.to(`activity_${activitySessionId}`)
//       .emit("preview_teams_data", teams);

//   } catch (err) {
//     console.error("❌ preview_teams error:", err.message);
//     socket.emit("preview_teams_data", []);
//   }
// });


//   socket.on("create_teams", async ({ activitySessionId, teams }) => {

//     for (const team of teams) {

//       const teamRes = await db.query(`
//         INSERT INTO "TeamAssignments"
//         ("ActivitySession_ID","Team_Name")
//         VALUES ($1,$2)
//         RETURNING *
//       `,[activitySessionId, team.teamName]);

//       const teamId = teamRes.rows[0].Team_ID;

//       for (const m of team.members) {

//         await db.query(`
//           INSERT INTO "TeamMembers"
//           ("Team_ID","Student_ID")
//           VALUES ($1,$2)
//         `,[teamId, m.Student_ID]);

//       }

//     }

//     io.to(`activity_${activitySessionId}`).emit("teams_created", teams);


//   });

//   socket.on("start_team_quiz", ({ activitySessionId }) => {

//     const room = `activity_${activitySessionId}`;

//     if (!activitySessions[activitySessionId]) {
//       activitySessions[activitySessionId] = { currentIndex: 0 };
//     } else {
//       activitySessions[activitySessionId].currentIndex = 0;
//     }

//     io.to(room).emit("start_question", {
//       index: 0
//     });

//     console.log("🚀 first question emitted");

//   });

//   // =====================
//   // TEAM SYSTEM
//   // =====================
//   async function addStudentToSmallestTeam(activitySessionId, studentId) {
//     console.log("⚠️ addStudentToSmallestTeam called", activitySessionId, studentId);
//     const existing = await db.query(`
//       SELECT 1
//       FROM "TeamMembers" tm
//       JOIN "TeamAssignments" ta
//         ON ta."Team_ID" = tm."Team_ID"
//       WHERE ta."ActivitySession_ID" = $1
//       AND tm."Student_ID" = $2
//       LIMIT 1
//     `, [activitySessionId, studentId]);

//     if (existing.rows.length) return;

//     const teamRes = await db.query(`
//       SELECT ta."Team_ID"
//       FROM "TeamAssignments" ta
//       LEFT JOIN "TeamMembers" tm ON tm."Team_ID"=ta."Team_ID"
//       WHERE ta."ActivitySession_ID"=$1
//       GROUP BY ta."Team_ID"
//       ORDER BY COUNT(tm."Student_ID") ASC
//       LIMIT 1
//     `, [activitySessionId]);

//     if (!teamRes.rows.length) return;

//     await db.query(`
//       INSERT INTO "TeamMembers" ("Team_ID","Student_ID")
//       VALUES ($1,$2)
//       ON CONFLICT DO NOTHING
//     `, [teamRes.rows[0].Team_ID, studentId]);
//   }


//   // socket.on("student_join_activity", async ({ activitySessionId, studentId }) => {
//   //   try {

//   //     // 1️⃣ เพิ่ม student เข้า participants
//   //     await db.query(`
//   //       INSERT INTO "ActivityParticipants"
//   //       ("ActivitySession_ID","Student_ID")
//   //       VALUES ($1,$2)
//   //       ON CONFLICT DO NOTHING
//   //     `,[activitySessionId, studentId]);

//   //     // 2️⃣ ถ้ามีทีมแล้ว → assign เข้า team อัตโนมัติ
//   //     const teamCheck = await db.query(`
//   //       SELECT 1
//   //       FROM "TeamAssignments"
//   //       WHERE "ActivitySession_ID" = $1
//   //       LIMIT 1
//   //     `,[activitySessionId]);

//   //     if (teamCheck.rows.length > 0) {
//   //       await addStudentToSmallestTeam(activitySessionId, studentId);
//   //     }

//   //     // 3️⃣ join socket room
//   //     socket.join(`activity_${activitySessionId}`);

//   //     socket.emit("student_joined_success");

//   //   } catch (err) {
//   //     console.error("❌ student_join_activity error:", err);
//   //   }
//   // });

// };

const db = require("../db");

module.exports = (io, socket) => {
  console.log("Assign Activity socket ready:", socket.id);

  const activitySessions = {};

  // =====================
  // CREATE SESSION
  // =====================
  socket.on("create_activity_session", async ({ classId, activityType, teacherId }) => {
    try {
      if (!classId || !activityType || !teacherId) {
        throw new Error("Missing required fields");
      }

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

    const {
      activitySessionId,
      quizId,
      mode,
      studentPerTeam,
      timerType,
      questionTime,
      quizTime
    } = payload;

    try {

      const result = await db.query(`
        INSERT INTO "AssignedQuiz"
        ("ActivitySession_ID","Quiz_ID","Mode","Student_Per_Team","Timer_Type","Question_Time","Quiz_Time")
        VALUES ($1,$2,$3,$4,$5,$6,$7)
        RETURNING *
      `, [
        activitySessionId,
        quizId,
        mode,
        studentPerTeam || null,
        timerType,
        questionTime || null,
        quizTime || null
      ]);

      const assignedQuiz = result.rows[0];

      // ================= LOAD QUESTIONS =================

      const qRes = await db.query(`
        SELECT
          q."Question_ID",
          q."Question_Text",
          q."Question_Type",
          q."Question_Image",
          o."Option_ID",
          o."Option_Text"
        FROM "Questions" q
        LEFT JOIN "QuestionOptions" o
          ON o."Question_ID" = q."Question_ID"
        WHERE q."Set_ID" = $1
        ORDER BY q."Question_ID", o."Option_ID"
      `,[quizId]);

      const grouped = {};

      for (const r of qRes.rows) {

        if (!grouped[r.Question_ID]) {
          grouped[r.Question_ID] = {
            Question_ID: r.Question_ID,
            Question_Text: r.Question_Text,
            Question_Type: r.Question_Type,
            Question_Image: r.Question_Image,
            choices: []
          };
        }

        if (r.Option_ID) {
          grouped[r.Question_ID].choices.push({
            Option_ID: r.Option_ID,
            Option_Text: r.Option_Text
          });
        }

      }

      const questions = Object.values(grouped);

      // ================= JOIN CODE =================

      const classRes = await db.query(`
        SELECT cr."Join_Code"
        FROM "ActivitySessions" a
        JOIN "ClassRooms" cr
          ON cr."Class_ID" = a."Class_ID"
        WHERE a."ActivitySession_ID" = $1
      `,[activitySessionId]);

      const joinCode = classRes.rows[0].Join_Code;

      let timeLimit = null;

      if (
        assignedQuiz.Timer_Type === "question" ||
        assignedQuiz.Timer_Type === "teacher"
      ) {
        timeLimit = Number(assignedQuiz.Question_Time);
      }

      if (assignedQuiz.Timer_Type === "quiz") {
        timeLimit = Number(assignedQuiz.Quiz_Time) * 60;
      }

      io.to(joinCode).emit("activity_started",{
        activityType:"quiz",
        activitySessionId,
        quizId,
        mode,
        questions,
        totalQuestions: questions.length,
        timerType: assignedQuiz.Timer_Type,
        timeLimit,
        quizStartTime: Date.now(),
        serverTime: Date.now()
      });

      socket.emit("assign_quiz_result",{
        success:true,
        assignedQuiz
      });

    } catch (err) {

      socket.emit("assign_quiz_result",{
        success:false,
        message: err.message
      });

    }

  });


  socket.on("join_activity", ({ activitySessionId }) => {

    socket.join(`activity_${activitySessionId}`);

    if (!activitySessions[activitySessionId]) {
      activitySessions[activitySessionId] = { currentIndex: 0 };
    }

    socket.emit("joined_activity");

  });


  socket.on("next_question", ({ activitySessionId }) => {

    if (!activitySessionId) return;

    if (!activitySessions[activitySessionId]) {
      activitySessions[activitySessionId] = {
        currentIndex: 0
      };
    }

    activitySessions[activitySessionId].currentIndex += 1;

    const nextIndex =
      activitySessions[activitySessionId].currentIndex;

    io.to(`activity_${activitySessionId}`).emit("start_question",{
      index: nextIndex
    });

  });


  socket.on("force_submit", ({ activitySessionId }) => {

    io.to(`activity_${activitySessionId}`)
      .emit("force_submit",{ activitySessionId });

  });


  socket.on("end_quiz", async ({ activitySessionId }) => {

    const res = await db.query(`
      SELECT "Mode"
      FROM "AssignedQuiz"
      WHERE "ActivitySession_ID" = $1
    `,[activitySessionId]);

    const mode = res.rows[0]?.Mode || "individual";

    io.to(`activity_${activitySessionId}`)
      .emit("quiz_ended",{ mode });

  });


  socket.on("finish_game", async ({ activitySessionId }) => {

    const res = await db.query(`
      SELECT "Mode"
      FROM "AssignedQuiz"
      WHERE "ActivitySession_ID" = $1
    `,[activitySessionId]);

    const mode = res.rows[0]?.Mode;

    if (mode === "team") {

      io.to(`activity_${activitySessionId}`)
        .emit("show_final_team_ranking");

    } else {

      io.to(`activity_${activitySessionId}`)
        .emit("show_final_ranking");

    }

  });

    /* ===========================
     ASSIGN POLL
     =========================== */

  socket.on("assign_poll", async (payload) => {

    const {
      activitySessionId,
      pollQuestion,
      choices,
      allowMultiple,
      duration,
    } = payload;

    try {

      const pollResult = await db.query(`
        INSERT INTO "AssignedPoll"
        (
          "ActivitySession_ID",
          "Poll_Question",
          "Allow_Multiple",
          "Duration"
        )
        VALUES ($1,$2,$3,$4)
        RETURNING *
      `,[
        activitySessionId,
        pollQuestion,
        allowMultiple ?? false,
        duration || null
      ]);

      const assignedPollId = pollResult.rows[0].AssignedPoll_ID;

      for (const option of choices) {

        await db.query(`
          INSERT INTO "PollOptions"
          ("AssignedPoll_ID","Option_Text")
          VALUES ($1,$2)
        `,[assignedPollId,option]);

      }

      const options = await db.query(`
        SELECT *
        FROM "PollOptions"
        WHERE "AssignedPoll_ID"=$1
        ORDER BY "PollOption_ID"
      `,[assignedPollId]);

      io.to(`activity_${activitySessionId}`).emit("poll_started",{
        pollId: assignedPollId,
        question: pollQuestion,
        options: options.rows
      });

      const classRes = await db.query(`
        SELECT cr."Join_Code"
        FROM "ActivitySessions" a
        JOIN "ClassRooms" cr
          ON cr."Class_ID" = a."Class_ID"
        WHERE a."ActivitySession_ID"=$1
      `,[activitySessionId]);

      const joinCode = classRes.rows[0].Join_Code;

      io.to(joinCode).emit("activity_started",{
        activityType:"poll",
        activitySessionId
      });

      socket.emit("assign_poll_result",{success:true});

    } catch(err) {

      console.error("❌ assign_poll error:",err);

    }

  });



  /* ===========================
     ASSIGN INTERACTIVE BOARD
     =========================== */

  socket.on("assign_interactive_board", async (payload) => {

    const {
      activitySessionId,
      boardName,
      allowAnonymous
    } = payload;

    try {

      const result = await db.query(`
        INSERT INTO "AssignedInteractiveBoards"
        (
          "ActivitySession_ID",
          "Board_Name",
          "Allow_Anonymous"
        )
        VALUES ($1,$2,$3)
        RETURNING *
      `,[
        activitySessionId,
        boardName || "Interactive Board",
        allowAnonymous ?? false
      ]);

      const classRes = await db.query(`
        SELECT cr."Join_Code"
        FROM "ActivitySessions" a
        JOIN "ClassRooms" cr
          ON cr."Class_ID" = a."Class_ID"
        WHERE a."ActivitySession_ID"=$1
      `,[activitySessionId]);

      const joinCode = classRes.rows[0].Join_Code;

      io.to(joinCode).emit("activity_started",{
        activityType:"chat",
        activitySessionId
      });

      socket.emit("assign_interactive_board_result",{
        success:true,
        board: result.rows[0]
      });

    } catch(err) {

      console.error("assign_interactive_board error:",err);

    }

  });



  socket.on("get_assigned_quiz", async ({ activitySessionId }) => {

    try {

      const assignedRes = await db.query(`
        SELECT
          aq.*,
          qs."Set_ID",
          qs."Title"
        FROM "AssignedQuiz" aq
        JOIN "QuestionSets" qs
          ON qs."Set_ID" = aq."Quiz_ID"
        WHERE aq."ActivitySession_ID" = $1
      `,[activitySessionId]);

      if (!assignedRes.rows.length) {

        return socket.emit("assigned_quiz_data",{
          success:false,
          message:"Assigned quiz not found"
        });

      }

      const assignedQuiz = assignedRes.rows[0];

      const questionRes = await db.query(`
        SELECT
          q."Question_ID",
          q."Question_Text",
          q."Question_Type",
          q."Question_Image",
          o."Option_ID",
          o."Option_Text",
          (
            SELECT qco."Option_ID"
            FROM "Question_Correct_Options" qco
            WHERE qco."Question_ID" = q."Question_ID"
            AND qco."Option_ID" = o."Option_ID"
            LIMIT 1
          ) AS "Correct_Option_ID"
        FROM "Questions" q
        LEFT JOIN "QuestionOptions" o
          ON o."Question_ID" = q."Question_ID"
        WHERE q."Set_ID" = $1
        ORDER BY q."Question_ID", o."Option_ID"
      `,[assignedQuiz.Set_ID]);

      socket.emit("assigned_quiz_data",{
        success:true,
        assignedQuiz,
        questions:questionRes.rows
      });

    } catch(err) {

      console.error("❌ get_assigned_quiz error:",err);

      socket.emit("assigned_quiz_data",{
        success:false,
        message:err.message
      });

    }

  });



  /* =====================
     TEAM SYSTEM
     ===================== */

  async function createTeams(activitySessionId,studentPerTeam) {

    const studentsRes = await db.query(`
      SELECT
        ap."Student_ID",
        s."Student_Name",
        b."Body_Image",
        c."Costume_Image",
        m."Mask_Image",
        a."Accessory_Image"
      FROM "ActivityParticipants" ap
      JOIN "Students" s
        ON s."Student_ID" = ap."Student_ID"
      LEFT JOIN "Avatars" av
        ON s."Avatar_ID" = av."Avatar_ID"
      LEFT JOIN "AvatarBodies" b
        ON av."Body_ID" = b."Body_ID"
      LEFT JOIN "AvatarCostumes" c
        ON av."Costume_ID" = c."Costume_ID"
      LEFT JOIN "AvatarMasks" m
        ON av."Mask_ID" = m."Mask_ID"
      LEFT JOIN "AvatarAccessories" a
        ON av."Accessory_ID" = a."Accessory_ID"
      WHERE ap."ActivitySession_ID"=$1
      AND ap."Left_At" IS NULL
    `,[activitySessionId]);

    const students = studentsRes.rows;

    if (!students.length) return [];

    const teams = [];
    let teamIndex = 1;

    for (let i=0;i<students.length;i+=studentPerTeam) {

      const members = students.slice(i,i+studentPerTeam).map((s)=>({
        Student_ID:s.Student_ID,
        Student_Name:s.Student_Name,
        avatar:{
          bodyPath:s.Body_Image,
          costumePath:s.Costume_Image,
          facePath:s.Mask_Image,
          hairPath:s.Accessory_Image
        }
      }));

      const teamRes = await db.query(`
        INSERT INTO "TeamAssignments"
        ("ActivitySession_ID","Team_Name")
        VALUES ($1,$2)
        RETURNING *
      `,[activitySessionId,`Team ${teamIndex}`]);

      const teamId = teamRes.rows[0].Team_ID;

      for (const m of members) {

        await db.query(`
          INSERT INTO "TeamMembers"
          ("Team_ID","Student_ID")
          VALUES ($1,$2)
        `,[teamId,m.Student_ID]);

      }

      teams.push({
        teamId,
        teamName:`Team ${teamIndex}`,
        members
      });

      teamIndex++;

    }

    return teams;

  }



  socket.on("start_team_quiz",({activitySessionId})=>{

    const room = `activity_${activitySessionId}`;

    if (!activitySessions[activitySessionId]) {
      activitySessions[activitySessionId] = {currentIndex:0};
    } else {
      activitySessions[activitySessionId].currentIndex = 0;
    }

    io.to(room).emit("start_question",{index:0});

  });



  async function addStudentToSmallestTeam(activitySessionId,studentId){

    const existing = await db.query(`
      SELECT 1
      FROM "TeamMembers" tm
      JOIN "TeamAssignments" ta
        ON ta."Team_ID" = tm."Team_ID"
      WHERE ta."ActivitySession_ID"=$1
      AND tm."Student_ID"=$2
      LIMIT 1
    `,[activitySessionId,studentId]);

    if (existing.rows.length) return;

    const teamRes = await db.query(`
      SELECT ta."Team_ID"
      FROM "TeamAssignments" ta
      LEFT JOIN "TeamMembers" tm
        ON tm."Team_ID"=ta."Team_ID"
      WHERE ta."ActivitySession_ID"=$1
      GROUP BY ta."Team_ID"
      ORDER BY COUNT(tm."Student_ID") ASC
      LIMIT 1
    `,[activitySessionId]);

    if (!teamRes.rows.length) return;

    await db.query(`
      INSERT INTO "TeamMembers"
      ("Team_ID","Student_ID")
      VALUES ($1,$2)
      ON CONFLICT DO NOTHING
    `,[teamRes.rows[0].Team_ID,studentId]);

  }


};