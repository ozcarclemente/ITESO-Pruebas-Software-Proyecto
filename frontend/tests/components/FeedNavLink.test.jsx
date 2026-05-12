import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import FeedNavLink from "../../src/components/FeedToggler/FeedNavLink";
import { useFeedContext } from "../../src/context/FeedContext";

jest.mock("../../src/context/FeedContext");

const mockChangeTab = jest.fn();

describe("FeedNavLink Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should render button with text", () => {
        useFeedContext.mockReturnValue({
            tabName: "global",
            changeTab: mockChangeTab,
        });

        render(<FeedNavLink name="global" text="Global Feed" />);
        expect(screen.getByText("Global Feed")).toBeInTheDocument();
    });

    it("should render nav-item and nav-link classes", () => {
        useFeedContext.mockReturnValue({
            tabName: "global",
            changeTab: mockChangeTab,
        });

        const { container } = render(<FeedNavLink name="global" text="Global Feed" />);
        expect(container.querySelector(".nav-item")).toBeInTheDocument();
        expect(screen.getByRole("button")).toHaveClass("nav-link");
    });

    it("should apply active class when tabName matches name prop", () => {
        useFeedContext.mockReturnValue({
            tabName: "feed",
            changeTab: mockChangeTab,
        });

        render(<FeedNavLink name="feed" text="Your Feed" />);
        expect(screen.getByText("Your Feed")).toHaveClass("active");
    });

    it("should not apply active class when tabName does not match", () => {
        useFeedContext.mockReturnValue({
            tabName: "global",
            changeTab: mockChangeTab,
        });

        render(<FeedNavLink name="feed" text="Your Feed" />);
        const button = screen.getByText("Your Feed");
        expect(button).not.toHaveClass("active");
        expect(button).toHaveClass("nav-link");
    });

    it("should render pound icon when icon prop is true", () => {
        useFeedContext.mockReturnValue({
            tabName: "tag",
            changeTab: mockChangeTab,
        });

        const { container } = render(
            <FeedNavLink icon name="tag" text="javascript" />,
        );
        expect(container.querySelector(".ion-pound")).toBeInTheDocument();
    });

    it("should not render icon when icon prop is false", () => {
        useFeedContext.mockReturnValue({
            tabName: "global",
            changeTab: mockChangeTab,
        });

        const { container } = render(
            <FeedNavLink name="global" text="Global Feed" />,
        );
        expect(container.querySelector(".ion-pound")).not.toBeInTheDocument();
    });

    it("should call changeTab when clicked", () => {
        useFeedContext.mockReturnValue({
            tabName: "global",
            changeTab: mockChangeTab,
        });

        render(<FeedNavLink name="feed" text="Your Feed" />);
        fireEvent.click(screen.getByText("Your Feed"));

        expect(mockChangeTab).toHaveBeenCalled();
    });

    it("should pass event to changeTab when clicked", () => {
        useFeedContext.mockReturnValue({
            tabName: "global",
            changeTab: mockChangeTab,
        });

        render(<FeedNavLink name="feed" text="Your Feed" />);
        fireEvent.click(screen.getByText("Your Feed"));

        expect(mockChangeTab).toHaveBeenCalledWith(
            expect.any(Object),
            "feed",
        );
    });

    it("should render with multiple different names", () => {
        const { rerender } = render(
            <FeedNavLink name="feed" text="Your Feed" />,
        );

        useFeedContext.mockReturnValue({
            tabName: "feed",
            changeTab: mockChangeTab,
        });

        rerender(<FeedNavLink name="feed" text="Your Feed" />);
        expect(screen.getByText("Your Feed")).toHaveClass("active");

        useFeedContext.mockReturnValue({
            tabName: "global",
            changeTab: mockChangeTab,
        });

        rerender(<FeedNavLink name="global" text="Global Feed" />);
        expect(screen.getByText("Global Feed")).toHaveClass("active");
    });

    it("should render icon before text when both are present", () => {
        useFeedContext.mockReturnValue({
            tabName: "tag",
            changeTab: mockChangeTab,
        });

        const { container } = render(
            <FeedNavLink icon name="tag" text="python" />,
        );

        const button = screen.getByText("python");
        const icon = button.querySelector(".ion-pound");
        expect(icon).toBeInTheDocument();
        expect(button.textContent).toMatch(/python/);
    });
});
