import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LoginForm from "../../src/components/LoginForm/LoginForm";
import { useAuth } from "../../src/context/AuthContext";
import userLogin from "../../src/services/userLogin";

// 1. MOCK DEL SERVICIO
jest.mock("../../src/services/userLogin");

// 2. MOCK DEL CONTEXTO: En lugar del Provider, mockeamos el custom hook
jest.mock("../../src/context/AuthContext", () => ({
    useAuth: jest.fn(),
}));

// 3. MOCK DEL ROUTER
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: () => mockNavigate,
}));

describe("LoginForm Component", () => {
    const mockSetAuthState = jest.fn();
    const mockOnError = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        // Le decimos a Jest que cuando LoginForm llame a useAuth(), le devuelva esta función falsa
        useAuth.mockReturnValue({
            setAuthState: mockSetAuthState,
        });
    });

    it("debe renderizar los campos de email y password", () => {
        // Ya no necesitamos envolverlo en el Provider
        render(<LoginForm onError={mockOnError} />);

        expect(screen.getByPlaceholderText("Email")).toBeDefined();
        expect(screen.getByPlaceholderText("Password")).toBeDefined();
        expect(screen.getByRole("button", { name: /login/i })).toBeDefined();
    });

    it("debe llamar a userLogin y redirigir al hacer submit exitoso", async () => {
        userLogin.mockResolvedValue({ user: { token: "fake-token" } });

        render(<LoginForm onError={mockOnError} />);

        fireEvent.change(screen.getByPlaceholderText("Email"), {
            target: { name: "email", value: "test@mail.com" },
        });
        fireEvent.change(screen.getByPlaceholderText("Password"), {
            target: { name: "password", value: "password123" },
        });

        fireEvent.click(screen.getByRole("button", { name: /login/i }));

        await waitFor(() => {
            expect(userLogin).toHaveBeenCalledWith({
                email: "test@mail.com",
                password: "password123",
            });
            expect(mockSetAuthState).toHaveBeenCalledWith({
                user: { token: "fake-token" },
            });
            expect(mockNavigate).toHaveBeenCalledWith("/");
        });
    });

    it("debe llamar a onError si el login falla en el backend", async () => {
        const fakeError = new Error("Invalid credentials");
        userLogin.mockRejectedValue(fakeError);

        render(<LoginForm onError={mockOnError} />);

        fireEvent.change(screen.getByPlaceholderText("Email"), {
            target: { name: "email", value: "test@mail.com" },
        });
        fireEvent.change(screen.getByPlaceholderText("Password"), {
            target: { name: "password", value: "wrongpass" },
        });

        fireEvent.click(screen.getByRole("button", { name: /login/i }));

        await waitFor(() => {
            expect(mockOnError).toHaveBeenCalledWith(fakeError);
            expect(mockSetAuthState).not.toHaveBeenCalled();
            expect(mockNavigate).not.toHaveBeenCalled();
        });
    });
});
