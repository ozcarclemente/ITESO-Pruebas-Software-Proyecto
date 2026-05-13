jest.mock("../../helper/customErrors", () => ({
    UnauthorizedError: class UnauthorizedError extends Error {
        constructor(message) {
            super(message);
            this.name = "UnauthorizedError";
        }
    },
    ForbiddenError: class ForbiddenError extends Error {
        constructor(message) {
            super(message);
            this.name = "ForbiddenError";
        }
    },
    NotFoundError: class NotFoundError extends Error {
        constructor(message) {
            super(message);
            this.name = "NotFoundError";
        }
    },
    ValidationError: class ValidationError extends Error {
        constructor(message) {
            super(message);
            this.name = "ValidationError";
        }
    },
}));

const errorHandler = require("../../middleware/errorHandler");
const {
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
    ValidationError,
} = require("../../helper/customErrors");

describe("Error Handler Middleware", () => {
    let req, res, next;

    beforeEach(() => {
        req = {};
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        next = jest.fn();

        jest.spyOn(console, "log").mockImplementation(() => {});
    });

    afterEach(() => {
        console.log.mockRestore();
    });

    it("should handle UnauthorizedError with 401 status", () => {
        const error = new UnauthorizedError("Unauthorized");

        errorHandler(error, req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            errors: { body: ["Unauthorized"] },
        });
    });

    it("should handle ForbiddenError with 403 status", () => {
        const error = new ForbiddenError("Forbidden");

        errorHandler(error, req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
            errors: { body: ["Forbidden"] },
        });
    });

    it("should handle NotFoundError with 404 status", () => {
        const error = new NotFoundError("Not Found");

        errorHandler(error, req, res, next);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            errors: { body: ["Not Found"] },
        });
    });

    it("should handle ValidationError with 422 status", () => {
        const error = new ValidationError("Validation failed");

        errorHandler(error, req, res, next);

        expect(res.status).toHaveBeenCalledWith(422);
        expect(res.json).toHaveBeenCalledWith({
            errors: { body: ["Validation failed"] },
        });
    });

    it("should handle generic Error with 500 status", () => {
        const error = new Error("Internal Server Error");

        errorHandler(error, req, res, next);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            errors: { body: ["Internal Server Error"] },
        });
    });

    it("should log errors", () => {
        const error = new UnauthorizedError("Test error");

        errorHandler(error, req, res, next);

        expect(console.log).toHaveBeenCalled();
    });
});
