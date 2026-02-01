const db = require("../db");

module.exports = (io, socket) => {
  console.log("🔥 assign_activity module loaded for", socket.id);
  console.log("Assign Activity socket ready:", socket.id);

//   socket.on("create_activity_session", async ({ classId, activityType }) => {
//   const result = await db.query(`
//     INSERT INTO "ActivitySessions"
//     ("Class_ID", "Activity_Type", "Assigned_By", "Status")
//     VALUES ($1, $2, $3, 'active')
//     RETURNING *
//   `, [classId, activityType, teacherId]);

//   socket.emit("activity_session_created", result.rows[0]);
//     });

    

    socket.on("create_activity_session", async ({ classId, activityType, teacherId }) => {
        try {
            // const { classId, activityType, teacherId } = payload;

            if (!classId || !activityType || !teacherId) {
            throw new Error("Missing required fields");
            }

            const result = await db.query(`
            INSERT INTO "ActivitySessions"
            (
                "Class_ID",
                "Activity_Type",
                "Assigned_By",
                "Status"
            )
            VALUES ($1, $2, $3, 'active')
            RETURNING *
            `, [classId, activityType, teacherId]);

            socket.emit("activity_session_created", result.rows[0]);

        } catch (err) {
            console.error("❌ create_activity_session error:", err);
            socket.emit("activity_session_created", {
            success: false,
            message: err.message,
            });
        }
    });

    /* ===========================
     ASSIGN QUIZ
     =========================== */
    socket.on("assign_quiz", async (payload) => {
      const {
        activitySessionId,
        quizId,
        mode,
        studentPerTeam,
        timerType,
        questionTime,
        quizTime,
      } = payload;

      try {
        const result = await db.query(
          `
          INSERT INTO "AssignedQuiz"
          (
            "ActivitySession_ID",
            "Quiz_ID",
            "Mode",
            "Student_Per_Team",
            "Timer_Type",
            "Question_Time",
            "Quiz_Time"
          )
          VALUES ($1,$2,$3,$4,$5,$6,$7)
          RETURNING *
          `,
          [
            activitySessionId,
            quizId,
            mode,
            studentPerTeam || null,
            timerType,
            questionTime || null,
            quizTime || null,
          ]
        );

        // 2️⃣ ดึงคำถาม
        const qRes = await db.query(`
          SELECT 
            q."Question_ID",
            q."Question_Text",
            q."Question_Type",
            o."Option_ID",
            o."Option_Text"
          FROM "Questions" q
          LEFT JOIN "QuestionOptions" o
            ON o."Question_ID" = q."Question_ID"
          WHERE q."Set_ID" = $1
          ORDER BY q."Question_ID", o."Option_ID"
        `, [quizId]);

        // 3️⃣ group questions
        const grouped = {};
        for (const row of qRes.rows) {
          if (!grouped[row.Question_ID]) {
            grouped[row.Question_ID] = {
              Question_ID: row.Question_ID,
              Question_Text: row.Question_Text,
              Question_Type: row.Question_Type,
              choices: []
            };
          }
          if (row.Option_ID) {
            grouped[row.Question_ID].choices.push({
              Option_ID: row.Option_ID,
              Option_Text: row.Option_Text
            });
          }
        }

        const questions = Object.values(grouped);


        const classRes = await db.query(`
          SELECT cr."Join_Code"
          FROM "ActivitySessions" a
          JOIN "ClassRooms" cr ON cr."Class_ID" = a."Class_ID"
          WHERE a."ActivitySession_ID" = $1
        `, [activitySessionId]);

        if (!classRes.rows.length) {
          throw new Error("Join code not found");
        }

        const joinCode = classRes.rows[0].Join_Code;

        let timeLimit = null;

        if (timerType === "question" || timerType === "teacher") {
          timeLimit = Number(questionTime);   // 👈 ใช้เหมือนกัน
        }

        if (timerType === "quiz") {
          timeLimit = Number(quizTime) * 60;
        }


        // 4️⃣ broadcast เริ่ม quiz (🔥 จุดสำคัญ)
        io.to(joinCode).emit("activity_started", {
          activityType: "quiz",
          activitySessionId,
          questions,
          totalQuestions: questions.length,
          timerType,
          timeLimit
        });

        socket.emit("assign_quiz_result", {
          success: true,
          assignedQuiz: result.rows[0],
        });
      } catch (err) {
        console.error("❌ assign_quiz error:", err);
        socket.emit("assign_quiz_result", {
          success: false,
          message: err.message,
        });
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
      // 1️⃣ create AssignedPoll
      const pollResult = await db.query(
        `
        INSERT INTO "AssignedPoll"
        (
          "ActivitySession_ID",
          "Poll_Question",
          "Allow_Multiple",
          "Duration"
        )
        VALUES ($1,$2,$3,$4)
        RETURNING *
        `,
        [
          activitySessionId,
          pollQuestion,
          allowMultiple ?? false,
          duration || null,
        ]
      );

      const assignedPollId = pollResult.rows[0].AssignedPoll_ID;

      // 2️⃣ create PollOptions
      for (const option of choices) {
        if (!option.trim()) continue;

        await db.query(
          `
          INSERT INTO "PollOptions"
          ("AssignedPoll_ID", "Option_Text")
          VALUES ($1,$2)
          `,
          [assignedPollId, option]
        );
      }

      socket.emit("assign_poll_result", {
        success: true,
        assignedPoll: pollResult.rows[0],
      });
    } catch (err) {
      console.error("❌ assign_poll error:", err);
      socket.emit("assign_poll_result", {
        success: false,
        message: err.message,
      });
    }
  });

  /* ===========================
     ASSIGN INTERACTIVE BOARD
     =========================== */
  socket.on("assign_interactive_board", async (payload) => {
    const {
      activitySessionId,
      boardName,
      allowAnonymous,
    } = payload;

    try {
      const result = await db.query(
        `
        INSERT INTO "AssignedInteractiveBoards"
        (
          "ActivitySession_ID",
          "Board_Name",
          "Allow_Anonymous"
        )
        VALUES ($1,$2,$3)
        RETURNING *
        `,
        [
          activitySessionId,
          boardName || "Interactive Board",
          allowAnonymous ?? false,
        ]
      );

      socket.emit("assign_interactive_board_result", {
        success: true,
        board: result.rows[0],
      });
    } catch (err) {
      console.error("❌ assign_interactive_board error:", err);
      socket.emit("assign_interactive_board_result", {
        success: false,
        message: err.message,
      });
    }
  });

//   socket.on("get_assigned_quiz", async ({ activitySessionId }) => {
//   const result = await db.query(`
//     SELECT aq.*, q.*
//     FROM "AssignedQuiz" aq
//     JOIN "Quiz" q ON aq."Quiz_ID" = q."Quiz_ID"
//     WHERE aq."ActivitySession_ID" = $1
//   `, [activitySessionId]);

//   socket.emit("assigned_quiz_data", result.rows[0]);
// });


//   socket.on("get_assigned_quiz2", async ({ activitySessionId }) => {
//     try {
//         // 1. AssignedQuiz
//         const assigned = await db.query(`
//         SELECT *
//         FROM "AssignedQuiz"
//         WHERE "ActivitySession_ID" = $1
//         `, [activitySessionId]);

//         if (assigned.rows.length === 0) {
//         return socket.emit("assigned_quiz_data", { success: false });
//         }

//         const assignedQuiz = assigned.rows[0];

//         // 2. Questions + Choices
//         const questions = await db.query(`
//         SELECT 
//             q."Question_ID",
//             q."Question_Text",
//             q."Question_Type",
//             q."Image_URL",
//             c."Choice_ID",
//             c."Choice_Text",
//             c."Is_Correct"
//         FROM "Questions" q
//         LEFT JOIN "Choices" c
//             ON q."Question_ID" = c."Question_ID"
//         WHERE q."Quiz_ID" = $1
//         ORDER BY q."Question_ID", c."Choice_ID"
//         `, [assignedQuiz.Quiz_ID]);

//         socket.emit("assigned_quiz_data", {
//         success: true,
//         assignedQuiz,
//         questions: questions.rows,
//         });
//     } catch (err) {
//         console.error(err);
//         socket.emit("assigned_quiz_data", { success: false });
//     }
//     });

//     socket.on("get_assigned_quiz", async ({ activitySessionId }) => {
//   try {
//     /* =========================
//        1️⃣ AssignedQuiz
//        ========================= */
//     const assignedRes = await db.query(
//       `
//       SELECT 
//         aq.*,
//         q."Quiz_Type",
//         q."Title"
//       FROM "AssignedQuiz" aq
//       JOIN "Quizzes" q
//         ON q."Quiz_ID" = aq."Quiz_ID"
//       WHERE aq."ActivitySession_ID" = $1
//       `,
//       [activitySessionId]
//     );

//     if (assignedRes.rows.length === 0) {
//       return socket.emit("assigned_quiz_data", {
//         success: false,
//         message: "Assigned quiz not found",
//       });
//     }

//     const assignedQuiz = assignedRes.rows[0];

//     /* =========================
//        2️⃣ Questions + Choices
//        ========================= */
//     const questionRes = await db.query(
//       `
//       SELECT 
//         q."Question_ID",
//         q."Question_Text",
//         q."Question_Type",
//         q."Image_URL",
//         c."Choice_ID",
//         c."Choice_Text",
//         c."Is_Correct"
//       FROM "Questions" q
//       LEFT JOIN "Choices" c
//         ON c."Question_ID" = q."Question_ID"
//       WHERE q."Quiz_ID" = $1
//       ORDER BY q."Question_ID", c."Choice_ID"
//       `,
//       [assignedQuiz.Quiz_ID]
//     );

//     socket.emit("assigned_quiz_data", {
//       success: true,
//       assignedQuiz,
//       questions: questionRes.rows,
//     });
//   } catch (err) {
//     console.error("❌ get_assigned_quiz error:", err);
//     socket.emit("assigned_quiz_data", {
//       success: false,
//       message: err.message,
//     });
//   }
// });

//     socket.on("get_assigned_quiz", async ({ activitySessionId }) => {
//         try {
//             /* =========================
//             1️⃣ AssignedQuiz + QuestionSet
//             ========================= */
//             const assignedRes = await db.query(
//             `
//             SELECT 
//                 aq.*,
//                 qs."Title",
//                 qs."Set_ID"
//             FROM "AssignedQuiz" aq
//             JOIN "QuestionSets" qs
//                 ON qs."Set_ID" = aq."Quiz_ID"
//             WHERE aq."ActivitySession_ID" = $1
//             `,
//             [activitySessionId]
//             );

//             if (assignedRes.rows.length === 0) {
//             return socket.emit("assigned_quiz_data", {
//                 success: false,
//                 message: "Assigned quiz not found",
//             });
//             }

//             const assignedQuiz = assignedRes.rows[0];

//             /* =========================
//             2️⃣ Questions + Options + Correct
//             ========================= */
//             const questionRes = await db.query(
//             `
//             SELECT
//                 q."Question_ID",
//                 q."Question_Text",
//                 q."Question_Type",
//                 q."Question_Image",

//                 json_agg(
//                 json_build_object(
//                     'id', o."Option_ID",
//                     'text', o."Option_Text"
//                 )
//                 ORDER BY o."Option_ID"
//                 ) AS options,

//                 COALESCE(
//                 ARRAY_AGG(qco."Option_ID")
//                 FILTER (WHERE qco."Option_ID" IS NOT NULL),
//                 '{}'
//                 ) AS correct

//             FROM "Questions" q
//             LEFT JOIN "QuestionOptions" o
//                 ON q."Question_ID" = o."Question_ID"
//             LEFT JOIN "Question_Correct_Options" qco
//                 ON q."Question_ID" = qco."Question_ID"
//             WHERE q."Set_ID" = $1
//             GROUP BY q."Question_ID"
//             ORDER BY q."Question_ID"
//             `,
//             [assignedQuiz.Quiz_ID]
//             );

//             socket.emit("assigned_quiz_data", {
//             success: true,
//             assignedQuiz,
//             questions: questionRes.rows,
//             });

//         } catch (err) {
//             console.error("❌ get_assigned_quiz error:", err);
//             socket.emit("assigned_quiz_data", {
//             success: false,
//             message: err.message,
//             });
//         }
//         });
    socket.on("get_assigned_quiz", async ({ activitySessionId }) => {
  try {
    // 1️⃣ AssignedQuiz + QuestionSet
    const assignedRes = await db.query(
      `
      SELECT 
        aq.*,
        qs."Set_ID",
        qs."Title"
      FROM "AssignedQuiz" aq
      JOIN "QuestionSets" qs
        ON qs."Set_ID" = aq."Quiz_ID"
      WHERE aq."ActivitySession_ID" = $1
      `,
      [activitySessionId]
    );

    if (assignedRes.rows.length === 0) {
      return socket.emit("assigned_quiz_data", {
        success: false,
        message: "Assigned quiz not found",
      });
    }

    const assignedQuiz = assignedRes.rows[0];

    // 2️⃣ Questions + Options + Correct
    const questionRes = await db.query(
      `
      SELECT 
        q."Question_ID",
        q."Question_Text",
        q."Question_Type",
        q."Question_Image",
        o."Option_ID",
        o."Option_Text",
        qco."Option_ID" AS "Correct_Option_ID"
      FROM "Questions" q
      LEFT JOIN "QuestionOptions" o
        ON o."Question_ID" = q."Question_ID"
      LEFT JOIN "Question_Correct_Options" qco
        ON qco."Question_ID" = q."Question_ID"
      WHERE q."Set_ID" = $1
      ORDER BY q."Question_ID", o."Option_ID"
      `,
      [assignedQuiz.Set_ID]
    );

    socket.emit("assigned_quiz_data", {
      success: true,
      assignedQuiz,
      questions: questionRes.rows,
    });
  } catch (err) {
    console.error("❌ get_assigned_quiz error:", err);
    socket.emit("assigned_quiz_data", {
      success: false,
      message: err.message,
    });
  }


});

}