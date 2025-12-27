// const express = require("express");
// const router = express.Router();
// const db = require("../db");

// module.exports = (io) => {
//   io.on("connection", (socket) => {
//     console.log("Quiz socket connected:", socket.id);

//     // GET All Question Sets of a Teacher
//     socket.on("get_question_sets", async (teacherId) => {
//       try {
//         const result = await db.query(
//           `SELECT "Set_ID","Title" FROM "QuestionSets" WHERE "Teacher_ID"=$1 ORDER BY "Set_ID" ASC`,
//           [teacherId]
//         );
//         socket.emit("question_sets_data", result.rows);
//         console.log("Sending questions:", result.rows);
//       } catch (err) {
//         console.error(err);
//         socket.emit("question_sets_data", { error: err.message });
//       }
//     });

//     // request CREATE a new Question Set
//     // socket.on("request_create_set", async ({teacherId }) => {
//     //   try {
//     //     if (!teacherId)
//     //       return socket.emit("create_set_result", {
//     //         success: false,
//     //         message: "Missing required fields",
//     //       });

//     //     // check max 50 sets
//     //     const total = await db.query(
//     //       `SELECT COUNT(*) FROM "QuestionSets" WHERE "Teacher_ID"=$1`,
//     //       [teacherId]
//     //     );
//     //     if (Number(total.rows[0].count) >= 50)
//     //       return socket.emit("create_set_result", {
//     //         success: false,
//     //         message: "Maximum 50 quiz sets allowed",
//     //       });

//     //     // prevent duplicate title for same teacher
//     //     // const exists = await db.query(
//     //     //   `SELECT 1 FROM "QuestionSets" WHERE "Teacher_ID"=$1 AND LOWER("Title")=LOWER($2)`,
//     //     //   [teacherId, title]
//     //     // );
//     //     // if (exists.rowCount > 0)
//     //     //   return socket.emit("create_set_result", {
//     //     //     success: false,
//     //     //     message: "This quiz name already exists",
//     //     //   });

//     //     // const result = await db.query(
//     //     //   `INSERT INTO "QuestionSets"("Title","Teacher_ID")
//     //     //    VALUES ($1,$2) RETURNING "Set_ID"`,
//     //     //   [title, teacherId]
//     //     // );

//     //     socket.emit("request_create_set_result", {
//     //       success: true,
//     //       // setId: result.rows[0].Set_ID,
//     //     });
//     //   } catch (err) {
//     //     socket.emit("create_set_result", {
//     //       success: false,
//     //       message: err.message,
//     //     });
//     //   }
//     // });

//     // Submit create question set
//     socket.on("submit_create_question", async ({ teacherId, title, questionset }) => {
//   try {
//     if (!teacherId || !title || !questionset?.length)
//       return socket.emit("submit_create_set_result", {
//         success: false,
//         message: "Missing data",
//       });

//     // ✅ Check duplicate title
//     const exists = await db.query(
//       `SELECT 1 FROM "QuestionSets" WHERE "Teacher_ID"=$1 AND LOWER("Title")=LOWER($2)`,
//       [teacherId, title]
//     );
//     if (exists.rowCount > 0)
//       return socket.emit("submit_create_set_result", {
//         success: false,
//         message: "This quiz name already exists",
//       });

//     // ✅ Insert Set
//     const setRes = await db.query(
//       `INSERT INTO "QuestionSets"("Title","Teacher_ID")
//        VALUES ($1,$2) RETURNING "Set_ID"`,
//       [title, teacherId]
//     );

//     const setId = setRes.rows[0].Set_ID;

//     // ✅ Insert ทุกคำถามพร้อม options
//     for (const q of questionset) {
//       const qRes = await db.query(
//         `INSERT INTO "Questions"("Set_ID","Question_Type","Question_Text","Correct_Option")
//          VALUES ($1,$2,$3,$4)
//          RETURNING "Question_ID"`,
//         [setId, q.type, q.text, 0]
//       );

//       const questionId = qRes.rows[0].Question_ID;
//       let correctOptionId = null;

//       for (let i = 0; i < q.options.length; i++) {
//         const optRes = await db.query(
//           `INSERT INTO "QuestionOptions"("Question_ID","Option_Text")
//            VALUES ($1,$2) RETURNING "Option_ID"`,
//           [questionId, q.options[i]]
//         );

//         if (q.type === "single" && q.correct[0] === i) {
//           correctOptionId = optRes.rows[0].Option_ID;
//         }
//       }

