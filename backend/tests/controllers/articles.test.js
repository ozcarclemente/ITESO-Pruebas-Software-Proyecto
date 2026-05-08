/*
    Tests for article CRUD
*/

const { describe, it, expect, beforeEach } = require("@jest/globals");
const { Article } = require("../../models");
const {
    allArticles,
    createArticle,
    singleArticle,
    updateArticle,
    deleteArticle,
} = require("../../controllers/articles");
const {
    NotFoundError,
    UnauthorizedError,
    FieldRequiredError,
    ForbiddenError,
    AlreadyTakenError,
} = require("../../helper/customErrors");

jest.mock("../../models", () => ({
    // models mock
    sequelize: { authenticate: jest.fn().mockResolvedValue(true) },
    User: {
        create: jest.fn(),
        findOne: jest.fn(),
        destroy: jest.fn(),
    },
    Article: {
        create: jest.fn(),
        findOne: jest.fn(),
        findAndCountAll: jest.fn(),
        destroy: jest.fn(),
    },
    Tag: {
        findByPk: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({ name: "cool" }),
        destroy: jest.fn(),
    },
}));

jest.mock("../../helper/helpers", () => {
    // helpers mock
    const realHelpers = jest.requireActual("../../helper/helpers"); // we don't need to mock slugify or appendTagList
    return {
        ...realHelpers,
        appendFollowers: jest.fn().mockImplementation((toAppend) => {
            if (toAppend?.author) {
                toAppend.author.dataValues = toAppend.author.dataValues || {};
                toAppend.author.dataValues.following = false;
                toAppend.author.dataValues.followersCount = 0;
            } else {
                toAppend.dataValues = toAppend.dataValues || {};
                toAppend.dataValues.following = false;
                toAppend.dataValues.followersCount = 0;
            }
        }),
        appendFavorites: jest.fn().mockImplementation((article) => {
            article.dataValues = article.dataValues || {};
            article.dataValues.favorited = false;
            article.dataValues.favoritesCount = 0;
        }),
    };
});

beforeEach(() => {
    // clean all mocks before testing
    jest.clearAllMocks();
});

