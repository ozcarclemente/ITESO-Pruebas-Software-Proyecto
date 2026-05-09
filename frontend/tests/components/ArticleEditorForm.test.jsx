import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import ArticleEditorForm from "../../src/components/ArticleEditorForm/ArticleEditorForm";

jest.mock("../../src/context/AuthContext");
jest.mock("../../src/services/getArticle");
jest.mock("../../src/services/setArticle");

const { useAuth } = require("../../src/context/AuthContext");
const getArticle =
    require("../../src/services/getArticle").default ||
    require("../../src/services/getArticle");
const setArticle =
    require("../../src/services/setArticle").default ||
    require("../../src/services/setArticle");

const mockNavigate = jest.fn();

const mockRouterConfig = {
    slug: undefined,
    state: null,
};

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useParams: () => ({ slug: mockRouterConfig.slug }),
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: mockRouterConfig.state }),
}));

const authLoggedIn = {
    headers: { Authorization: "Token test" },
    isAuth: true,
    loggedUser: { username: "testuser" },
};

const authLoggedOut = {
    headers: null,
    isAuth: false,
    loggedUser: { username: "" },
};

useAuth.mockReturnValue(authLoggedIn);
setArticle.mockResolvedValue("new-article-slug");
getArticle.mockResolvedValue({
    title: "Existing Title",
    description: "Existing description",
    body: "Existing body",
    tagList: ["tag1", "tag2"],
    author: { username: "testuser" },
});

function renderForm() {
    return render(
        <BrowserRouter>
            <ArticleEditorForm />
        </BrowserRouter>,
    );
}

