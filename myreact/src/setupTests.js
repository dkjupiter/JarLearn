// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom

import "@testing-library/jest-dom"; // เพิ่มบรรทัดนี้เพื่อให้ใช้พวก .toBeInTheDocument() ได้
import { socket } from "./socket"; 

jest.mock("./socket", () => ({
  socket: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
    once: jest.fn(),
  },
}));