describe("POST /api/articles", () => {
    // tests for CREATE operations

    let mockReq;
    let mockRes;
    let mockNext;

    beforeEach(() => {
        mockRes = {
            json: jest.fn().mockReturnThis(),
            status: jest.fn().mockReturnThis(),
        };
        mockNext = jest.fn();
        mockReq = {
            loggedUser: {
                id: 1,
                username: "user1",
                email: "email@test.com",
                dataValues: {},
                getFollowing: jest.fn().mockResolvedValue([]),
                getFavorites: jest.fn().mockResolvedValue([]),
                countFavorites: jest.fn().mockResolvedValue(0),
            },
            params: {},
            query: {},
            body: {
                article: {
                    title: "title",
                    description: "description",
                    body: "body",
                    tagList: ["tag1", "tag2"],
                },
            },
        };
    });

    it("should create an article successfully", async () => {
        // test that checks that a new article is created

        Article.findOne.mockResolvedValue(null);
        Article.create.mockResolvedValue({
            id: 1,
            slug: "test-article",
            title: "Test Article",
            description: "This is a test article.",
            body: "Lorem ipsum dolor sit amet.",
            userId: 1,
            dataValues: { Favorites: [] },
            author: { id: 1, username: "user1", dataValues: {} },
            tagList: [{ name: "test" }],
            getTagList: jest.fn().mockResolvedValue([{ name: "test" }]),
            setAuthor: jest.fn(),
            addTagList: jest.fn(),
            save: jest.fn().mockResolvedValue(true),
            destroy: jest.fn().mockResolvedValue(true),
        });

        await createArticle(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(201);
        expect(mockRes.json).toHaveBeenCalledWith(
            expect.objectContaining({
                article: expect.objectContaining({
                    title: "Test Article",
                    slug: "test-article",
                    author: expect.objectContaining({ username: "user1" }),
                }),
            }),
        );
        expect(mockNext).not.toHaveBeenCalled();
    });

    it("should fail to create article if not logged in", async () => {
        // test that checks that creating an article fails if not logged in

        mockReq.loggedUser = null;

        await createArticle(mockReq, mockRes, mockNext);

        const err = mockNext.mock.calls[0][0];
        expect(err).toBeInstanceOf(UnauthorizedError);
        expect(err.message).toBe("You need to login first!");
    });

    it("should fail to create article if article doesn't have a title", async () => {
        // test that checks creating an article without a title fails

        mockReq.body = {
            article: { description: "description", body: "body", tagList: [] },
        };

        await createArticle(mockReq, mockRes, mockNext);

        const err = mockNext.mock.calls[0][0];
        expect(err).toBeInstanceOf(FieldRequiredError);
        expect(err.message).toBe("A title is required");
    });

    it("should fail to create article if article doesn't have a description", async () => {
        // test that checks creating an article without a description fails

        mockReq.body = {
            article: { title: "title", body: "body", tagList: [] },
        };

        await createArticle(mockReq, mockRes, mockNext);

        const err = mockNext.mock.calls[0][0];
        expect(err).toBeInstanceOf(FieldRequiredError);
    });

    it("should fail to create article if article doesn't have a body", async () => {
        // test that checks creating an article without a body fails

        mockReq.body = {
            article: {
                title: "title",
                description: "description",
                tagList: [],
            },
        };

        await createArticle(mockReq, mockRes, mockNext);

        const err = mockNext.mock.calls[0][0];
        expect(err).toBeInstanceOf(FieldRequiredError);
    });

    it("should fail to create article if the title is already taken", async () => {
        // test that checks that creating an article with a title that is already taken fails

        Article.findOne.mockResolvedValue({ id: 1, title: "Test Article" });

        await createArticle(mockReq, mockRes, mockNext);

        const err = mockNext.mock.calls[0][0];
        expect(err).toBeInstanceOf(AlreadyTakenError);
    });
});

describe("GET /api/articles/:slug", () => {
    // tests for READ operations

    let mockReq;
    let mockRes;
    let mockNext;

    beforeEach(() => {
        mockRes = {
            json: jest.fn().mockReturnThis(),
            status: jest.fn().mockReturnThis(),
        };
        mockNext = jest.fn();
        mockReq = {
            loggedUser: {
                id: 1,
                username: "user1",
                email: "email@test.com",
                dataValues: {},
                getFollowing: jest.fn().mockResolvedValue([]),
                getFavorites: jest.fn().mockResolvedValue([]),
                countFavorites: jest.fn().mockResolvedValue(0),
            },
            params: { slug: "test-article" },
            query: {},
            body: {},
        };
    });

    it("should return a specific article", async () => {
        // test that checks that a specific article is returned

        Article.findOne.mockResolvedValue({
            id: 1,
            slug: "test-article",
            title: "Test Article",
            description: "This is a test article.",
            body: "Lorem ipsum dolor sit amet.",
            userId: 1,
            dataValues: { Favorites: [] },
            author: { id: 1, username: "user1", dataValues: {} },
            tagList: [{ name: "test" }],
            getTagList: jest.fn().mockResolvedValue([{ name: "test" }]),
            setAuthor: jest.fn(),
            addTagList: jest.fn(),
            save: jest.fn().mockResolvedValue(true),
            destroy: jest.fn().mockResolvedValue(true),
        });

        await singleArticle(mockReq, mockRes, mockNext);

        const response = mockRes.json.mock.calls[0][0];
        const article = response.article;

        expect(article).toEqual(
            expect.objectContaining({
                slug: "test-article",
                title: "Test Article",
                description: "This is a test article.",
                body: "Lorem ipsum dolor sit amet.",
            }),
        );

        expect(article.dataValues.tagList).toEqual(["test"]);
    });

    it("should return a list of all articles", async () => {
        // test that checks that all existing articles are returned

        Article.findAndCountAll.mockResolvedValue({
            rows: [
                {
                    id: 1,
                    slug: "test-article",
                    title: "Test Article",
                    userId: 1,
                    dataValues: { Favorites: [] },
                    author: { id: 1, username: "user1", dataValues: {} },
                    tagList: [{ name: "test" }],
                    getTagList: jest.fn().mockResolvedValue([{ name: "test" }]),
                    save: jest.fn().mockResolvedValue(true),
                    destroy: jest.fn().mockResolvedValue(true),
                },
                {
                    id: 2,
                    slug: "test-article-two",
                    title: "Test Article Two",
                    userId: 2,
                    dataValues: { Favorites: [] },
                    author: { id: 2, username: "user2", dataValues: {} },
                    tagList: [{ name: "node" }],
                    getTagList: jest.fn().mockResolvedValue([{ name: "node" }]),
                    save: jest.fn().mockResolvedValue(true),
                    destroy: jest.fn().mockResolvedValue(true),
                },
            ],
            count: 2,
        });

        await allArticles(mockReq, mockRes, mockNext);

        const response = mockRes.json.mock.calls[0][0];
        const titles = response.articles.map((a) => a.title);

        expect(mockRes.json).toHaveBeenCalledWith(
            expect.objectContaining({ articlesCount: 2 }),
        );
        expect(mockRes.json.mock.calls[0][0].articles).toHaveLength(2);
        expect(titles).toEqual(["Test Article", "Test Article Two"]);
    });

    it("should fail to return article if it doesn't exist", async () => {
        // test that checks that an article can't be returned if it doesn't exist

        Article.findOne.mockResolvedValue(null);
        mockReq.params.slug = "not-an-article";

        await singleArticle(mockReq, mockRes, mockNext);

        const err = mockNext.mock.calls[0][0];
        expect(err).toBeInstanceOf(NotFoundError);
        expect(err.message).toBe("Article not found ");
    });
});

describe("PUT /api/articles/:slug", () => {
    // tests for UPDATE operations

    let mockReq;
    let mockRes;
    let mockNext;

    beforeEach(() => {
        mockRes = {
            json: jest.fn().mockReturnThis(),
            status: jest.fn().mockReturnThis(),
        };
        mockNext = jest.fn();
        mockReq = {
            loggedUser: {
                id: 1,
                username: "user1",
                email: "email@test.com",
                dataValues: {},
                getFollowing: jest.fn().mockResolvedValue([]),
                getFavorites: jest.fn().mockResolvedValue([]),
                countFavorites: jest.fn().mockResolvedValue(0),
            },
            params: { slug: "test-article" },
            query: {},
            body: { article: { title: "Test Article Two" } },
        };
    });

    it("should update an article's title", async () => {
        // test that checks that a specific article is updated

        const article = {
            id: 1,
            slug: "test-article",
            title: "Test Article",
            userId: 1,
            dataValues: { Favorites: [] },
            author: { id: 1, username: "user1", dataValues: {} },
            tagList: [{ name: "test" }],
            getTagList: jest.fn().mockResolvedValue([{ name: "test" }]),
            setAuthor: jest.fn(),
            addTagList: jest.fn(),
            save: jest.fn().mockImplementation(function () {
                return Promise.resolve(this);
            }),
            destroy: jest.fn().mockResolvedValue(true),
        };
        Article.findOne.mockResolvedValue(article);

        await updateArticle(mockReq, mockRes, mockNext);

        expect(article.save).toHaveBeenCalled();
        expect(mockRes.json).toHaveBeenCalledWith(
            expect.objectContaining({
                article: expect.objectContaining({
                    title: "Test Article Two",
                    slug: "test-article-two",
                }),
            }),
        );
    });

    it("should fail to update article if it doesn't exist", async () => {
        // test that checks that deleting an article fails if the article doesn't exist

        Article.findOne.mockResolvedValue(null);
        mockReq.params.slug = "not-an-article";

        await updateArticle(mockReq, mockRes, mockNext);

        const err = mockNext.mock.calls[0][0];
        expect(err).toBeInstanceOf(NotFoundError);
        expect(err.message).toBe("Article not found ");
    });

    it("should fail to update article if a different user tries to update it", async () => {
        // test that checks that a user's articles can't be updated by a different user

        Article.findOne.mockResolvedValue({
            id: 1,
            slug: "test-article-two",
            title: "Test Article Two",
            userId: 2,
            dataValues: { Favorites: [] },
            author: { id: 2, username: "user2", dataValues: {} },
            tagList: [{ name: "test" }],
            getTagList: jest.fn().mockResolvedValue([{ name: "test" }]),
            setAuthor: jest.fn(),
            addTagList: jest.fn(),
            save: jest.fn().mockResolvedValue(true),
            destroy: jest.fn().mockResolvedValue(true),
        });
        mockReq.body = { article: { title: "Our Article :)" } };

        await updateArticle(mockReq, mockRes, mockNext);

        const err = mockNext.mock.calls[0][0];
        expect(err).toBeInstanceOf(ForbiddenError);
        expect(err.message).toBe("You are not the author of this article");
    });
});

describe("DELETE /api/articles/:slug", () => {
    // tests for DELETE operations

    let mockReq;
    let mockRes;
    let mockNext;

    beforeEach(() => {
        mockRes = {
            json: jest.fn().mockReturnThis(),
            status: jest.fn().mockReturnThis(),
        };
        mockNext = jest.fn();
        mockReq = {
            loggedUser: {
                id: 1,
                username: "user1",
                email: "email@test.com",
                dataValues: {},
                getFollowing: jest.fn().mockResolvedValue([]),
                getFavorites: jest.fn().mockResolvedValue([]),
                countFavorites: jest.fn().mockResolvedValue(0),
            },
            params: { slug: "test-article" },
            query: {},
            body: {},
        };
    });

    it("should delete an article", async () => {
        // test that checks that a specific article is deleted

        const article = {
            id: 1,
            slug: "test-article",
            title: "Test Article",
            userId: 1,
            dataValues: { Favorites: [] },
            author: { id: 1, username: "user1", dataValues: {} },
            tagList: [{ name: "test" }],
            getTagList: jest.fn().mockResolvedValue([{ name: "test" }]),
            setAuthor: jest.fn(),
            addTagList: jest.fn(),
            save: jest.fn().mockResolvedValue(true),
            destroy: jest.fn().mockResolvedValue(true),
        };
        Article.findOne.mockResolvedValue(article);

        await deleteArticle(mockReq, mockRes, mockNext);

        expect(article.destroy).toHaveBeenCalledTimes(1);
        expect(mockRes.json).toHaveBeenCalledWith({
            message: { body: ["Article deleted successfully"] },
        });
    });

    it("should fail to delete article if it doesn't exist", async () => {
        // test that checks that deleting an article fails if the article doesn't exist

        Article.findOne.mockResolvedValue(null);
        mockReq.params.slug = "not-an-article";

        await deleteArticle(mockReq, mockRes, mockNext);

        const err = mockNext.mock.calls[0][0];
        expect(err).toBeInstanceOf(NotFoundError);
        expect(err.message).toBe("Article not found ");
    });

    it("should fail to delete article if a different user tries to delete it", async () => {
        // test that checks that a user's articles can't be deleted by a different user

        Article.findOne.mockResolvedValue({
            id: 1,
            slug: "test-article",
            title: "Test Article",
            userId: 2,
            dataValues: { Favorites: [] },
            author: { id: 2, username: "user2", dataValues: {} },
            tagList: [{ name: "test" }],
            getTagList: jest.fn().mockResolvedValue([{ name: "test" }]),
            setAuthor: jest.fn(),
            addTagList: jest.fn(),
            save: jest.fn().mockResolvedValue(true),
            destroy: jest.fn().mockResolvedValue(true),
        });

        await deleteArticle(mockReq, mockRes, mockNext);

        const err = mockNext.mock.calls[0][0];
        expect(err).toBeInstanceOf(ForbiddenError);
        expect(err.message).toBe("You are not the author of this article");
    });
});