//       if (correctOptionId) {
//         await db.query(
//           `UPDATE "Questions" SET "Correct_Option"=$1 WHERE "Question_ID"=$2`,
//           [correctOptionId, questionId]
//         );
//       }
//     }

//     socket.emit("submit_create_set_result", { success: true, setId });
//   } catch (err) {
//     socket.emit("submit_create_set_result", {
//       success: false,
//       message: err.message,
//     });
//   }
// });


//     // ADD QUESTION
// //     socket.on("add_question", async (data) => {
// //   try {
// //     const { setId, type, text, options, correct } = data;

// //     if (!setId || !type || !text)
// //       return socket.emit("add_question_result", {
// //         success: false,
// //         message: "Missing required fields",
// //       });

// //     // check duplicate question
// //     const dupe = await db.query(
// //       `SELECT 1 FROM "Questions" WHERE "Set_ID"=$1 AND LOWER("Question_Text")=LOWER($2)`,
// //       [setId, text]
// //     );
// //     if (dupe.rowCount > 0)
// //       return socket.emit("add_question_result", {
// //         success: false,
// //         message: "This question already exists in the set",
// //       });

// //     // check max 40 questions
// //     const count = await db.query(
// //       `SELECT COUNT(*) FROM "Questions" WHERE "Set_ID"=$1`,
// //       [setId]
// //     );
// //     if (Number(count.rows[0].count) >= 40)
// //       return socket.emit("add_question_result", {
// //         success: false,
// //         message: "Maximum 40 questions allowed",
// //       });

// //     // 1️⃣ Insert Question ก่อน (ใส่ Correct_Option ชั่วคราวเป็น 0)
// //     const questionResult = await db.query(
// //       `INSERT INTO "Questions"("Set_ID", "Question_Type", "Question_Text", "Correct_Option")
// //        VALUES ($1, $2, $3, $4)
// //        RETURNING "Question_ID"`,
// //       [setId, type, text, 0]
// //     );

// //     const questionId = questionResult.rows[0].Question_ID;
// //     let correctOptionId = null;

// //     // 2️⃣ Insert Options ทีละตัว
// //     for (let i = 0; i < options.length; i++) {
// //       const optionResult = await db.query(
// //         `INSERT INTO "QuestionOptions"("Question_ID", "Option_Text")
// //          VALUES ($1, $2)
// //          RETURNING "Option_ID"`,
// //         [questionId, options[i]]
// //       );

// //       // กำหนด Correct_Option สำหรับ single choice
// //       if (type === "single" && correct[0] === i) {
// //         correctOptionId = optionResult.rows[0].Option_ID;
// //       }
// //     }

// //     // 3️⃣ Update Correct_Option ใน Questions
// //     if (correctOptionId) {
// //       await db.query(
// //         `UPDATE "Questions" SET "Correct_Option"=$1 WHERE "Question_ID"=$2`,
// //         [correctOptionId, questionId]
// //       );
// //     }

// //     socket.emit("add_question_result", { success: true });
// //   } catch (err) {
// //     socket.emit("add_question_result", {
// //       success: false,
// //       message: err.message,
// //     });
// //   }
// // });

// // GET Questions in a Set
// socket.on("get_questions_in_set", async (setId) => {
//   try {
//     const result = await db.query(
//       `SELECT q."Question_ID", q."Question_Text", q."Question_Type",
//               json_agg(
//                 json_build_object(
//                   'id', o."Option_ID",
//                   'text', o."Option_Text"
//                 ) ORDER BY o."Option_ID"
//               ) AS options,
//               q."Correct_Option"
//        FROM "Questions" q
//        LEFT JOIN "QuestionOptions" o
//          ON q."Question_ID" = o."Question_ID"
//        WHERE q."Set_ID" = $1
//        GROUP BY q."Question_ID"
//        ORDER BY q."Question_ID" ASC`,
//       [setId]
//     );

//     socket.emit("questions_in_set_data", result.rows);
//     console.log("Sending questions for set", setId, result.rows);
//   } catch (err) {
//     console.error(err);
//     socket.emit("questions_in_set_data", { error: err.message });
//   }
// });


//   });
// };





// const express = require("express");
// const router = express.Router();
// const db = require("../db");

// module.exports = (io) => {
//   io.on("connection", (socket) => {
//     console.log("✅ Quiz socket connected:", socket.id);

