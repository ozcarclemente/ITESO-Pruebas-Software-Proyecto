import axios from "axios";

jest.mock("axios");
jest.mock("../../src/helpers/errorHandler", () => jest.fn());

import getUser from "../../src/services/getUser";
import getProfile from "../../src/services/getProfile";
import getTags from "../../src/services/getTags";
import toggleFav from "../../src/services/toggleFav";
import toggleFollow from "../../src/services/toggleFollow";
import errorHandler from "../../src/helpers/errorHandler";

describe("Profile & Tags Services", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("getUser", () => {
        it("should fetch current user", async () => {
            const mockUser = {
                username: "john",
                email: "john@example.com",
                bio: "Developer",
                image: "https://example.com/image.jpg",
            };

            axios.mockResolvedValueOnce({
                data: { user: mockUser },
            });

            const result = await getUser({
                headers: { Authorization: "Token abc123" },
            });

            expect(axios).toHaveBeenCalledWith({
                headers: { Authorization: "Token abc123" },
                url: "api/user",
            });
            expect(result).toEqual(mockUser);
        });

        it("should include auth headers in request", async () => {
            const headers = { Authorization: "Token test_token" };

            axios.mockResolvedValueOnce({
                data: { user: {} },
            });

            await getUser({ headers });

            expect(axios).toHaveBeenCalledWith(
                expect.objectContaining({
                    headers,
                }),
            );
        });

        it("should return only user property from response", async () => {
            const fullResponse = {
                user: { username: "john", email: "john@test.com" },
                profile: { followersCount: 5 },
            };

            axios.mockResolvedValueOnce({
                data: fullResponse,
            });

            const result = await getUser({
                headers: { Authorization: "Token test" },
            });

            expect(result).toEqual(fullResponse.user);
            expect(result.profile).toBeUndefined();
        });

        it("should handle getUser error", async () => {
            const error = new Error("Unauthorized");
            axios.mockRejectedValueOnce(error);

            await getUser({ headers: { Authorization: "Token invalid" } });

            expect(errorHandler).toHaveBeenCalledWith(error);
        });

        it("should work without headers", async () => {
            axios.mockResolvedValueOnce({
                data: { user: {} },
            });

            await getUser({ headers: undefined });

            expect(axios).toHaveBeenCalledWith({
                headers: undefined,
                url: "api/user",
            });
        });
    });

    describe("getProfile", () => {
        it("should fetch profile by username", async () => {
            const mockProfile = {
                username: "jane",
                bio: "Designer",
                image: "https://example.com/jane.jpg",
                following: false,
                followersCount: 10,
            };

            axios.mockResolvedValueOnce({
                data: { profile: mockProfile },
            });

            const result = await getProfile({
                headers: { Authorization: "Token test" },
                username: "jane",
            });

            expect(axios).toHaveBeenCalledWith({
                headers: { Authorization: "Token test" },
                url: "api/profiles/jane",
            });
            expect(result).toEqual(mockProfile);
        });

        it("should return only profile property", async () => {
            const fullResponse = {
                profile: { username: "jane", followersCount: 5 },
                user: { email: "jane@test.com" },
            };

            axios.mockResolvedValueOnce({
                data: fullResponse,
            });

            const result = await getProfile({
                headers: { Authorization: "Token test" },
                username: "jane",
            });

            expect(result).toEqual(fullResponse.profile);
            expect(result.user).toBeUndefined();
        });

        it("should include optional headers parameter", async () => {
            axios.mockResolvedValueOnce({
                data: { profile: {} },
            });

            await getProfile({
                headers: { Authorization: "Token abc" },
                username: "testuser",
            });

            expect(axios).toHaveBeenCalledWith(
                expect.objectContaining({
                    headers: { Authorization: "Token abc" },
                }),
            );
        });

        it("should handle getProfile error", async () => {
            const error = new Error("Profile not found");
            axios.mockRejectedValueOnce(error);

            await getProfile({
                headers: { Authorization: "Token test" },
                username: "nonexistent",
            });

            expect(errorHandler).toHaveBeenCalledWith(error);
        });

        it("should construct URL correctly with username", async () => {
            axios.mockResolvedValueOnce({
                data: { profile: {} },
            });

            await getProfile({
                headers: { Authorization: "Token test" },
                username: "my-username",
            });

            expect(axios).toHaveBeenCalledWith({
                headers: { Authorization: "Token test" },
                url: "api/profiles/my-username",
            });
        });
    });

    describe("getTags", () => {
        it("should fetch all tags", async () => {
            const mockTags = ["javascript", "react", "nodejs"];

            axios.mockResolvedValueOnce({
                data: { tags: mockTags },
            });

            const result = await getTags();

            expect(axios).toHaveBeenCalledWith({
                url: "/api/tags",
            });
            expect(result).toEqual(mockTags);
        });

        it("should return only tags property", async () => {
            const fullResponse = {
                tags: ["tag1", "tag2"],
                total: 2,
            };

            axios.mockResolvedValueOnce({
                data: fullResponse,
            });

            const result = await getTags();

            expect(result).toEqual(fullResponse.tags);
            expect(result.total).toBeUndefined();
        });

        it("should not require headers", () => {
            axios.mockResolvedValueOnce({
                data: { tags: [] },
            });

            getTags();

            expect(axios).toHaveBeenCalledWith({
                url: "/api/tags",
            });
        });

        it("should handle getTags error", async () => {
            const error = new Error("Server error");
            axios.mockRejectedValueOnce(error);

            await getTags();

            expect(errorHandler).toHaveBeenCalledWith(error);
        });

        it("should handle empty tags list", async () => {
            axios.mockResolvedValueOnce({
                data: { tags: [] },
            });

            const result = await getTags();

            expect(result).toEqual([]);
            expect(Array.isArray(result)).toBe(true);
        });

        it("should handle multiple tags", async () => {
            const mockTags = ["tag1", "tag2", "tag3", "tag4", "tag5"];

            axios.mockResolvedValueOnce({
                data: { tags: mockTags },
            });

            const result = await getTags();

            expect(result).toHaveLength(5);
            expect(result).toEqual(mockTags);
        });
    });

    describe("toggleFav", () => {
        it("should unfavorite (POST) when not favorited", async () => {
            const mockArticle = {
                slug: "test-article",
                title: "Test",
                favorited: true,
                favoritesCount: 5,
            };

            axios.mockResolvedValueOnce({
                data: { article: mockArticle },
            });

            const result = await toggleFav({
                slug: "test-article",
                favorited: false,
                headers: { Authorization: "Token test" },
            });

            expect(axios).toHaveBeenCalledWith({
                headers: { Authorization: "Token test" },
                method: "POST",
                url: "api/articles/test-article/favorite",
            });
            expect(result).toEqual(mockArticle);
        });

        it("should delete (DELETE) when already favorited", async () => {
            const mockArticle = {
                slug: "test-article",
                title: "Test",
                favorited: false,
                favoritesCount: 4,
            };

            axios.mockResolvedValueOnce({
                data: { article: mockArticle },
            });

            const result = await toggleFav({
                slug: "test-article",
                favorited: true,
                headers: { Authorization: "Token test" },
            });

            expect(axios).toHaveBeenCalledWith({
                headers: { Authorization: "Token test" },
                method: "DELETE",
                url: "api/articles/test-article/favorite",
            });
            expect(result).toEqual(mockArticle);
        });

        it("should use correct HTTP method based on favorited flag", async () => {
            axios.mockResolvedValueOnce({
                data: { article: {} },
            });

            await toggleFav({
                slug: "article",
                favorited: false,
                headers: { Authorization: "Token test" },
            });

            const firstCall = axios.mock.calls[0][0];
            expect(firstCall.method).toBe("POST");

            jest.clearAllMocks();
            axios.mockResolvedValueOnce({
                data: { article: {} },
            });

            await toggleFav({
                slug: "article",
                favorited: true,
                headers: { Authorization: "Token test" },
            });

            const secondCall = axios.mock.calls[0][0];
            expect(secondCall.method).toBe("DELETE");
        });

        it("should handle toggleFav error", async () => {
            const error = new Error("Article not found");
            axios.mockRejectedValueOnce(error);

            await toggleFav({
                slug: "nonexistent",
                favorited: false,
                headers: { Authorization: "Token test" },
            });

            expect(errorHandler).toHaveBeenCalledWith(error);
        });

        it("should return updated article", async () => {
            const updatedArticle = {
                slug: "test",
                favorited: true,
                favoritesCount: 10,
            };

            axios.mockResolvedValueOnce({
                data: { article: updatedArticle },
            });

            const result = await toggleFav({
                slug: "test",
                favorited: false,
                headers: { Authorization: "Token test" },
            });

            expect(result).toEqual(updatedArticle);
        });
    });

    describe("toggleFollow", () => {
        it("should follow (POST) when not following", async () => {
            const mockProfile = {
                username: "jane",
                following: true,
                followersCount: 5,
            };

            axios.mockResolvedValueOnce({
                data: { profile: mockProfile },
            });

            const result = await toggleFollow({
                username: "jane",
                following: false,
                headers: { Authorization: "Token test" },
            });

            expect(axios).toHaveBeenCalledWith({
                headers: { Authorization: "Token test" },
                method: "POST",
                url: "api/profiles/jane/follow",
            });
            expect(result).toEqual(mockProfile);
        });

        it("should unfollow (DELETE) when already following", async () => {
            const mockProfile = {
                username: "jane",
                following: false,
                followersCount: 4,
            };

            axios.mockResolvedValueOnce({
                data: { profile: mockProfile },
            });

            const result = await toggleFollow({
                username: "jane",
                following: true,
                headers: { Authorization: "Token test" },
            });

            expect(axios).toHaveBeenCalledWith({
                headers: { Authorization: "Token test" },
                method: "DELETE",
                url: "api/profiles/jane/follow",
            });
            expect(result).toEqual(mockProfile);
        });

        it("should use correct HTTP method based on following flag", async () => {
            axios.mockResolvedValueOnce({
                data: { profile: {} },
            });

            await toggleFollow({
                username: "user",
                following: false,
                headers: { Authorization: "Token test" },
            });

            const firstCall = axios.mock.calls[0][0];
            expect(firstCall.method).toBe("POST");

            jest.clearAllMocks();
            axios.mockResolvedValueOnce({
                data: { profile: {} },
            });

            await toggleFollow({
                username: "user",
                following: true,
                headers: { Authorization: "Token test" },
            });

            const secondCall = axios.mock.calls[0][0];
            expect(secondCall.method).toBe("DELETE");
        });

        it("should handle toggleFollow error", async () => {
            const error = new Error("User not found");
            axios.mockRejectedValueOnce(error);

            await toggleFollow({
                username: "nonexistent",
                following: false,
                headers: { Authorization: "Token test" },
            });

            expect(errorHandler).toHaveBeenCalledWith(error);
        });

        it("should return updated profile", async () => {
            const updatedProfile = {
                username: "jane",
                following: true,
                followersCount: 100,
            };

            axios.mockResolvedValueOnce({
                data: { profile: updatedProfile },
            });

            const result = await toggleFollow({
                username: "jane",
                following: false,
                headers: { Authorization: "Token test" },
            });

            expect(result).toEqual(updatedProfile);
        });

        it("should construct URL with correct username", async () => {
            axios.mockResolvedValueOnce({
                data: { profile: {} },
            });

            await toggleFollow({
                username: "my-user",
                following: false,
                headers: { Authorization: "Token test" },
            });

            expect(axios).toHaveBeenCalledWith({
                headers: { Authorization: "Token test" },
                method: "POST",
                url: "api/profiles/my-user/follow",
            });
        });
    });
});
