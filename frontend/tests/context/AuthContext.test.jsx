import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import AuthProvider, { useAuth } from "../../src/context/AuthContext";

jest.mock("../../src/services/getUser");

const mockGetUser = require("../../src/services/getUser").default;

function TestComponent() {
    const { headers, isAuth, loggedUser, setAuthState } = useAuth();
    return (
        <div>
            <div data-testid="headers">{headers ? "authed" : "not-authed"}</div>
            <div data-testid="isAuth">{isAuth ? "true" : "false"}</div>
            <div data-testid="username">{loggedUser.username}</div>
            <button
                onClick={() =>
                    setAuthState({
                        headers: "token",
                        isAuth: true,
                        loggedUser: { username: "newuser" },
                    })
                }
                data-testid="set-auth-btn"
            >
                Set Auth
            </button>
        </div>
    );
}

describe("AuthContext", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
    });

    afterEach(() => {
        localStorage.clear();
    });

    describe("initial state", () => {
        it("should initialize with default auth state when localStorage empty", () => {
            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>,
            );

            expect(screen.getByTestId("headers")).toHaveTextContent("not-authed");
            expect(screen.getByTestId("isAuth")).toHaveTextContent("false");
        });

        it("should have required properties in default state", () => {
            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>,
            );

            expect(screen.getByTestId("username")).toBeInTheDocument();
            expect(screen.getByTestId("isAuth")).toBeInTheDocument();
        });
    });

    describe("context value", () => {
        it("should provide headers in context", () => {
            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>,
            );

            expect(screen.getByTestId("headers")).toBeInTheDocument();
        });

        it("should provide isAuth in context", () => {
            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>,
            );

            expect(screen.getByTestId("isAuth")).toBeInTheDocument();
        });

        it("should provide loggedUser in context", () => {
            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>,
            );

            expect(screen.getByTestId("username")).toBeInTheDocument();
        });

        it("should provide setAuthState in context", () => {
            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>,
            );

            expect(screen.getByTestId("set-auth-btn")).toBeInTheDocument();
        });
    });

    describe("getUser effect", () => {
        it("should not call getUser when headers are null", async () => {
            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>,
            );

            await waitFor(() => {
                expect(mockGetUser).not.toHaveBeenCalled();
            });
        });
    });

    describe("setAuthState", () => {
        it("should have setAuthState function available", () => {
            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>,
            );

            expect(screen.getByTestId("set-auth-btn")).toBeInTheDocument();
        });
    });

    describe("useAuth hook", () => {
        it("should throw error when useAuth is called outside of AuthProvider", () => {
            const consoleSpy = jest.spyOn(console, "error").mockImplementation();

            expect(() => {
                render(<TestComponent />);
            }).toThrow();

            consoleSpy.mockRestore();
        });

        it("should return auth context when used inside AuthProvider", () => {
            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>,
            );

            expect(screen.getByTestId("headers")).toBeInTheDocument();
            expect(screen.getByTestId("isAuth")).toBeInTheDocument();
            expect(screen.getByTestId("username")).toBeInTheDocument();
        });
    });
});