describe("ArticleEditorForm", () => {
    // tests for article editor form

    beforeEach(() => {
        jest.clearAllMocks();
        // reset router config to create-mode defaults before every test
        mockRouterConfig.slug = undefined;
        mockRouterConfig.state = null;
        useAuth.mockReturnValue(authLoggedIn);
        setArticle.mockResolvedValue("new-article-slug");
        getArticle.mockResolvedValue({
            title: "Existing Title",
            description: "Existing description",
            body: "Existing body",
            tagList: ["tag1", "tag2"],
            author: { username: "testuser" },
        });
    });

    describe("rendering", () => {
        /// tests for rendering article editor components

        it("should render all form fields", () => {
            // test that checks that create article form renders all fields correctly
            renderForm();

            expect(
                screen.getByPlaceholderText("Article Title"),
            ).toBeInTheDocument();
            expect(
                screen.getByPlaceholderText("What's this article about?"),
            ).toBeInTheDocument();
            expect(
                screen.getByPlaceholderText("Write your article (in markdown)"),
            ).toBeInTheDocument();
            expect(
                screen.getByPlaceholderText("Enter tags"),
            ).toBeInTheDocument();
        });

        it("should render 'Publish Article' button when in create mode", () => {
            // test that checks that the publish button is the one rendered in create form

            renderForm();

            expect(
                screen.getByRole("button", { name: "Publish Article" }),
            ).toBeInTheDocument();
        });

        it("should render empty fields when in create mode", () => {
            // test that checks that there's only placeholder text when in create mode

            renderForm();

            expect(screen.getByPlaceholderText("Article Title")).toHaveValue(
                "",
            );
            expect(
                screen.getByPlaceholderText("What's this article about?"),
            ).toHaveValue("");
            expect(
                screen.getByPlaceholderText("Write your article (in markdown)"),
            ).toHaveValue("");
        });
    });

    describe("auth state", () => {
        // tests for actions that depend on auth

        it("should redirect to home when user is not authenticated", () => {
            // test that checks that the create article form is only accesible when logged in
            useAuth.mockReturnValue(authLoggedOut);

            renderForm();

            expect(mockNavigate).toHaveBeenCalledWith("/", {
                replace: true,
                state: null,
            });
        });
    });

    describe("create article", () => {
        // tests for creating article

        it("should create article with the correct input data", async () => {
            // test that checks that article is created with the correct information after clicking "Publish Article"

            renderForm();

            fireEvent.change(screen.getByPlaceholderText("Article Title"), {
                target: { name: "title", value: "Test Article" },
            });
            fireEvent.change(
                screen.getByPlaceholderText("What's this article about?"),
                { target: { name: "description", value: "Description" } },
            );
            fireEvent.change(
                screen.getByPlaceholderText("Write your article (in markdown)"),
                {
                    target: {
                        name: "body",
                        value: "Lorem ipsum dolor sit amet.",
                    },
                },
            );

            fireEvent.click(
                screen.getByRole("button", { name: "Publish Article" }),
            );

            await waitFor(() => {
                expect(setArticle).toHaveBeenCalledWith(
                    expect.objectContaining({
                        title: "Test Article",
                        description: "Description",
                        body: "Lorem ipsum dolor sit amet.",
                        headers: authLoggedIn.headers,
                        slug: undefined,
                    }),
                );
            });
        });

        it("should redirect to the newly created article page after successful creation", async () => {
            // test that checks that the user is redirected to the new article's url after creation

            setArticle.mockResolvedValueOnce("test-article");

            renderForm();

            fireEvent.change(screen.getByPlaceholderText("Article Title"), {
                target: { name: "title", value: "Test Article" },
            });
            fireEvent.change(
                screen.getByPlaceholderText("What's this article about?"),
                { target: { name: "description", value: "Description" } },
            );
            fireEvent.change(
                screen.getByPlaceholderText("Write your article (in markdown)"),
                {
                    target: {
                        name: "body",
                        value: "Lorem ipsum dolor sit amet.",
                    },
                },
            );

            fireEvent.click(
                screen.getByRole("button", { name: "Publish Article" }),
            );

            await waitFor(() => {
                expect(mockNavigate).toHaveBeenCalledWith(
                    "/article/test-article",
                );
            });
        });

        it("should display an error message when creating article fails", async () => {
            // test that checks if an error message shows when creating an article fails

            setArticle.mockRejectedValueOnce("Title already taken"); // simulate an AlreadyTakenError

            renderForm();

            fireEvent.change(screen.getByPlaceholderText("Article Title"), {
                target: { name: "title", value: "Duplicate" },
            });
            fireEvent.change(
                screen.getByPlaceholderText("What's this article about?"),
                { target: { name: "description", value: "Duplicate article" } },
            );
            fireEvent.change(
                screen.getByPlaceholderText("Write your article (in markdown)"),
                { target: { name: "body", value: "Clone" } },
            );

            fireEvent.click(
                screen.getByRole("button", { name: "Publish Article" }),
            );

            expect(
                await screen.findByText("Title already taken"),
            ).toBeInTheDocument();
        });

        it("should not redirect when creating an article fails", async () => {
            // test that checks that user is not redirected if no article was created

            setArticle.mockRejectedValueOnce("Error");

            renderForm();

            fireEvent.change(screen.getByPlaceholderText("Article Title"), {
                target: { name: "title", value: "Test Article" },
            });
            fireEvent.change(
                screen.getByPlaceholderText("What's this article about?"),
                { target: { name: "description", value: "Description" } },
            );
            fireEvent.change(
                screen.getByPlaceholderText("Write your article (in markdown)"),
                {
                    target: {
                        name: "body",
                        value: "Lorem ipsum dolor sit amet.",
                    },
                },
            );

            fireEvent.click(
                screen.getByRole("button", { name: "Publish Article" }),
            );

            await waitFor(() => {
                expect(mockNavigate).not.toHaveBeenCalled();
            });
        });
    });

    describe("edit mode", () => {
        // tests for editing an existing article

        it("should render 'Update Article' button when editing an existing article", () => {
            // test that checks that the update button is the one rendered in edit form

            mockRouterConfig.slug = "existing-article";

            renderForm();

            expect(
                screen.getByRole("button", { name: "Update Article" }),
            ).toBeInTheDocument();
        });

        it("should pre-fill form fields with existing article data", async () => {
            // test that checks that form fields in edit article mode are pre-filled with the existing article data

            mockRouterConfig.slug = "existing-article";

            renderForm();

            expect(
                await screen.findByDisplayValue("Existing Title"),
            ).toBeInTheDocument();
            expect(
                screen.getByDisplayValue("Existing description"),
            ).toBeInTheDocument();
            expect(
                screen.getByDisplayValue("Existing body"),
            ).toBeInTheDocument();
        });

        it("should redirect if the fetched article belongs to a different author", async () => {
            // test that checks that user can only access edit mode for their own articles

            mockRouterConfig.slug = "other-article";
            getArticle.mockResolvedValueOnce({
                title: "Other Article",
                description: "Description 2",
                body: "Body 2",
                tagList: [],
                author: { username: "user2" },
            });

            renderForm();

            await waitFor(() => {
                expect(mockNavigate).toHaveBeenCalledWith("/", {
                    replace: true,
                    state: null,
                });
            });
        });
    });

    describe("input handling", () => {
        // tests for input handler

        it("should update the title field on change", () => {
            // test that checks that changes to title field are applied correctly

            renderForm();

            const titleInput = screen.getByPlaceholderText("Article Title");
            fireEvent.change(titleInput, {
                target: { name: "title", value: "Test Article" },
            });

            expect(titleInput).toHaveValue("Test Article");
        });

        it("should update the description field on change", () => {
            // test that checks that changes to description field are applied correctly
            renderForm();

            const descInput = screen.getByPlaceholderText(
                "What's this article about?",
            );
            fireEvent.change(descInput, {
                target: {
                    name: "description",
                    value: "About testing changes to form field",
                },
            });

            expect(descInput).toHaveValue(
                "About testing changes to form field",
            );
        });

        it("should update the body textarea on change", () => {
            // test that checks that changes to body field are applied correctly
            renderForm();

            const bodyInput = screen.getByPlaceholderText(
                "Write your article (in markdown)",
            );
            fireEvent.change(bodyInput, {
                target: { name: "body", value: "## Hello World!" },
            });

            expect(bodyInput).toHaveValue("## Hello World!");
        });

        it("should split comma-separated tag string into individual tags", () => {
            // test that checks that tag field handles comma-separated format correctly
            renderForm();

            const tagsInput = screen.getByPlaceholderText("Enter tags");
            fireEvent.change(tagsInput, {
                target: { value: "tag1,tag2,tag3" },
            });

            expect(tagsInput.value).toBe("tag1,tag2,tag3");
        });

        it("should split space-separated tag string into individual tags", () => {
            // test that checks that tag field handles space-separated format correctly
            renderForm();

            const tagsInput = screen.getByPlaceholderText("Enter tags");
            fireEvent.change(tagsInput, {
                target: { value: "tag1 tag2 tag 3" }, // split the 3 off to show the effect better
            });

            expect(tagsInput.value).toBe("tag1,tag2,tag,3");
        });
    });
});
