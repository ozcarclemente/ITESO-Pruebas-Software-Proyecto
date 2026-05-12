import axios from "axios";

jest.mock("axios");
jest.mock("../../src/helpers/errorHandler", () => jest.fn());

import toggleFav from "../../src/services/toggleFav";
import errorHandler from "../../src/helpers/errorHandler";

describe("toggleFav Service", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should favorite an article (POST) if not favorited", async () => {
        const mockArticle = { slug: "test-slug", favorited: true };
        axios.mockResolvedValueOnce({ data: { article: mockArticle } });

        const result = await toggleFav({
            slug: "test-slug",
            favorited: false,
            headers: { Authorization: "Token test" },
        });

        expect(axios).toHaveBeenCalledWith({
            headers: { Authorization: "Token test" },
            method: "POST",
            url: "api/articles/test-slug/favorite",
        });
        expect(result).toEqual(mockArticle);
    });

    it("should unfavorite an article (DELETE) if already favorited", async () => {
        const mockArticle = { slug: "test-slug", favorited: false };
        axios.mockResolvedValueOnce({ data: { article: mockArticle } });

        const result = await toggleFav({
            slug: "test-slug",
            favorited: true,
            headers: { Authorization: "Token test" },
        });

        expect(axios).toHaveBeenCalledWith({
            headers: { Authorization: "Token test" },
            method: "DELETE",
            url: "api/articles/test-slug/favorite",
        });
        expect(result).toEqual(mockArticle);
    });

    it("should handle toggleFav error", async () => {
        const error = new Error("Request failed");
        axios.mockRejectedValueOnce(error);

        await toggleFav({
            slug: "test-slug",
            favorited: false,
            headers: { Authorization: "Token test" },
        });

        expect(errorHandler).toHaveBeenCalledWith(error);
    });
});
