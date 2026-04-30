import errorHandler from "../../src/helpers/errorHandler";

describe("errorHandler", () => {
    beforeEach(() => {
        jest.spyOn(console, "log").mockImplementation(() => {});
        jest.spyOn(console, "dir").mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe("Error with response", () => {
        const errorStatuses = [401, 403, 404, 422, 500];

        test.each(errorStatuses)(
            "Status %p should throw error",
            (statusCode) => {
                const error = {
                    response: {
                        status: statusCode,
                        data: {
                            errors: {
                                body: ["Error message"],
                            },
                        },
                    },
                };

                expect(() => errorHandler(error)).toThrow("Error message");
                expect(console.log).toHaveBeenCalled();
            },
        );

        it("should log response and error message", () => {
            const error = {
                response: {
                    status: 401,
                    data: {
                        errors: {
                            body: ["Unauthorized"],
                        },
                    },
                },
            };

            expect(() => errorHandler(error)).toThrow();
            expect(console.log).toHaveBeenCalledWith(
                error.response,
                "Unauthorized",
            );
        });

        it("should call console.dir for non-critical status codes", () => {
            const error = {
                response: {
                    status: 200,
                    data: {
                        errors: {
                            body: ["Some error"],
                        },
                    },
                },
            };

            errorHandler(error);
            expect(console.dir).toHaveBeenCalledWith(error);
        });
    });

    describe("Error without response", () => {
        it("should log error when no response", () => {
            const error = new Error("Network error");

            errorHandler(error);

            expect(console.log).toHaveBeenCalledWith(error);
        });

        it("should not throw when no response", () => {
            const error = { message: "No response" };

            expect(() => errorHandler(error)).not.toThrow();
        });
    });
});
