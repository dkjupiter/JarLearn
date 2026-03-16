// src/__tests__/App.test.js

import { render, screen, fireEvent } from "@testing-library/react";
import App from "../Page/Auth/App";
import { BrowserRouter } from "react-router-dom";
import { socket } from "../socket";

// 🔹 ลองเปลี่ยนวิธี Import เป็นแบบนี้ (ถอด { } ออกหากเป็น Default Export)
import * as TeacherModule from "../Page/TeacherContext"; 

// ดึง Context ออกมาจากโมดูล
const TeacherContext = TeacherModule.TeacherContext;

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ state: {} }),
}));

// 🔹 หากด้านบนยังไม่ได้ ให้ใช้การ Mock useTeacher แทน (วิธีที่ชัวร์ที่สุด)
jest.mock("../Page/TeacherContext", () => ({
  useTeacher: () => ({
    setTeacherId: jest.fn(),
  }),
  // ใส่ Provider หลอกๆ ไว้กัน Error ใน Render
  TeacherContext: {
    Provider: ({ children }) => <div>{children}</div>,
  }
}));

const renderApp = () => {
  return render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
};

describe("Login Test Suite", () => {
  test("ควรเรียก handleLogin และ emit 'login' เมื่อข้อมูลครบ", () => {
    renderApp();
    
    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);
    const signInButton = screen.getByRole("button", { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: "test@test.com" } });
    fireEvent.change(passwordInput, { target: { value: "12345678" } });
    fireEvent.click(signInButton);

    expect(socket.emit).toHaveBeenCalledWith("login", {
      email: "test@test.com",
      password: "12345678",
    });
  });
});