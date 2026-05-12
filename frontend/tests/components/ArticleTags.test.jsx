import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "@jest/globals";
import ArticleTags from "../../src/components/ArticleTags";

describe("ArticleTags Component", () => {
    it("should render tag list when tags exist", () => {
        const tags = ["javascript", "react", "testing"];

        render(<ArticleTags tagList={tags} />);

        expect(screen.getByText("javascript")).toBeInTheDocument();
        expect(screen.getByText("react")).toBeInTheDocument();
        expect(screen.getByText("testing")).toBeInTheDocument();
    });

    it("should render all tags from tagList", () => {
        const tags = ["tag1", "tag2", "tag3", "tag4"];

        const { container } = render(<ArticleTags tagList={tags} />);

        const tagItems = container.querySelectorAll(".tag-default");
        expect(tagItems).toHaveLength(4);
    });

    it("should not render when tagList is empty", () => {
        const { container } = render(<ArticleTags tagList={[]} />);

        const tagList = container.querySelector(".tag-list");
        expect(tagList).not.toBeInTheDocument();
    });

    it("should not render when tagList is undefined", () => {
        const { container } = render(<ArticleTags tagList={undefined} />);

        const tagList = container.querySelector(".tag-list");
        expect(tagList).not.toBeInTheDocument();
    });

    it("should not render when tagList is null", () => {
        const { container } = render(<ArticleTags tagList={null} />);

        const tagList = container.querySelector(".tag-list");
        expect(tagList).not.toBeInTheDocument();
    });

    it("should use tag-pill class for styling", () => {
        const tags = ["design"];

        const { container } = render(<ArticleTags tagList={tags} />);

        const tagPill = container.querySelector(".tag-pill");
        expect(tagPill).toBeInTheDocument();
    });

    it("should use tag-outline class for styling", () => {
        const tags = ["backend"];

        const { container } = render(<ArticleTags tagList={tags} />);

        const tagOutline = container.querySelector(".tag-outline");
        expect(tagOutline).toBeInTheDocument();
    });

    it("should render tag-list container", () => {
        const tags = ["single-tag"];

        const { container } = render(<ArticleTags tagList={tags} />);

        const tagList = container.querySelector(".tag-list");
        expect(tagList).toBeInTheDocument();
        expect(tagList.tagName).toBe("UL");
    });

    it("should render single tag correctly", () => {
        const tags = ["only-tag"];

        render(<ArticleTags tagList={tags} />);

        expect(screen.getByText("only-tag")).toBeInTheDocument();
    });

    it("should render many tags", () => {
        const tags = Array.from({ length: 10 }, (_, i) => `tag${i + 1}`);

        const { container } = render(<ArticleTags tagList={tags} />);

        const tagItems = container.querySelectorAll("li");
        expect(tagItems).toHaveLength(10);
    });
});
