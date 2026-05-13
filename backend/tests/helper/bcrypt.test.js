const bcrypt = require("bcrypt");
const { bcryptHash, bcryptCompare } = require("../../helper/bcrypt");

jest.mock("bcrypt");

describe("Bcrypt Helper", () => {
    const plainPassword = "mypassword123";
    const hashedPassword = "$2b$10$abcdefghijklmnopqrstuvwxyz";

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("bcryptHash", () => {
        it("should hash password with bcrypt", async () => {
            bcrypt.hash.mockResolvedValue(hashedPassword);

            const result = await bcryptHash(plainPassword);

            expect(bcrypt.hash).toHaveBeenCalledWith(plainPassword, 10);
            expect(result).toBe(hashedPassword);
        });

        it("should handle long passwords", async () => {
            const longPassword = "a".repeat(100);
            bcrypt.hash.mockResolvedValue(hashedPassword);

            const result = await bcryptHash(longPassword);

            expect(bcrypt.hash).toHaveBeenCalledWith(longPassword, 10);
            expect(result).toBe(hashedPassword);
        });

        it("should throw error on hash failure", async () => {
            const error = new Error("Hashing failed");
            bcrypt.hash.mockRejectedValue(error);

            await expect(bcryptHash(plainPassword)).rejects.toThrow(
                "Hashing failed",
            );
        });
    });

    describe("bcryptCompare", () => {
        it("should return true for matching password", async () => {
            bcrypt.compare.mockResolvedValue(true);

            const result = await bcryptCompare(plainPassword, hashedPassword);

            expect(bcrypt.compare).toHaveBeenCalledWith(
                plainPassword,
                hashedPassword,
            );
            expect(result).toBe(true);
        });

        it("should return false for non-matching password", async () => {
            bcrypt.compare.mockResolvedValue(false);

            const result = await bcryptCompare("wrongpassword", hashedPassword);

            expect(bcrypt.compare).toHaveBeenCalledWith(
                "wrongpassword",
                hashedPassword,
            );
            expect(result).toBe(false);
        });

        it("should throw error on compare failure", async () => {
            const error = new Error("Comparison failed");
            bcrypt.compare.mockRejectedValue(error);

            await expect(
                bcryptCompare(plainPassword, hashedPassword),
            ).rejects.toThrow("Comparison failed");
        });
    });
});
