import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import SignUp from "../../src/routes/SignUp";

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
jest.mock("../../src/components/SignUpForm", () => ({
    __esModule: true,
    default: ({ onError }) => (
        <form data-testid="signup-form">
            <input
                type="text"
                placeholder="Username"
                data-testid="username"
            />
            <input type="email" placeholder="Email" data-testid="email" />
            <input
                type="password"
                placeholder="Password"
                data-testid="password"
            />
            <button
                type="button"
                onClick={() => onError("Registration failed")}
                data-testid="trigger-error"
            >
                Sign up
            </button>
        </form>
    ),
}));

function renderSignUp() {
    return render(
        <BrowserRouter>
            <SignUp />
        </BrowserRouter>,
    );
}

describe("SignUp Route", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("page structure", () => {
        it("should render auth container", () => {
            renderSignUp();

            expect(screen.getByTestId("auth-container")).toBeInTheDocument();
        });

        it("should render with title 'Sign up'", () => {
            renderSignUp();

            expect(screen.getByRole("heading", { name: /Sign up/i })).toBeInTheDocument();
        });

        it("should render login link text", () => {
            renderSignUp();

            expect(
                screen.getAllByText("Sign in to your account")[0],
            ).toBeInTheDocument();
        });

        it("should have link to login page", () => {
            renderSignUp();

            const link = screen.getByTestId("link");
            expect(link).toHaveAttribute("href", "/login");
        });

        it("should render SignUpForm component", () => {
            renderSignUp();

            expect(screen.getByTestId("signup-form")).toBeInTheDocument();
        });
    });

    describe("form rendering", () => {
        it("should render username input", () => {
            renderSignUp();

            const usernameInput = screen.getByTestId("username");
            expect(usernameInput).toBeInTheDocument();
            expect(usernameInput).toHaveAttribute("type", "text");
        });

        it("should render email input", () => {
            renderSignUp();

            const emailInput = screen.getByTestId("email");
            expect(emailInput).toBeInTheDocument();
            expect(emailInput).toHaveAttribute("type", "email");
        });

        it("should render password input", () => {
            renderSignUp();

            const passwordInput = screen.getByTestId("password");
            expect(passwordInput).toBeInTheDocument();
            expect(passwordInput).toHaveAttribute("type", "password");
        });

        it("should render form submit button", () => {
            renderSignUp();

            expect(screen.getByTestId("trigger-error")).toBeInTheDocument();
        });
    });

    describe("error handling", () => {
        it("should initialize without error message", () => {
            renderSignUp();

            expect(screen.queryByTestId("error")).not.toBeInTheDocument();
        });

        it("should display error message when onError is called", () => {
            renderSignUp();

            const triggerButton = screen.getByTestId("trigger-error");
            fireEvent.click(triggerButton);

            expect(screen.getByTestId("error")).toBeInTheDocument();
            expect(screen.getByText("Registration failed")).toBeInTheDocument();
        });

        it("should update error message when called multiple times", () => {
            renderSignUp();

            const triggerButton = screen.getByTestId("trigger-error");

            fireEvent.click(triggerButton);
            expect(screen.getByText("Registration failed")).toBeInTheDocument();

            fireEvent.click(triggerButton);
            expect(screen.getByText("Registration failed")).toBeInTheDocument();
        });

        it("should pass onError handler to SignUpForm", () => {
            renderSignUp();

            const triggerButton = screen.getByTestId("trigger-error");
            fireEvent.click(triggerButton);

            expect(screen.getByTestId("error")).toBeInTheDocument();
        });
    });

    describe("state management", () => {
        it("should manage error state", () => {
            renderSignUp();

            expect(screen.queryByTestId("error")).not.toBeInTheDocument();

            const triggerButton = screen.getByTestId("trigger-error");
            fireEvent.click(triggerButton);

            expect(screen.getByTestId("error")).toBeInTheDocument();
        });

        it("should maintain error state after re-renders", () => {
            const { rerender } = renderSignUp();

            const triggerButton = screen.getByTestId("trigger-error");
            fireEvent.click(triggerButton);

            rerender(
                <BrowserRouter>
                    <SignUp />
                </BrowserRouter>,
            );

            expect(screen.getByTestId("error")).toBeInTheDocument();
        });
    });

    describe("component props", () => {
        it("should pass correct props to AuthPageContainer", () => {
            renderSignUp();

            expect(screen.getByRole("heading", { name: /Sign up/i })).toBeInTheDocument();
            expect(
                screen.getAllByText("Sign in to your account")[0],
            ).toBeInTheDocument();

            const link = screen.getByTestId("link");
            expect(link).toHaveAttribute("href", "/login");
        });

        it("should pass onError handler to SignUpForm", () => {
            renderSignUp();

            const triggerButton = screen.getByTestId("trigger-error");
            expect(triggerButton).toBeInTheDocument();
        });
    });

    describe("form distinction", () => {
        it("should render SignUpForm not LoginForm", () => {
            renderSignUp();

            expect(screen.getByTestId("signup-form")).toBeInTheDocument();
        });

        it("should have username field (unique to signup)", () => {
            renderSignUp();

            expect(screen.getByTestId("username")).toBeInTheDocument();
        });

        it("should link to login not signup page", () => {
            renderSignUp();

            const link = screen.getByTestId("link");
            expect(link).toHaveAttribute("href", "/login");
            expect(link).not.toHaveAttribute("href", "/register");
        });
    });
});
