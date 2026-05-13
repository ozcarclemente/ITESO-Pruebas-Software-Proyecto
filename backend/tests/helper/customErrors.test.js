const {
    AlreadyTakenError,
    FieldRequiredError,
    ForbiddenError,
    NotFoundError,
    UnauthorizedError,
    ValidationError,
} = require("../../helper/customErrors");

describe("Custom Errors", () => {
    describe("UnauthorizedError", () => {
        it("should create error with default message", () => {
            const error = new UnauthorizedError();

            expect(error.message).toBe("You need to login first!");
            expect(error.name).toBe("UnauthorizedError");
            expect(error).toBeInstanceOf(Error);
        });
    });

    describe("NotFoundError", () => {
        it("should create error with property name", () => {
            const error = new NotFoundError("User");

            expect(error.message).toBe("User not found ");
            expect(error.name).toBe("NotFoundError");
        });

        it("should create error with property and message", () => {
            const error = new NotFoundError("User", "please sign up");

            expect(error.message).toBe("User not found please sign up");
            expect(error.name).toBe("NotFoundError");
        });
    });

    describe("ForbiddenError", () => {
        it("should create error with resource type", () => {
            const error = new ForbiddenError("article");

            expect(error.message).toBe(
                "You are not the author of this article",
            );
            expect(error.name).toBe("ForbiddenError");
        });
    });

    describe("ValidationError", () => {
        it("should create validation error with message", () => {
            const error = new ValidationError("Invalid data");

            expect(error.message).toBe("Invalid data");
            expect(error.name).toBe("ValidationError");
            expect(error).toBeInstanceOf(ValidationError);
        });
    });

    describe("FieldRequiredError", () => {
        it("should create error for required field", () => {
            const error = new FieldRequiredError("A username");

            expect(error.message).toBe("A username is required");
            expect(error.name).toBe("FieldRequiredError");
            expect(error).toBeInstanceOf(ValidationError);
        });
    });

    describe("AlreadyTakenError", () => {
        it("should create error with property name", () => {
            const error = new AlreadyTakenError("Email");

            expect(error.message).toBe("Email already exists.. ");
            expect(error.name).toBe("AlreadyTakenError");
            expect(error).toBeInstanceOf(ValidationError);
        });

        it("should create error with property and message", () => {
            const error = new AlreadyTakenError("Email", "try logging in");

            expect(error.message).toBe("Email already exists.. try logging in");
            expect(error.name).toBe("AlreadyTakenError");
        });
    });
});
