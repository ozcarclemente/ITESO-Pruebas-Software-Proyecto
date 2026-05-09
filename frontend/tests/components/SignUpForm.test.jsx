import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SignUpForm from "../../src/components/SignUpForm/SignUpForm";
import { useAuth } from "../../src/context/AuthContext";
import userSignUp from "../../src/services/userSignUp";

// 1. MOCK DEL SERVICIO (Ahora es userSignUp)
jest.mock("../../src/services/userSignUp");

// 2. MOCK DEL CONTEXTO
jest.mock("../../src/context/AuthContext", () => ({
    useAuth: jest.fn(),
}));

// 3. MOCK DEL ROUTER
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: () => mockNavigate,
}));

describe("SignUpForm Component", () => {
    const mockSetAuthState = jest.fn();
    const mockOnError = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        useAuth.mockReturnValue({
            setAuthState: mockSetAuthState,
        });
    });

    it("debe renderizar los campos de username, email y password", () => {
        render(<SignUpForm onError={mockOnError} />);

        // Verificamos el nuevo input
        expect(screen.getByPlaceholderText("Your Name")).toBeDefined();
        expect(screen.getByPlaceholderText("Email")).toBeDefined();
        expect(screen.getByPlaceholderText("Password")).toBeDefined();
        // Buscamos el botón por su nuevo nombre
        expect(screen.getByRole("button", { name: /sign up/i })).toBeDefined();
    });

    it("debe llamar a userSignUp y redirigir al hacer submit exitoso", async () => {
        userSignUp.mockResolvedValue({ user: { token: "fake-token" } });

        render(<SignUpForm onError={mockOnError} />);

        // Llenamos los 3 campos
        fireEvent.change(screen.getByPlaceholderText("Your Name"), {
            target: { name: "username", value: "testuser" },
        });
        fireEvent.change(screen.getByPlaceholderText("Email"), {
            target: { name: "email", value: "test@mail.com" },
        });
        fireEvent.change(screen.getByPlaceholderText("Password"), {
            target: { name: "password", value: "password123" },
        });

        fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

        await waitFor(() => {
            // Verificamos que la API mockeada reciba los 3 valores correctos
            expect(userSignUp).toHaveBeenCalledWith({
                username: "testuser",
                email: "test@mail.com",
                password: "password123",
            });
            expect(mockSetAuthState).toHaveBeenCalledWith({
                user: { token: "fake-token" },
            });
            expect(mockNavigate).toHaveBeenCalledWith("/");
        });
    });

    it("debe llamar a onError si el registro falla en el backend", async () => {
        const fakeError = new Error("Username already taken");
        userSignUp.mockRejectedValue(fakeError);

        render(<SignUpForm onError={mockOnError} />);

        fireEvent.change(screen.getByPlaceholderText("Your Name"), {
            target: { name: "username", value: "testuser" },
        });
        fireEvent.change(screen.getByPlaceholderText("Email"), {
            target: { name: "email", value: "test@mail.com" },
        });
        fireEvent.change(screen.getByPlaceholderText("Password"), {
            target: { name: "password", value: "password123" },
        });

        fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

        await waitFor(() => {
            expect(mockOnError).toHaveBeenCalledWith(fakeError);
            expect(mockSetAuthState).not.toHaveBeenCalled();
            expect(mockNavigate).not.toHaveBeenCalled();
        });
    });
});
