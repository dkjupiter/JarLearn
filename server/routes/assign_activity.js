const db = require("../db");

module.exports = (socket) => {
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