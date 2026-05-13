import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "@jest/globals";
import ArticleEditor from "../../src/routes/ArticleEditor";

jest.mock("../../src/components/ArticleEditorForm", () => {
    return function MockArticleEditorForm() {
        return <div data-testid="article-editor-form">Article Editor Form</div>;
    };
});

jest.mock("../../src/components/ContainerRow", () => {
    return function MockContainerRow({ children, type }) {
        return <div data-testid={`container-${type}`}>{children}</div>;
    };
});

describe("ArticleEditor Route", () => {
    it("should render editor page", () => {
        const { container } = render(<ArticleEditor />);

        expect(container.querySelector(".editor-page")).toBeInTheDocument();
    });

    it("should render ContainerRow with page type", () => {
        render(<ArticleEditor />);

        expect(screen.getByTestId("container-page")).toBeInTheDocument();
    });

    it("should render ArticleEditorForm", () => {
        render(<ArticleEditor />);

        expect(screen.getByTestId("article-editor-form")).toBeInTheDocument();
    });

    it("should have correct column layout", () => {
        const { container } = render(<ArticleEditor />);

        const colDiv = container.querySelector(".col-md-10");
        expect(colDiv).toBeInTheDocument();
    });

    it("should have correct offset", () => {
        const { container } = render(<ArticleEditor />);

        const colDiv = container.querySelector(".offset-md-1");
        expect(colDiv).toBeInTheDocument();
    });

    it("should have responsive column classes", () => {
        const { container } = render(<ArticleEditor />);

        const colDiv = container.querySelector(".col-xs-12");
        expect(colDiv).toBeInTheDocument();
    });

    it("should structure page correctly", () => {
        const { container } = render(<ArticleEditor />);

        const editorPage = container.querySelector(".editor-page");
        expect(editorPage).toBeInTheDocument();

        const containerRow = editorPage.querySelector(
            '[data-testid="container-page"]',
        );
        expect(containerRow).toBeInTheDocument();

        const colDiv = containerRow.querySelector(".col-md-10");
        expect(colDiv).toBeInTheDocument();

        const form = colDiv.querySelector(
            '[data-testid="article-editor-form"]',
        );
        expect(form).toBeInTheDocument();
    });
});
