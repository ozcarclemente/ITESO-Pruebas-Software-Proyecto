import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Article from "../../src/routes/Article/Article";
const { useAuth } = require("../../src/context/AuthContext");

jest.mock("../../src/context/AuthContext");
jest.mock("../../src/services/getArticle");
jest.mock("../../src/helpers/dateFormatter");

const getArticle =
    require("../../src/services/getArticle").default ||
    require("../../src/services/getArticle");
const dateFormatter = require("../../src/helpers/dateFormatter").default;

jest.mock("../../src/components/ArticlesButtons", () => ({
    __esModule: true,
    default: () => <div data-testid="articles-buttons" />,
}));
jest.mock("../../src/components/BannerContainer", () => ({
    __esModule: true,
    default: ({ children }) => <div data-testid="banner">{children}</div>,
}));

const mockNavigate = jest.fn();

const mockRouterConfig = {
    locationState: null,
};

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useParams: () => ({ slug: "test-article" }),
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: mockRouterConfig.locationState }),
    Outlet: () => <div data-testid="outlet" />,
}));

const mockArticle = {
    title: "Test Article",
    body: "Article Body",
    tagList: ["tag1", "tag2"],
    createdAt: "2026-05-08T00:00:00Z",
    author: {
        username: "testuser",
        image: "avatar.jpg",
        bio: "A user",
        following: false,
        followersCount: 5,
    },
    slug: "test-article",
    favorited: false,
    favoritesCount: 3,
};

useAuth.mockReturnValue({
    headers: { Authorization: "Token test" },
    isAuth: true,
    loggedUser: { username: "testuser" },
});

getArticle.mockResolvedValue(mockArticle);
dateFormatter.mockReturnValue("May 8, 2026");

function renderArticle() {
    return render(
        <BrowserRouter>
            <Article />
        </BrowserRouter>,
    );
}

