require("@testing-library/jest-dom");

// Suppress console.error unless explicitly expected in tests
const originalError = console.error;
beforeAll(() => {
    console.error = jest.fn((...args) => {
        // Allow tests to check console.error with mockClear/restore pattern
        if (console.error._allowLog) {
            originalError(...args);
        }
    });
});

afterAll(() => {
    console.error = originalError;
});
