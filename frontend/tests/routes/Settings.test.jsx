import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Settings from "../../src/routes/Settings";

jest.mock("../../src/components/ContainerRow", () => ({
    __esModule: true,
    default: ({ children, type }) => (
        <div data-testid={`container-${type}`}>{children}</div>
    ),
}));
jest.mock("../../src/components/SettingsForm", () => ({
    __esModule: true,
    default: () => <form data-testid="settings-form" />,
}));

function renderSettings() {
    return render(
        <BrowserRouter>
            <Settings />
        </BrowserRouter>,
    );
}

describe("Settings Route", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("page structure", () => {
        it("should render settings-page wrapper", () => {
            const { container } = renderSettings();

            expect(
                container.querySelector(".settings-page"),
            ).toBeInTheDocument();
        });

        it("should render ContainerRow with type 'page'", () => {
            renderSettings();

            expect(screen.getByTestId("container-page")).toBeInTheDocument();
        });

        it("should render page title", () => {
            renderSettings();

            expect(screen.getByText("Your Settings")).toBeInTheDocument();
        });

        it("should render SettingsForm component", () => {
            renderSettings();

            expect(screen.getByTestId("settings-form")).toBeInTheDocument();
        });
    });

    describe("layout structure", () => {
        it("should have correct column classes for responsive layout", () => {
            const { container } = renderSettings();

            const column = container.querySelector(".col-md-6");
            expect(column).toBeInTheDocument();
        });

        it("should center content with col-md offset", () => {
            const { container } = renderSettings();

            const column = container.querySelector(".offset-md-3");
            expect(column).toBeInTheDocument();
        });

        it("should have mobile responsive column", () => {
            const { container } = renderSettings();

            const column = container.querySelector(".col-xs-12");
            expect(column).toBeInTheDocument();
        });

        it("should center text", () => {
            const { container } = renderSettings();

            const heading = container.querySelector(".text-xs-center");
            expect(heading).toBeInTheDocument();
            expect(heading).toHaveTextContent("Your Settings");
        });
    });

    describe("heading structure", () => {
        it("should render h1 heading", () => {
            const { container } = renderSettings();

            const heading = container.querySelector("h1");
            expect(heading).toBeInTheDocument();
        });

        it("should have 'Your Settings' text in heading", () => {
            renderSettings();

            expect(screen.getByText("Your Settings")).toBeInTheDocument();
        });

        it("should have correct styling on heading", () => {
            const { container } = renderSettings();

            const heading = container.querySelector("h1");
            expect(heading).toHaveClass("text-xs-center");
        });
    });

    describe("form component integration", () => {
        it("should render SettingsForm inside the layout", () => {
            const { container } = renderSettings();

            const form = screen.getByTestId("settings-form");
            const column = container.querySelector(".col-md-6");

            expect(column).toContainElement(form);
        });

        it("should render form without additional wrappers", () => {
            renderSettings();

            const form = screen.getByTestId("settings-form");
            expect(form).toBeInTheDocument();
        });
    });

    describe("responsive design", () => {
        it("should have Bootstrap responsive classes", () => {
            const { container } = renderSettings();

            const column = container.querySelector(".col-md-6");
            expect(column).toHaveClass("col-md-6");
            expect(column).toHaveClass("offset-md-3");
            expect(column).toHaveClass("col-xs-12");
        });

        it("should center on medium and larger screens", () => {
            const { container } = renderSettings();

            const column = container.querySelector(".offset-md-3");
            expect(column).toBeInTheDocument();
        });

        it("should be full width on mobile", () => {
            const { container } = renderSettings();

            const column = container.querySelector(".col-xs-12");
            expect(column).toBeInTheDocument();
        });
    });

    describe("component nesting", () => {
        it("should have correct component hierarchy", () => {
            const { container } = renderSettings();

            const settingsPage = container.querySelector(".settings-page");
            const containerRow = settingsPage.querySelector(
                "[data-testid='container-page']",
            );
            const column = containerRow.querySelector(".col-md-6");

            expect(settingsPage).toBeInTheDocument();
            expect(containerRow).toBeInTheDocument();
            expect(column).toBeInTheDocument();
        });

        it("should render all elements in correct order", () => {
            const { container } = renderSettings();

            const settingsPage = container.querySelector(".settings-page");
            const children = settingsPage.children;

            expect(children.length).toBeGreaterThan(0);
        });
    });

    describe("content rendering", () => {
        it("should display settings page content", () => {
            renderSettings();

            expect(screen.getByText("Your Settings")).toBeInTheDocument();
            expect(screen.getByTestId("settings-form")).toBeInTheDocument();
        });

        it("should only render the settings form once", () => {
            renderSettings();

            const forms = screen.getAllByTestId("settings-form");
            expect(forms).toHaveLength(1);
        });
    });
});
