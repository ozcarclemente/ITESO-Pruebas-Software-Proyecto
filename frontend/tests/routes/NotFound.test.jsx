import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import NotFound from "../../src/routes/NotFound";

function renderNotFound() {
    return render(
        <BrowserRouter>
            <NotFound />
        </BrowserRouter>,
    );
}

describe("NotFound Route", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("page structure", () => {
        it("should render not-found wrapper", () => {
            const { container } = renderNotFound();

            expect(container.querySelector(".not-found")).toBeInTheDocument();
        });

        it("should render 404 heading", () => {
            renderNotFound();

            expect(
                screen.getByRole("heading", { name: /404 Not Found/i }),
            ).toBeInTheDocument();
        });

        it("should render h1 for error code", () => {
            const { container } = renderNotFound();

            const heading = container.querySelector("h1");
            expect(heading).toBeInTheDocument();
            expect(heading).toHaveTextContent("404 Not Found");
        });

        it("should render link to home page", () => {
            renderNotFound();

            const link = screen.getByRole("link", { name: /Go to home page/i });
            expect(link).toBeInTheDocument();
        });
    });

    describe("link behavior", () => {
        it("should have correct href to home", () => {
            renderNotFound();

            const link = screen.getByRole("link", { name: /Go to home page/i });
            expect(link).toHaveAttribute("href", "/");
        });

        it("should render home link with correct text", () => {
            renderNotFound();

            expect(screen.getByText("Go to home page")).toBeInTheDocument();
        });

        it("should be a valid link element", () => {
            renderNotFound();

            const link = screen.getByRole("link");
            expect(link.tagName).toBe("A");
        });

        it("should point to root path", () => {
            renderNotFound();

            const link = screen.getByRole("link");
            expect(link.getAttribute("href")).toBe("/");
        });
    });

    describe("content rendering", () => {
        it("should display 404 error message", () => {
            renderNotFound();

            expect(screen.getByText("404 Not Found")).toBeInTheDocument();
        });

        it("should display navigation link", () => {
            renderNotFound();

            expect(screen.getByText("Go to home page")).toBeInTheDocument();
        });

        it("should only have one link", () => {
            renderNotFound();

            const links = screen.getAllByRole("link");
            expect(links).toHaveLength(1);
        });

        it("should only have one heading", () => {
            renderNotFound();

            const headings = screen.getAllByRole("heading");
            expect(headings).toHaveLength(1);
        });
    });

    describe("page layout", () => {
        it("should have correct CSS class", () => {
            const { container } = renderNotFound();

            const notFoundDiv = container.querySelector(".not-found");
            expect(notFoundDiv).toHaveClass("not-found");
        });

        it("should have heading inside wrapper", () => {
            const { container } = renderNotFound();

            const wrapper = container.querySelector(".not-found");
            const heading = wrapper.querySelector("h1");
            expect(heading).toBeInTheDocument();
        });

        it("should have link inside wrapper", () => {
            const { container } = renderNotFound();

            const wrapper = container.querySelector(".not-found");
            const link = wrapper.querySelector("a");
            expect(link).toBeInTheDocument();
        });

        it("should render elements in correct order", () => {
            const { container } = renderNotFound();

            const wrapper = container.querySelector(".not-found");
            const children = wrapper.children;

            expect(children.length).toBeGreaterThan(0);
            expect(children[0].tagName).toBe("H1");
            expect(children[1].tagName).toBe("A");
        });
    });

    describe("accessibility", () => {
        it("should have proper heading structure", () => {
            renderNotFound();

            const heading = screen.getByRole("heading");
            expect(heading.tagName).toBe("H1");
        });

        it("should have accessible link", () => {
            renderNotFound();

            const link = screen.getByRole("link");
            expect(link).toHaveAttribute("href");
            expect(link).toHaveTextContent("Go to home page");
        });

        it("should have descriptive link text", () => {
            renderNotFound();

            const link = screen.getByRole("link", { name: /Go to home page/i });
            expect(link.textContent.length).toBeGreaterThan(0);
        });
    });

    describe("error page semantics", () => {
        it("should indicate 404 error clearly", () => {
            renderNotFound();

            expect(screen.getByText(/404/)).toBeInTheDocument();
            expect(screen.getByText(/Not Found/)).toBeInTheDocument();
        });

        it("should provide way back to home", () => {
            renderNotFound();

            const homeLink = screen.getByRole("link", { name: /home/i });
            expect(homeLink).toBeInTheDocument();
        });

        it("should use semantic HTML", () => {
            const { container } = renderNotFound();

            const wrapper = container.querySelector(".not-found");
            expect(wrapper).toBeInTheDocument();

            const heading = wrapper.querySelector("h1");
            expect(heading).toBeInTheDocument();

            const link = wrapper.querySelector("a");
            expect(link).toBeInTheDocument();
        });
    });
});
