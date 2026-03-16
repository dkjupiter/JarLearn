// src/__mocks__/socket.js
export const socket = {
  on: jest.fn(),
  off: jest.fn(),
  emit: jest.fn(),
  once: jest.fn(),
};