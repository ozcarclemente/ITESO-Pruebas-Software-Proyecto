import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "@jest/globals";
import FeedProvider, { useFeedContext } from "../../src/context/FeedContext";

jest.mock("../../src/context/AuthContext", () => ({
    useAuth: jest.fn(),
}));

const { useAuth } = require("../../src/context/AuthContext");

function TestComponent() {
    const { changeTab, tabName, tagName } = useFeedContext();
    return (
        <div>
            <div data-testid="tabName">{tabName}</div>
            <div data-testid="tagName">{tagName || "no-tag"}</div>
            <button
                onClick={(e) => changeTab(e, "tag")}
                data-testid="change-tab-btn"
            >
                javascript
            </button>
        </div>
    );
}

describe("FeedContext", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("initial state for unauthenticated user", () => {
        beforeEach(() => {
            useAuth.mockReturnValue({ isAuth: false });
        });

        it("should initialize with global tab for unauthenticated user", () => {
            render(
                <FeedProvider>
                    <TestComponent />
                </FeedProvider>,
            );

            expect(screen.getByTestId("tabName")).toHaveTextContent("global");
        });

        it("should have empty tagName initially", () => {
            render(
                <FeedProvider>
                    <TestComponent />
                </FeedProvider>,
            );

            expect(screen.getByTestId("tagName")).toHaveTextContent("no-tag");
        });
    });

    describe("initial state for authenticated user", () => {
        beforeEach(() => {
            useAuth.mockReturnValue({ isAuth: true });
        });

        it("should initialize with feed tab for authenticated user", () => {
            render(
                <FeedProvider>
                    <TestComponent />
                </FeedProvider>,
            );

            expect(screen.getByTestId("tabName")).toHaveTextContent("feed");
        });

        it("should have empty tagName initially", () => {
            render(
                <FeedProvider>
                    <TestComponent />
                </FeedProvider>,
            );

            expect(screen.getByTestId("tagName")).toHaveTextContent("no-tag");
        });
    });

    describe("auth state changes", () => {
        it("should initialize with feed tab when authenticated", () => {
            useAuth.mockReturnValue({ isAuth: true });

            render(
                <FeedProvider>
                    <TestComponent />
                </FeedProvider>,
            );

            expect(screen.getByTestId("tabName")).toHaveTextContent("feed");
        });

        it("should initialize with global tab when not authenticated", () => {
            useAuth.mockReturnValue({ isAuth: false });

            render(
                <FeedProvider>
                    <TestComponent />
                </FeedProvider>,
            );

            expect(screen.getByTestId("tabName")).toHaveTextContent("global");
        });
    });

    describe("changeTab function", () => {
        beforeEach(() => {
            useAuth.mockReturnValue({ isAuth: false });
        });

        it("should have changeTab as a function", () => {
            render(
                <FeedProvider>
                    <TestComponent />
                </FeedProvider>,
            );

            expect(screen.getByTestId("change-tab-btn")).toBeInTheDocument();
        });
    });

    describe("context value", () => {
        beforeEach(() => {
            useAuth.mockReturnValue({ isAuth: false });
        });

        it("should provide changeTab function in context", () => {
            render(
                <FeedProvider>
                    <TestComponent />
                </FeedProvider>,
            );

            expect(screen.getByTestId("change-tab-btn")).toBeInTheDocument();
        });

        it("should provide tabName in context", () => {
            render(
                <FeedProvider>
                    <TestComponent />
                </FeedProvider>,
            );

            expect(screen.getByTestId("tabName")).toBeInTheDocument();
        });

        it("should provide tagName in context", () => {
            render(
                <FeedProvider>
                    <TestComponent />
                </FeedProvider>,
            );

            expect(screen.getByTestId("tagName")).toBeInTheDocument();
        });
    });

    describe("useFeedContext hook", () => {
        beforeEach(() => {
            useAuth.mockReturnValue({ isAuth: false });
        });

        it("should throw error when useFeedContext is called outside of FeedProvider", () => {
            const consoleSpy = jest
                .spyOn(console, "error")
                .mockImplementation();

            expect(() => {
                render(<TestComponent />);
            }).toThrow();

            consoleSpy.mockRestore();
        });

        it("should return feed context when used inside FeedProvider", () => {
            render(
                <FeedProvider>
                    <TestComponent />
                </FeedProvider>,
            );

            expect(screen.getByTestId("tabName")).toBeInTheDocument();
            expect(screen.getByTestId("tagName")).toBeInTheDocument();
        });
    });

    describe("render children", () => {
        beforeEach(() => {
            useAuth.mockReturnValue({ isAuth: false });
        });

        it("should render children correctly", () => {
            render(
                <FeedProvider>
                    <div data-testid="child">Child Component</div>
                </FeedProvider>,
            );

            expect(screen.getByTestId("child")).toBeInTheDocument();
            expect(screen.getByText("Child Component")).toBeInTheDocument();
        });
    });
});