//     // ===============================
//     // ✅ GET All Question Sets of a Teacher
//     // ===============================
//     socket.on("get_question_sets", async (teacherId) => {
//       console.log("✅ get_question_sets:", teacherId);
//       try {
//         const result = await db.query(
//           `SELECT * FROM "QuestionSets" 
//            WHERE "Teacher_ID"=$1 
//            ORDER BY "Set_ID" ASC`,
//           [teacherId]
//         );

//         socket.emit("question_sets_data", result.rows);
//         console.log("✅ Sending question sets:", result.rows);
//       } catch (err) {
//         console.error("❌ get_question_sets error:", err.message);
//         socket.emit("question_sets_data", { error: err.message });
//       }
//     });

//     // ===============================
//     // ✅ SUBMIT CREATE QUESTION SET
//     // ===============================
//     socket.on("submit_create_question", async (data) => {
//       console.log("✅ BACKEND RECEIVED submit_create_question:", data);

//       try {
//         const { teacherId, title, question_last_edit, questionset } = data;

//         if (!teacherId || !title || !question_last_edit || !questionset || !questionset.length) {
//           console.log("❌ Missing data");
//           return socket.emit("submit_create_set_result", {
//             success: false,
//             message: "Missing data",
//           });
//         }

//         // ✅ Check duplicate title
//         const exists = await db.query(
//           `SELECT 1 FROM "QuestionSets" 
//            WHERE "Teacher_ID"=$1 AND LOWER("Title")=LOWER($2)`,
//           [teacherId, title]
//         );

//         if (exists.rowCount > 0) {
//           console.log("❌ Duplicate title");
//           return socket.emit("submit_create_set_result", {
//             success: false,
//             message: "This quiz name already exists",
//           });
//         }

//         // ✅ Insert Set
//         const setRes = await db.query(
//           `INSERT INTO "QuestionSets"("Title","Teacher_ID","Question_Last_Edit")
//            VALUES ($1,$2,$3) 
//            RETURNING "Set_ID"`,
//           [title, teacherId, question_last_edit]
//         );

//         const setId = setRes.rows[0].Set_ID;
//         console.log("✅ Created Set_ID:", setId);

//         // ✅ Insert Questions + Options
//         for (const q of questionset) {
//           console.log("➡️ Insert question:", q);

//           const qRes = await db.query(
//             `INSERT INTO "Questions"("Set_ID","Question_Type","Question_Text","Correct_Option","Question_Image")
//              VALUES ($1,$2,$3,$4,$5)
//              RETURNING "Question_ID"`,
//             [setId, q.type, q.text, 0, q.image]
//           );

//           const questionId = qRes.rows[0].Question_ID;
//           let correctOptionId = null;

//           for (let i = 0; i < q.options.length; i++) {
//             const optRes = await db.query(
//               `INSERT INTO "QuestionOptions"("Question_ID","Option_Text")
//                VALUES ($1,$2)
//                RETURNING "Option_ID"`,
//               [questionId, q.options[i]]
//             );

//             if (q.type === "single" && q.correct?.[0] === i) {
//               correctOptionId = optRes.rows[0].Option_ID;
//             }
//           }

//           if (correctOptionId) {
//             await db.query(
//               `UPDATE "Questions" 
//                SET "Correct_Option"=$1 
//                WHERE "Question_ID"=$2`,
//               [correctOptionId, questionId]
//             );
//           }
//         }

//         console.log("✅ CREATE SET SUCCESS");
//         socket.emit("submit_create_set_result", {
//           success: true,
//           setId,
//         });

//       } catch (err) {
//         console.error("❌ submit_create_question error:", err.message);
//         socket.emit("submit_create_set_result", {
//           success: false,
//           message: err.message,
//         });
//       }
//     });

//     // ===============================
//     // ✅ GET Questions in a Set
//     // ===============================
//     socket.on("get_questions_in_set", async (setId) => {
//       console.log("✅ get_questions_in_set:", setId);
//       try {
//         const result = await db.query(
//           `SELECT q."Question_ID", q."Question_Text", q."Question_Type",
//                   json_agg(
//                     json_build_object(
//                       'id', o."Option_ID",
//                       'text', o."Option_Text"
//                     ) ORDER BY o."Option_ID"
//                   ) AS options,
//                   q."Correct_Option"
//            FROM "Questions" q
//            LEFT JOIN "QuestionOptions" o
//              ON q."Question_ID" = o."Question_ID"
//            WHERE q."Set_ID" = $1
//            GROUP BY q."Question_ID"
//            ORDER BY q."Question_ID" ASC`,
//           [setId]
//         );

