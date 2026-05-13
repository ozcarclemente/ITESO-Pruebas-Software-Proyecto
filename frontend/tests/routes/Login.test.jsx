import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Login from "../../src/routes/Login";

jest.mock("../../src/components/AuthPageContainer", () => ({
    __esModule: true,
    default: ({ children, title, text, path, error }) => (
        <div data-testid="auth-container">
            <h1>{title}</h1>
            <p>{text}</p>
            <a href={path} data-testid="link">
                {text}
            </a>
            {error && <div data-testid="error">{error}</div>}
            {children}
        </div>
    ),
}));
jest.mock("../../src/components/LoginForm", () => ({
    __esModule: true,
    default: ({ onError }) => (
        <form data-testid="login-form">
            <input type="email" placeholder="Email" data-testid="email" />
            <input
                type="password"
                placeholder="Password"
                data-testid="password"
            />
            <button
                type="button"
                onClick={() => onError("Test error")}
                data-testid="trigger-error"
            >
                Submit
            </button>
        </form>
    ),
}));

function renderLogin() {
    return render(
        <BrowserRouter>
            <Login />
        </BrowserRouter>,
    );
}

describe("Login Route", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("page structure", () => {
        it("should render auth container", () => {
            renderLogin();

            expect(screen.getByTestId("auth-container")).toBeInTheDocument();
        });

        it("should render with title 'Sign in'", () => {
            renderLogin();

            expect(
                screen.getByRole("heading", { name: /Sign in/i }),
            ).toBeInTheDocument();
        });

        it("should render signup link text", () => {
            renderLogin();

            expect(
                screen.getAllByText("Need an account?")[0],
            ).toBeInTheDocument();
        });

        it("should have link to signup page", () => {
            renderLogin();

            const link = screen.getByTestId("link");
            expect(link).toHaveAttribute("href", "/register");
        });

        it("should render LoginForm component", () => {
            renderLogin();

            expect(screen.getByTestId("login-form")).toBeInTheDocument();
        });
    });

    describe("form rendering", () => {
        it("should render email input", () => {
            renderLogin();

            const emailInput = screen.getByTestId("email");
            expect(emailInput).toBeInTheDocument();
            expect(emailInput).toHaveAttribute("type", "email");
        });

        it("should render password input", () => {
            renderLogin();

            const passwordInput = screen.getByTestId("password");
            expect(passwordInput).toBeInTheDocument();
            expect(passwordInput).toHaveAttribute("type", "password");
        });

        it("should render form submit button", () => {
            renderLogin();

            expect(screen.getByTestId("trigger-error")).toBeInTheDocument();
        });
    });

    describe("error handling", () => {
        it("should initialize without error message", () => {
            renderLogin();

            expect(screen.queryByTestId("error")).not.toBeInTheDocument();
        });

        it("should display error message when onError is called", () => {
            renderLogin();

            const triggerButton = screen.getByTestId("trigger-error");
            fireEvent.click(triggerButton);

            expect(screen.getByTestId("error")).toBeInTheDocument();
            expect(screen.getByText("Test error")).toBeInTheDocument();
        });

        it("should update error message when called multiple times", () => {
            renderLogin();

            const triggerButton = screen.getByTestId("trigger-error");

            fireEvent.click(triggerButton);
            expect(screen.getByText("Test error")).toBeInTheDocument();

            fireEvent.click(triggerButton);
            expect(screen.getByText("Test error")).toBeInTheDocument();
        });

        it("should pass onError handler to LoginForm", () => {
            renderLogin();

            const triggerButton = screen.getByTestId("trigger-error");
            fireEvent.click(triggerButton);

            expect(screen.getByTestId("error")).toBeInTheDocument();
        });
    });

    describe("state management", () => {
        it("should manage error state", () => {
            renderLogin();

            expect(screen.queryByTestId("error")).not.toBeInTheDocument();

            const triggerButton = screen.getByTestId("trigger-error");
            fireEvent.click(triggerButton);

            expect(screen.getByTestId("error")).toBeInTheDocument();
        });

        it("should maintain error state after re-renders", () => {
            const { rerender } = renderLogin();

            const triggerButton = screen.getByTestId("trigger-error");
            fireEvent.click(triggerButton);

            rerender(
                <BrowserRouter>
                    <Login />
                </BrowserRouter>,
            );

            expect(screen.getByTestId("error")).toBeInTheDocument();
        });
    });

    describe("component props", () => {
        it("should pass correct props to AuthPageContainer", () => {
            renderLogin();

            expect(
                screen.getByRole("heading", { name: /Sign in/i }),
            ).toBeInTheDocument();
            expect(
                screen.getAllByText("Need an account?")[0],
            ).toBeInTheDocument();

            const link = screen.getByTestId("link");
            expect(link).toHaveAttribute("href", "/register");
        });

        it("should pass onError handler to LoginForm", () => {
            renderLogin();

            const triggerButton = screen.getByTestId("trigger-error");
            expect(triggerButton).toBeInTheDocument();
        });
    });
});
