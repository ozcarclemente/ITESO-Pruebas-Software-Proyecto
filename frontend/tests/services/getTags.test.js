import axios from "axios";

jest.mock("axios");
jest.mock("../../src/helpers/errorHandler", () => jest.fn());

import getTags from "../../src/services/getTags";
import errorHandler from "../../src/helpers/errorHandler";

describe("getTags Service", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should fetch all tags", async () => {
        const mockTags = ["react", "jest", "testing"];
        axios.mockResolvedValueOnce({ data: { tags: mockTags } });

        const result = await getTags();

        expect(axios).toHaveBeenCalledWith({ url: "/api/tags" });
        expect(result).toEqual(mockTags);
    });

    it("should handle getTags error", async () => {
        const error = new Error("Fetch failed");
        axios.mockRejectedValueOnce(error);

        await getTags();

        expect(errorHandler).toHaveBeenCalledWith(error);
    });
});
