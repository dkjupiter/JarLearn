const db = require("../db");

module.exports = (io, socket) => {
  console.log("Assign Activity socket ready:", socket.id);

  const activitySessions = {};
  
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

      console.log("🟥 emitting activity_session_created to:", socket.id);      

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

      const assignedQuiz = result.rows[0];

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

      if (
        assignedQuiz.Timer_Type === "question" ||
        assignedQuiz.Timer_Type === "teacher"
      ) {
        timeLimit = Number(assignedQuiz.Question_Time); // วินาที
      }

      if (assignedQuiz.Timer_Type === "quiz") {
        timeLimit = Number(assignedQuiz.Quiz_Time) * 60; // นาที → วินาที
      }

      // 4️⃣ broadcast เริ่ม quiz (🔥 จุดสำคัญ)
      io.to(joinCode).emit("activity_started", {
        activityType: "quiz",
        activitySessionId,
        quizId,
        questions,
        totalQuestions: questions.length,
        timerType: assignedQuiz.Timer_Type,
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

  // socket.on("join_activity", async ({ activitySessionId, studentId }) => {

  //   const room = `activity_${activitySessionId}`;
  //   socket.join(room);


  //    console.log("✅ joined room:", room);
  //   console.log("📦 current rooms:", [...socket.rooms]);


  //   if (!activitySessions[activitySessionId]) {
  //     activitySessions[activitySessionId] = { currentIndex: 0 };
  //   }
  //   socket.data.activitySessionId = activitySessionId;
  //   socket.data.studentId = studentId;

  //   try {
  //     await db.query(`
  //       INSERT INTO "ActivityParticipants"
  //       ("ActivitySession_ID", "Student_ID", "Joined_At")
  //       VALUES ($1, $2, NOW())
  //       ON CONFLICT DO NOTHING
  //     `, [activitySessionId, studentId]);

  //   } catch (err) {
  //     console.error("❌ join_activity insert error:", err);
  //   }

  // });

  socket.on("join_activity", async (payload) => {

    console.log("🔥 join_activity payload:", payload);

    const { activitySessionId, studentId } = payload || {};

    if (!activitySessionId) {
      console.log("⚠️ missing activitySessionId");
      return;
    }

    const room = `activity_${activitySessionId}`;
    socket.join(room);

    console.log("✅ joined room:", room);
    console.log("📦 current rooms:", [...socket.rooms]);

    if (!studentId) {
      console.log("⚠️ studentId missing → skip DB insert");
      return;
    }

    try {
      await db.query(`
        INSERT INTO "ActivityParticipants"
        ("ActivitySession_ID", "Student_ID", "Joined_At")
        VALUES ($1, $2, NOW())
        ON CONFLICT DO NOTHING
      `, [activitySessionId, studentId]);

    } catch (err) {
      console.error("❌ join_activity insert error:", err);
    }

  });



  socket.on("next_question", ({ activitySessionId }) => {
    if (!activitySessionId) return;

    // 🔐 init กันพัง
    if (!activitySessions[activitySessionId]) {
      activitySessions[activitySessionId] = {
        currentIndex: 0,
      };
      console.warn(
        "⚠️ activitySession was not initialized, auto-init:",
        activitySessionId
      );
    }

    activitySessions[activitySessionId].currentIndex += 1;

    const nextIndex =
      activitySessions[activitySessionId].currentIndex;

    io.to(`activity_${activitySessionId}`).emit("start_question", {
      index: nextIndex,
    });

    console.log("🚀 start_question emitted:", nextIndex);
  });

  socket.on("force_submit", ({ activitySessionId }) => {
    io.to(`activity_${activitySessionId}`).emit("force_submit");
    console.log("🔥 force_submit emitted");
  });

  socket.on("end_quiz", ({ activitySessionId }) => {
    console.log("🟥 [SERVER] end_quiz received:", activitySessionId);

    io.to(`activity_${activitySessionId}`).emit("quiz_ended");

    console.log("🟥 [SERVER] quiz_ended emitted");
    io.emit("quiz_ended");
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

  socket.on("end_quiz_session", async ({ activitySessionId }) => {
    try {
      await db.query(`
      UPDATE "ActivitySessions"
      SET
        "Status" = 'finished',
        "Ended_At" = NOW()
      WHERE "ActivitySession_ID" = $1
    `, [activitySessionId]);

      socket.emit("end_quiz_session_result", {
        success: true,
        activitySessionId,
      });
    } catch (err) {
      console.error("❌ end_quiz_session error:", err);
      socket.emit("end_quiz_session_result", {
        success: false,
        message: err.message,
      });
    }
  });


}