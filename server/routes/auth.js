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
        `
        SELECT
          "Teacher_ID"   AS teacher_id,
          "Teacher_Name" AS teacher_name,
          "Teacher_Email" AS teacher_email
        FROM "Teachers"
        WHERE "Teacher_Email"=$1 AND "Teacher_Password"=$2
        `,
        [email, password]
      );

      if (result.rows.length > 0) {
        const user = result.rows[0];
        console.log("LOGIN RESULT ROW:", result.rows[0]);

        socket.emit("login_result", {
          success: true,
          user: {
            id: user.teacher_id,
            name: user.teacher_name,
            email: user.teacher_email,
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

  socket.on("check_email", async (data) => {

    try {

      const { email } = data;

      const result = await db.query(
        'SELECT * FROM "Teachers" WHERE "Teacher_Email" = $1',
        [email]
      );

      if (result.rows.length > 0) {

        socket.emit("check_email_result", {
          success: true
        });

      } else {

        socket.emit("check_email_result", {
          success: false
        });

      }

    } catch (err) {

      socket.emit("check_email_result", {
        success: false,
        message: err.message
      });

    }

  });

  const crypto = require("crypto");
  const nodemailer = require("nodemailer");
  const bcrypt = require("bcrypt");

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  console.log(process.env.EMAIL_USER);
  console.log(process.env.EMAIL_PASS);

  socket.on("forgot_password", async ({ email }) => {

    const user = await db.query(
      'SELECT * FROM "Teachers" WHERE "Teacher_Email"=$1',
      [email]
    );

    if (user.rows.length === 0) {
      socket.emit("forgot_result", {
        success: false,
        message: "Email not found"
      });
      return;
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expire = Date.now() + 1000 * 60 * 15;

    await db.query(
      `UPDATE "Teachers"
     SET "Reset_Token"=$1,
         "Reset_Token_Expire"=$2
     WHERE "Teacher_Email"=$3`,
      [token, expire, email]
    );

    const resetLink = `http://localhost:3000/reset-password/${token}`;

    await transporter.sendMail({
      to: email,
      subject: "Reset Password",
      html: `
      <h3>Password Reset</h3>
      <p>Click this link to reset password</p>
      <a href="${resetLink}">${resetLink}</a>
    `
    });

    socket.emit("forgot_result", { success: true });

  });

  socket.on("reset_password", async ({ token, newPassword }) => {

    const result = await db.query(
      `SELECT * FROM "Teachers"
     WHERE "Reset_Token"=$1`,
      [token]
    );

    if (result.rows.length === 0) {
      socket.emit("reset_result", {
        success: false,
        message: "Invalid token"
      });
      return;
    }

    const user = result.rows[0];

    if (Date.now() > user.Reset_Token_Expire) {
      socket.emit("reset_result", {
        success: false,
        message: "Token expired"
      });
      return;
    }

    const hash = await bcrypt.hash(newPassword, 10);

    await db.query(
      `UPDATE "Teachers"
     SET "Teacher_Password"=$1,
         "Reset_Token"=NULL,
         "Reset_Token_Expire"=NULL
     WHERE "Teacher_ID"=$2`,
      [hash, user.Teacher_ID]
    );

    socket.emit("reset_result", { success: true });

  });
};