describe("Article", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockRouterConfig.locationState = null;
        useAuth.mockReturnValue({
            headers: { Authorization: "Token test" },
            isAuth: true,
            loggedUser: { username: "testuser" },
        });
        getArticle.mockResolvedValue(mockArticle);
        dateFormatter.mockReturnValue("May 8, 2026");
    });

    describe("data fetching", () => {
        it("should fetch data with slug and headers mounted", async () => {
            // test that checks that the article is fetched using the route slug and auth headers.
            renderArticle();

            await waitFor(() => {
                expect(getArticle).toHaveBeenCalledWith({
                    slug: "test-article",
                    headers: { Authorization: "Token test" },
                });
            });
        });

        it("should not fetch when location state is already provided", async () => {
            // test that checks that existing article data is used instead of fetching again after navigation.
            mockRouterConfig.locationState = mockArticle;

            renderArticle();

            await waitFor(() => {
                expect(getArticle).not.toHaveBeenCalled();
            });
        });

        it("should redirect to /not-found when fetching article fails", async () => {
            // test that checks that users are redirected to /not-found if they try to navigate to a non-existent article.

            getArticle.mockRejectedValueOnce(new Error("Not found"));

            renderArticle();

            await waitFor(() => {
                expect(mockNavigate).toHaveBeenCalledWith("/not-found", {
                    replace: true,
                });
            });
        });

        it("should re-fetch when auth state changes", async () => {
            // test that checks that article data is fetched again after auth credentials are updated

            const { rerender } = renderArticle();

            await waitFor(() => expect(getArticle).toHaveBeenCalledTimes(1));

            useAuth.mockReturnValue({
                headers: { Authorization: "New token" },
                isAuth: false,
                loggedUser: { username: "" },
            });

            rerender(
                <BrowserRouter>
                    <Article />
                </BrowserRouter>,
            );

            await waitFor(() => expect(getArticle).toHaveBeenCalledTimes(2));
        });
    });

    describe("article content rendering", () => {
        // tests for rendering article content

        it("should render the article title", async () => {
            // test that checks that article title is rendered correctly

            renderArticle();

            expect(await screen.findByText("Test Article")).toBeInTheDocument();
        });

        it("should render the article body", async () => {
            // test that checks that article body is rendered correctly

            renderArticle();

            expect(await screen.findByText("Article Body")).toBeInTheDocument();
        });

        it("should not render the body element before data is loaded", () => {
            // test that checks that body element is not returned when fetch is pending

            getArticle.mockReturnValueOnce(new Promise(() => {})); // never resolves

            renderArticle();

            expect(screen.queryByText("Article Body")).not.toBeInTheDocument();
        });

        it("should render with location state without fetching", async () => {
            // test that checks that article is rendered directly from navigation
            mockRouterConfig.locationState = mockArticle;

            renderArticle();

            expect(await screen.findByText("Test Article")).toBeInTheDocument();
            expect(getArticle).not.toHaveBeenCalled();
        });
    });

    describe("tag list rendering", () => {
        // tests for tag list rendering

        it("should render all article tags", async () => {
            // test that checks tha tag list is rendered correctly

            renderArticle();

            expect(await screen.findByText("tag1")).toBeInTheDocument();
            expect(screen.getByText("tag2")).toBeInTheDocument();
        });

        it("should not render a tag list when tagList is empty", async () => {
            // test that checks that tag list is not rendered if there's no tags

            getArticle.mockResolvedValueOnce({ ...mockArticle, tagList: [] });

            renderArticle();

            await waitFor(() => expect(getArticle).toHaveBeenCalled());
            expect(screen.queryByRole("list")).not.toBeInTheDocument();
        });
    });

    describe("article meta rendering", () => {
        // test for article metadata rendering

        it("should render the author username", async () => {
            // test that checks that the article author's username is rendered

            renderArticle();

            const authorLinks = await screen.findAllByText("testuser");
            expect(authorLinks.length).toBeGreaterThan(0);
        });

        it("should render the formatted creation date", async () => {
            // test that checks that the article author's username is rendere

            renderArticle();

            const dates = await screen.findAllByText("May 8, 2026");
            expect(dates.length).toBeGreaterThan(0);
        });

        it("should render the author avatar", async () => {
            // test that checks that the author's profile picture is rendeered

            renderArticle();

            const avatars = await screen.findAllByAltText("testuser"); // since all profile pictures are the same alt text is the most reliable way
            expect(avatars.length).toBeGreaterThan(0);
        });

        it("should render article metadata in both banner and article-actions sections", async () => {
            // test that checks that article metadata is rendered twice, once in the banner and once below the article body

            const { container } = renderArticle();

            await screen.findByText("Test Article");

            const metaBlocks = container.querySelectorAll(".article-meta");
            expect(metaBlocks).toHaveLength(2);
        });

        it("should render ArticlesButtons in both meta sections", async () => {
            // test that checks that article buttons (delete and edit article) are rendered twice, once in the banner and once below the article body

            renderArticle();

            await screen.findByText("Test Article");

            const buttons = screen.getAllByTestId("articles-buttons");
            expect(buttons).toHaveLength(2);
        });
    });

    describe("page layout", () => {
        // tests for article view layout

        it("should render the article-page wrapper", async () => {
            // test that checks that the article-page wrapper is rendered sucessfully

            const { container } = renderArticle();

            await screen.findByText("Test Article");

            expect(
                container.querySelector(".article-page"),
            ).toBeInTheDocument();
        });

        it("should render the banner", async () => {
            // test that checks that the banner is rendered sucessfully

            renderArticle();

            await screen.findByText("Test Article");

            expect(screen.getByTestId("banner")).toBeInTheDocument();
        });

        it("should render the comment section", async () => {
            // test that checks that the article comment section (outlet) is rendered correctly

            renderArticle();

            await screen.findByText("Test Article");

            expect(screen.getByTestId("outlet")).toBeInTheDocument();
        });
    });

    describe("auth state", () => {
        // tests for actions that depend on auth

        it("should still fetch and render the article for guests", async () => {
            // test that published articles still render for users without an account

            useAuth.mockReturnValue({
                headers: null,
                isAuth: false,
                loggedUser: { username: "" },
            });

            renderArticle();

            expect(await screen.findByText("Test Article")).toBeInTheDocument();
        });
    });
});
