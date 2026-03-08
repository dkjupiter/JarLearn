const db = require("../db");

module.exports = (io, socket) => {
    socket.on("send_board_message", async ({ boardId, studentId, message }) => {

        const result = await db.query(`
                INSERT INTO "InteractiveBoardMessages"
                ("Board_ID","Student_ID","Message")
                VALUES ($1,$2,$3)
                RETURNING *
                `, [boardId, studentId, message])

        io.emit("board_message", result.rows[0])

    })
};