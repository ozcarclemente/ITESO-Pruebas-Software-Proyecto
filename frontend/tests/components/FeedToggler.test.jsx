import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "@jest/globals";
import FeedToggler from "../../src/components/FeedToggler";

jest.mock("../../src/context/AuthContext", () => ({
    useAuth: jest.fn(),
}));

jest.mock("../../src/context/FeedContext", () => ({
    useFeedContext: jest.fn(),
}));

jest.mock("../../src/components/FeedToggler/FeedNavLink", () => {
    return function MockFeedNavLink({ name, text }) {
        return (
            <li>
                <a data-testid={`feed-link-${name}`}>{text}</a>
            </li>
        );
    };
});

describe("FeedToggler Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should render Your Feed tab when authenticated", () => {
        const { useAuth } = require("../../src/context/AuthContext");
        const { useFeedContext } = require("../../src/context/FeedContext");

        useAuth.mockReturnValue({ isAuth: true });
        useFeedContext.mockReturnValue({ tabName: "feed", tagName: "" });

        render(<FeedToggler />);

        expect(screen.getByText("Your Feed")).toBeInTheDocument();
    });

    it("should not render Your Feed tab when not authenticated", () => {
        const { useAuth } = require("../../src/context/AuthContext");
        const { useFeedContext } = require("../../src/context/FeedContext");

        useAuth.mockReturnValue({ isAuth: false });
        useFeedContext.mockReturnValue({ tabName: "global", tagName: "" });

        render(<FeedToggler />);

        expect(screen.queryByText("Your Feed")).not.toBeInTheDocument();
    });

    it("should always render Global Feed tab", () => {
        const { useAuth } = require("../../src/context/AuthContext");
        const { useFeedContext } = require("../../src/context/FeedContext");

        useAuth.mockReturnValue({ isAuth: false });
        useFeedContext.mockReturnValue({ tabName: "global", tagName: "" });

        render(<FeedToggler />);

        expect(screen.getByText("Global Feed")).toBeInTheDocument();
    });

    it("should render tag tab when tabName is tag", () => {
        const { useAuth } = require("../../src/context/AuthContext");
        const { useFeedContext } = require("../../src/context/FeedContext");

        useAuth.mockReturnValue({ isAuth: false });
        useFeedContext.mockReturnValue({
            tabName: "tag",
            tagName: "javascript",
        });

        render(<FeedToggler />);

        expect(screen.getByText("javascript")).toBeInTheDocument();
    });

    it("should not render tag tab when tabName is not tag", () => {
        const { useAuth } = require("../../src/context/AuthContext");
        const { useFeedContext } = require("../../src/context/FeedContext");

        useAuth.mockReturnValue({ isAuth: true });
        useFeedContext.mockReturnValue({ tabName: "feed", tagName: "" });

        render(<FeedToggler />);

        expect(screen.queryByText("javascript")).not.toBeInTheDocument();
    });

    it("should have feed-toggle container", () => {
        const { useAuth } = require("../../src/context/AuthContext");
        const { useFeedContext } = require("../../src/context/FeedContext");

        useAuth.mockReturnValue({ isAuth: true });
        useFeedContext.mockReturnValue({ tabName: "feed", tagName: "" });

        const { container } = render(<FeedToggler />);

        expect(container.querySelector(".feed-toggle")).toBeInTheDocument();
    });

    it("should render nav-pills navigation", () => {
        const { useAuth } = require("../../src/context/AuthContext");
        const { useFeedContext } = require("../../src/context/FeedContext");

        useAuth.mockReturnValue({ isAuth: true });
        useFeedContext.mockReturnValue({ tabName: "feed", tagName: "" });

        const { container } = render(<FeedToggler />);

        expect(container.querySelector(".nav.nav-pills")).toBeInTheDocument();
    });

    it("should render correct number of tabs when authenticated", () => {
        const { useAuth } = require("../../src/context/AuthContext");
        const { useFeedContext } = require("../../src/context/FeedContext");

        useAuth.mockReturnValue({ isAuth: true });
        useFeedContext.mockReturnValue({ tabName: "feed", tagName: "" });

        const { container } = render(<FeedToggler />);

        const listItems = container.querySelectorAll("li");
        expect(listItems.length).toBeGreaterThanOrEqual(2); // At least Your Feed and Global Feed
    });

    it("should render correct number of tabs when not authenticated", () => {
        const { useAuth } = require("../../src/context/AuthContext");
        const { useFeedContext } = require("../../src/context/FeedContext");

        useAuth.mockReturnValue({ isAuth: false });
        useFeedContext.mockReturnValue({ tabName: "global", tagName: "" });

        const { container } = render(<FeedToggler />);

        const listItems = container.querySelectorAll("li");
        expect(listItems.length).toBeGreaterThanOrEqual(1); // At least Global Feed
    });
});
