import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect, jest } from "@jest/globals";
import AuthPageContainer from "../../src/components/AuthPageContainer/AuthPageContainer";

jest.mock("../../src/components/ContainerRow", () => ({
    __esModule: true,
    default: ({ children, type }) => (
        <div data-testid="container-row" data-type={type}>
            {children}
        </div>
    ),
}));

function renderAuthPageContainer(props = {}) {
    const defaultProps = {
        title: "Sign In",
        path: "/register",
        text: "Need an account?",
        children: <div data-testid="form">Form content</div>,
        ...props,
    };

    return render(
        <BrowserRouter>
            <AuthPageContainer {...defaultProps} />
        </BrowserRouter>,
    );
}

describe("AuthPageContainer Component", () => {
    it("should render auth-page class", () => {
        const { container } = renderAuthPageContainer();
        expect(container.querySelector(".auth-page")).toBeInTheDocument();
    });

    it("should render title", () => {
        renderAuthPageContainer({ title: "Sign In" });
        expect(screen.getByText("Sign In")).toBeInTheDocument();
    });

    it("should render custom title", () => {
        renderAuthPageContainer({ title: "Create Account" });
        expect(screen.getByText("Create Account")).toBeInTheDocument();
    });

    it("should render title with text-xs-center class", () => {
        const { container } = renderAuthPageContainer();
        const title = container.querySelector("h1.text-xs-center");
        expect(title).toHaveTextContent("Sign In");
    });

    it("should render link with custom path", () => {
        renderAuthPageContainer({ path: "/register", text: "Need an account?" });
        const link = screen.getByRole("link");
        expect(link).toHaveAttribute("href", "/register");
        expect(link).toHaveTextContent("Need an account?");
    });

    it("should render link with custom text", () => {
        renderAuthPageContainer({ path: "/login", text: "Have an account?" });
        expect(screen.getByText("Have an account?")).toBeInTheDocument();
    });

    it("should render children", () => {
        renderAuthPageContainer();
        expect(screen.getByTestId("form")).toBeInTheDocument();
        expect(screen.getByText("Form content")).toBeInTheDocument();
    });

    it("should render ContainerRow with page type", () => {
        renderAuthPageContainer();
        const containerRow = screen.getByTestId("container-row");
        expect(containerRow).toHaveAttribute("data-type", "page");
    });

    it("should render column layout classes", () => {
        const { container } = renderAuthPageContainer();
        const colDiv = container.querySelector(".col-md-6");
        expect(colDiv).toBeInTheDocument();
        expect(colDiv).toHaveClass("offset-md-3");
        expect(colDiv).toHaveClass("col-xs-12");
    });

    describe("error handling", () => {
        it("should not render error messages when no error", () => {
            renderAuthPageContainer({ error: null });
            expect(screen.queryByRole("list")).not.toBeInTheDocument();
        });

        it("should render error messages when error exists", () => {
            renderAuthPageContainer({ error: "Invalid credentials" });
            expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
        });

        it("should render error list with error-messages class", () => {
            const { container } = renderAuthPageContainer({
                error: "Email already used",
            });
            const errorList = container.querySelector(".error-messages");
            expect(errorList).toBeInTheDocument();
        });

        it("should render error in list item", () => {
            const { container } = renderAuthPageContainer({
                error: "Password too short",
            });
            const listItem = container.querySelector(".error-messages li");
            expect(listItem).toHaveTextContent("Password too short");
        });

        it("should render multiple errors", () => {
            renderAuthPageContainer({
                error: "First error",
            });
            expect(screen.getByText("First error")).toBeInTheDocument();
        });
    });

    it("should maintain proper structure", () => {
        const { container } = renderAuthPageContainer();

        const authPage = container.querySelector(".auth-page");
        const containerRow = authPage.querySelector('[data-testid="container-row"]');
        const colDiv = containerRow.querySelector(".col-md-6");
        const title = colDiv.querySelector("h1");

        expect(authPage).toBeInTheDocument();
        expect(containerRow).toBeInTheDocument();
        expect(colDiv).toBeInTheDocument();
        expect(title).toBeInTheDocument();
    });

    it("should render children after error messages", () => {
        const { container } = renderAuthPageContainer({
            error: "Test error",
        });

        const errorList = container.querySelector(".error-messages");
        const form = screen.getByTestId("form");

        expect(errorList).toBeInTheDocument();
        expect(form).toBeInTheDocument();
        expect(errorList.compareDocumentPosition(form)).toBe(
            Node.DOCUMENT_POSITION_FOLLOWING,
        );
    });
});
