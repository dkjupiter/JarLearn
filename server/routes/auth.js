const db = require("../db");

module.exports = (socket) => {
  console.log("Auth socket ready:", socket.id);

  // 🔐 Register
  socket.on("register", async (data) => {
    try {
      const { name, email, password } = data;

      if (password.length < 8) {
        return socket.emit("register_result", {
          success: false,
          message: "Password must be at least 8 characters long",
        });
      }

      if (!passwordRegex.test(password)) {
        return socket.emit("register_result", {
          success: false,
          message: "Password contains invalid characters",
        });
      }

      const check = await db.query(
        'SELECT * FROM "Teachers" WHERE "Teacher_Email" = $1',
        [email]
      );

      if (check.rows.length > 0) {
        socket.emit("register_result", {
          success: false,
          message: "Email already exists",
        });
        return;
      }

      await db.query(
        'INSERT INTO "Teachers"("Teacher_Name","Teacher_Email","Teacher_Password") VALUES($1,$2,$3)',
        [name, email, password]
      );

      socket.emit("register_result", { success: true });
    } catch (err) {
      console.error("Register error:", err);
      socket.emit("register_result", {
        success: false,
        message: err.message,
      });
    }
  });

  // 🔐 Login
  socket.on("login", async (data) => {
    try {
      const { email, password } = data;

      const result = await db.query(
        'SELECT * FROM "Teachers" WHERE "Teacher_Email"=$1 AND "Teacher_Password"=$2',
        [email, password]
      );

      if (result.rows.length > 0) {
        const user = result.rows[0];

        socket.emit("login_result", {
          success: true,
          user: {
            id: user.Teacher_ID,
            name: user.Teacher_Name,
            email: user.Teacher_Email,
          },
        });
      } else {
        socket.emit("login_result", {
          success: false,
          message: "Incorrect email or password",
        });
      }
    } catch (err) {
      console.error("Login error:", err);
      socket.emit("login_result", {
        success: false,
        message: err.message,
      });
    }
  });
};
