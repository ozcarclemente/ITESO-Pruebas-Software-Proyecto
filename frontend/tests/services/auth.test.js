import axios from "axios";

jest.mock("axios");
jest.mock("../../src/helpers/errorHandler", () => jest.fn());

import userLogin from "../../src/services/userLogin";
import userSignUp from "../../src/services/userSignUp";
import userUpdate from "../../src/services/userUpdate";
import userLogout from "../../src/services/userLogout";
import errorHandler from "../../src/helpers/errorHandler";

describe("Auth Services", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
    });

    describe("userLogin", () => {
        it("should login with email and password", async () => {
            const mockUser = {
                username: "john",
                email: "john@example.com",
                token: "abc123",
            };

            axios.mockResolvedValueOnce({
                data: { user: mockUser },
            });

            const result = await userLogin({
                email: "john@example.com",
                password: "password123",
            });

            expect(axios).toHaveBeenCalledWith({
                data: { user: { email: "john@example.com", password: "password123" } },
                method: "POST",
                url: "api/users/login",
            });
            expect(result.isAuth).toBe(true);
            expect(result.loggedUser).toEqual(mockUser);
        });

        it("should store auth data in localStorage", async () => {
            const mockUser = {
                username: "testuser",
                email: "test@example.com",
                token: "token123",
            };

            axios.mockResolvedValueOnce({
                data: { user: mockUser },
            });

            await userLogin({
                email: "test@example.com",
                password: "pass123",
            });

            const stored = JSON.parse(localStorage.getItem("loggedUser"));
            expect(stored.isAuth).toBe(true);
            expect(stored.loggedUser).toEqual(mockUser);
        });

        it("should generate Authorization header from token", async () => {
            const mockUser = {
                username: "user1",
                email: "user1@test.com",
                token: "jwt_token_xyz",
            };

            axios.mockResolvedValueOnce({
                data: { user: mockUser },
            });

            const result = await userLogin({
                email: "user1@test.com",
                password: "secret",
            });

            expect(result.headers).toEqual({
                Authorization: "Token jwt_token_xyz",
            });
        });

        it("should handle login error", async () => {
            const error = new Error("Invalid credentials");
            axios.mockRejectedValueOnce(error);

            await userLogin({
                email: "wrong@example.com",
                password: "wrong",
            });

            expect(errorHandler).toHaveBeenCalledWith(error);
        });

        it("should return complete auth object", async () => {
            const mockUser = {
                username: "john",
                email: "john@example.com",
                token: "token_123",
            };

            axios.mockResolvedValueOnce({
                data: { user: mockUser },
            });

            const result = await userLogin({
                email: "john@example.com",
                password: "pass",
            });

            expect(result).toHaveProperty("headers");
            expect(result).toHaveProperty("isAuth");
            expect(result).toHaveProperty("loggedUser");
        });
    });

    describe("userSignUp", () => {
        it("should signup with username, email, password", async () => {
            const mockUser = {
                username: "newuser",
                email: "new@example.com",
                token: "new_token_123",
            };

            axios.mockResolvedValueOnce({
                data: { user: mockUser },
            });

            const result = await userSignUp({
                username: "newuser",
                email: "new@example.com",
                password: "newpass123",
            });

            expect(axios).toHaveBeenCalledWith({
                data: { user: { username: "newuser", email: "new@example.com", password: "newpass123" } },
                method: "POST",
                url: "api/users",
            });
            expect(result.isAuth).toBe(true);
            expect(result.loggedUser).toEqual(mockUser);
        });

        it("should store signup data in localStorage", async () => {
            const mockUser = {
                username: "signup_user",
                email: "signup@test.com",
                token: "signup_token",
            };

            axios.mockResolvedValueOnce({
                data: { user: mockUser },
            });

            await userSignUp({
                username: "signup_user",
                email: "signup@test.com",
                password: "pass123",
            });

            const stored = JSON.parse(localStorage.getItem("loggedUser"));
            expect(stored.isAuth).toBe(true);
            expect(stored.loggedUser.username).toBe("signup_user");
        });

        it("should generate Authorization header from signup token", async () => {
            const mockUser = {
                username: "newuser",
                email: "new@example.com",
                token: "new_token_abc",
            };

            axios.mockResolvedValueOnce({
                data: { user: mockUser },
            });

            const result = await userSignUp({
                username: "newuser",
                email: "new@example.com",
                password: "pass",
            });

            expect(result.headers).toEqual({
                Authorization: "Token new_token_abc",
            });
        });

        it("should handle signup error", async () => {
            const error = new Error("Email already taken");
            axios.mockRejectedValueOnce(error);

            await userSignUp({
                username: "user",
                email: "taken@example.com",
                password: "pass",
            });

            expect(errorHandler).toHaveBeenCalledWith(error);
        });

        it("should return auth object on signup", async () => {
            const mockUser = {
                username: "newuser",
                email: "new@example.com",
                token: "token_new",
            };

            axios.mockResolvedValueOnce({
                data: { user: mockUser },
            });

            const result = await userSignUp({
                username: "newuser",
                email: "new@example.com",
                password: "pass",
            });

            expect(result).toHaveProperty("headers");
            expect(result).toHaveProperty("isAuth");
            expect(result).toHaveProperty("loggedUser");
        });
    });

    describe("userUpdate", () => {
        it("should update user profile", async () => {
            const headers = { Authorization: "Token test_token" };
            const mockUser = {
                username: "updated_user",
                email: "updated@example.com",
                bio: "Updated bio",
                image: "https://example.com/image.jpg",
            };

            axios.mockResolvedValueOnce({
                data: { user: mockUser },
            });

            const result = await userUpdate({
                headers,
                username: "updated_user",
                email: "updated@example.com",
                bio: "Updated bio",
                image: "https://example.com/image.jpg",
                password: "newpass",
            });

            expect(axios).toHaveBeenCalledWith({
                data: {
                    user: {
                        username: "updated_user",
                        email: "updated@example.com",
                        bio: "Updated bio",
                        image: "https://example.com/image.jpg",
                        password: "newpass",
                    },
                },
                headers,
                method: "PUT",
                url: "api/user",
            });
            expect(result.loggedUser).toEqual(mockUser);
        });

        it("should store updated user in localStorage", async () => {
            const headers = { Authorization: "Token token" };
            const mockUser = {
                username: "user",
                email: "user@test.com",
                bio: "New bio",
            };

            axios.mockResolvedValueOnce({
                data: { user: mockUser },
            });

            await userUpdate({
                headers,
                username: "user",
                email: "user@test.com",
                bio: "New bio",
                image: null,
                password: null,
            });

            const stored = JSON.parse(localStorage.getItem("loggedUser"));
            expect(stored.loggedUser).toEqual(mockUser);
        });

        it("should preserve headers in updated auth state", async () => {
            const headers = { Authorization: "Token abc123" };
            const mockUser = { username: "user" };

            axios.mockResolvedValueOnce({
                data: { user: mockUser },
            });

            const result = await userUpdate({
                headers,
                username: "user",
                email: "user@test.com",
                bio: null,
                image: null,
                password: null,
            });

            expect(result.headers).toEqual(headers);
        });

        it("should handle update error", async () => {
            const error = new Error("Update failed");
            axios.mockRejectedValueOnce(error);

            await userUpdate({
                headers: { Authorization: "Token test" },
                username: "user",
                email: "user@test.com",
                bio: null,
                image: null,
                password: null,
            });

            expect(errorHandler).toHaveBeenCalledWith(error);
        });

        it("should support partial updates", async () => {
            const headers = { Authorization: "Token test" };
            const mockUser = { username: "user", bio: "New bio" };

            axios.mockResolvedValueOnce({
                data: { user: mockUser },
            });

            const result = await userUpdate({
                headers,
                username: "user",
                email: null,
                bio: "New bio",
                image: null,
                password: null,
            });

            expect(result.loggedUser).toEqual(mockUser);
        });
    });

    describe("userLogout", () => {
        it("should clear localStorage", () => {
            localStorage.setItem("loggedUser", JSON.stringify({ test: true }));

            userLogout();

            expect(localStorage.getItem("loggedUser")).toBeNull();
        });

        it("should return auth false state", () => {
            const result = userLogout();

            expect(result.isAuth).toBe(false);
            expect(result.headers).toBeNull();
        });

        it("should return default user object", () => {
            const result = userLogout();

            expect(result.loggedUser).toEqual({
                bio: null,
                email: "",
                image: null,
                token: "",
                username: "",
            });
        });

        it("should be synchronous", () => {
            const result = userLogout();

            expect(result).not.toBeInstanceOf(Promise);
        });

        it("should not require parameters", () => {
            const result = userLogout();

            expect(result).toBeDefined();
            expect(result.isAuth).toBe(false);
        });

        it("should reset all user fields", () => {
            const result = userLogout();

            expect(result.loggedUser.username).toBe("");
            expect(result.loggedUser.email).toBe("");
            expect(result.loggedUser.token).toBe("");
            expect(result.loggedUser.bio).toBeNull();
            expect(result.loggedUser.image).toBeNull();
        });
    });
});
