import { render, screen, fireEvent } from "@testing-library/react";
// 🔹 แก้ไข Path ตรงนี้
import Register from "../Page/Auth/Register"; 
import { BrowserRouter } from "react-router-dom";
import { socket } from "../socket";

describe("Register Test Suite", () => {
  test("ควรแสดงข้อความผิดพลาดเมื่อ Email ผิดรูปแบบ", () => {
    render(<BrowserRouter><Register /></BrowserRouter>);
    const emailInput = screen.getByLabelText(/email/i);
    
    fireEvent.change(emailInput, { target: { value: "wrong-email" } });
    expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
  });

  test("ควรส่งข้อมูล register เมื่อกรอกข้อมูลถูกต้อง", () => {
    render(<BrowserRouter><Register /></BrowserRouter>);
    
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: "John" } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "john@test.com" } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "password123" } });
    
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));
    expect(socket.emit).toHaveBeenCalledWith("register", expect.any(Object));
  });
});