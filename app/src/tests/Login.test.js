import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Login from "../Login";
import { signInWithEmailAndPassword } from "firebase/auth";

// Mock Firebase auth functions
jest.mock("firebase/auth", () => ({
  signInWithEmailAndPassword: jest.fn(),
}));

describe("Login Component", () => {
  test("renders login form", () => {
    render(<Login onLoginSuccess={jest.fn()} />);

    expect(screen.getByText(/Welcome Back/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
  });

  test("handles login attempt with incorrect credentials", async () => {
    signInWithEmailAndPassword.mockRejectedValue(new Error("Invalid credentials"));

    render(<Login onLoginSuccess={jest.fn()} />);

    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: "wrongpassword" } });

    fireEvent.click(screen.getByText(/Sign In/i));

    await waitFor(() => {
      expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument();
    });
  });
});
