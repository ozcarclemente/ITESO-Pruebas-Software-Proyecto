import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import PopularTags from "../../src/components/PopularTags/PopularTags";
import getTags from "../../src/services/getTags";
import { useFeedContext } from "../../src/context/FeedContext";

jest.mock("../../src/services/getTags");
jest.mock("../../src/context/FeedContext");

describe("PopularTags Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useFeedContext.mockReturnValue({
            changeTab: jest.fn(),
        });
    });

    it("should display loading state initially", () => {
        getTags.mockReturnValue(new Promise(() => {}));
        render(<PopularTags />);
        expect(screen.getByText("Loading tags...")).toBeDefined();
    });

    it("should display tags after fetching", async () => {
        const mockTags = ["react", "testing"];
        getTags.mockResolvedValue(mockTags);

        render(<PopularTags />);

        await waitFor(() => {
            expect(screen.getByText("react")).toBeDefined();
            expect(screen.getByText("testing")).toBeDefined();
        });
    });

    it("should display error message when fetching fails", async () => {
        getTags.mockRejectedValue(new Error("Failed"));

        render(<PopularTags />);

        await waitFor(() => {
            expect(screen.getByText("Tags list not available")).toBeDefined();
        });
    });
});