//         socket.emit("questions_in_set_data", result.rows);
//         console.log("✅ Sending questions for set", setId);
//       } catch (err) {
//         console.error("❌ get_questions_in_set error:", err.message);
//         socket.emit("questions_in_set_data", { error: err.message });
//       }
//     });

//   });
// };




const db = require("../db");

module.exports = (socket) => {
  console.log("✅ Quiz socket ready:", socket.id);

  // ===============================
  // ✅ GET All Question Sets of a Teacher
  // ===============================
  socket.on("get_question_sets", async (teacherId) => {
    console.log("✅ get_question_sets:", teacherId);

    try {
      const result = await db.query(
        `SELECT *
         FROM "QuestionSets"
         WHERE "Teacher_ID" = $1
         ORDER BY "Set_ID" ASC`,
        [teacherId]
      );

      socket.emit("question_sets_data", result.rows);
    } catch (err) {
      console.error("❌ get_question_sets error:", err.message);
      socket.emit("question_sets_data", { error: err.message });
    }
  });

  // ===============================
  // ✅ CREATE QUESTION SET
  // ===============================
  socket.on("submit_create_question", async (data) => {
    console.log("✅ submit_create_question payload:", data);

    try {
      const { teacherId, title, question_last_edit, questionset } = data;

      if (!teacherId || !title || !question_last_edit || !questionset?.length) {
        return socket.emit("submit_create_set_result", {
          success: false,
          message: "Missing data",
        });
      }

      // 🔍 Check duplicate title
      const exists = await db.query(
        `SELECT 1
         FROM "QuestionSets"
         WHERE "Teacher_ID" = $1
           AND LOWER("Title") = LOWER($2)`,
        [teacherId, title]
      );

      if (exists.rowCount > 0) {
        return socket.emit("submit_create_set_result", {
          success: false,
          message: "This quiz name already exists",
        });
      }

      // ➕ Insert Question Set
      const setRes = await db.query(
        `INSERT INTO "QuestionSets"
         ("Title","Teacher_ID","Question_Last_Edit")
         VALUES ($1,$2,$3)
         RETURNING "Set_ID"`,
        [title, teacherId, question_last_edit]
      );

      const setId = setRes.rows[0].Set_ID;

      // ➕ Insert Questions & Options
      for (const q of questionset) {
        const qRes = await db.query(
          `INSERT INTO "Questions"
           ("Set_ID","Question_Type","Question_Text","Correct_Option","Question_Image")
           VALUES ($1,$2,$3,$4,$5)
           RETURNING "Question_ID"`,
          [setId, q.type, q.text, 0, q.image || null]
        );

        const questionId = qRes.rows[0].Question_ID;
        let correctOptionId = null;

        for (let i = 0; i < q.options.length; i++) {
          const optRes = await db.query(
            `INSERT INTO "QuestionOptions"
             ("Question_ID","Option_Text")
             VALUES ($1,$2)
             RETURNING "Option_ID"`,
            [questionId, q.options[i]]
          );

          if (q.type === "single" && q.correct?.[0] === i) {
            correctOptionId = optRes.rows[0].Option_ID;
          }
        }

        if (correctOptionId) {
          await db.query(
            `UPDATE "Questions"
             SET "Correct_Option" = $1
             WHERE "Question_ID" = $2`,
            [correctOptionId, questionId]
          );
        }
      }

      socket.emit("submit_create_set_result", {
        success: true,
        setId,
      });

    } catch (err) {
      console.error("❌ submit_create_question error:", err.message);
      socket.emit("submit_create_set_result", {
        success: false,
        message: err.message,
      });
    }
  });

  // ===============================
  // ✅ GET QUESTIONS IN A SET
  // ===============================
  socket.on("get_questions_in_set", async (setId) => {
    console.log("✅ get_questions_in_set:", setId);

    try {
      const result = await db.query(
        `SELECT
          q."Question_ID",
          q."Question_Text",
          q."Question_Type",
          json_agg(
            json_build_object(
              'id', o."Option_ID",
              'text', o."Option_Text"
            )
            ORDER BY o."Option_ID"
          ) AS options,
          q."Correct_Option"
         FROM "Questions" q
         LEFT JOIN "QuestionOptions" o
           ON q."Question_ID" = o."Question_ID"
         WHERE q."Set_ID" = $1
         GROUP BY q."Question_ID"
         ORDER BY q."Question_ID" ASC`,
        [setId]
      );

      socket.emit("questions_in_set_data", result.rows);
    } catch (err) {
      console.error("❌ get_questions_in_set error:", err.message);
      socket.emit("questions_in_set_data", { error: err.message });
    }
  });
};
