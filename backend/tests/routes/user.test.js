const request = require("supertest");
const express = require("express");

// 1. Mockeamos el middleware de autenticación ANTES de requerir las rutas.
// Usamos una variable mutable para poder cambiar el comportamiento del middleware 
// dependiendo del test (por ejemplo, simular usuario logueado vs no autorizado).
let mockAuthImplementation = (req, res, next) => next();

jest.mock("../../middleware/authentication", () => {
    return jest.fn((req, res, next) => mockAuthImplementation(req, res, next));
});

// 2. Mockeamos bcrypt para el método updateUser (por si cambian la contraseña)
jest.mock("../../helper/bcrypt", () => ({
    bcryptHash: jest.fn().mockResolvedValue("newHashedPassword"),
}));

// 3. Importamos las dependencias reales después de hacer los mocks
const userRoutes = require("../../routes/user");
const errorHandler = require("../../middleware/errorHandler");
const { bcryptHash } = require("../../helper/bcrypt");

// 4. Configuramos la app de Express para estas pruebas
const app = express();
app.use(express.json());
app.use("/api/user", userRoutes);
app.use(errorHandler);

let server;

describe("User Routes (Current User & Update) - Integration Tests", () => {
    
    beforeAll((done) => {
        server = app.listen(0, done);
    });

    afterAll((done) => {
        server.close(done);
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("GET /api/user (Current User)", () => {
        it("should return the currently logged-in user", async () => {
            // A. Preparación (Arrange)
            // Simulamos que el middleware verifyToken funcionó y adjuntó el usuario al request
            const mockLoggedUser = {
                dataValues: {
                    id: 1,
                    username: "testuser",
                    bio: "hello",
                    image: null
                },
                get() { return this.dataValues; },
                toJSON() {
                    return { ...this.get() };
                }
            };

            mockAuthImplementation = (req, res, next) => {
                req.loggedUser = mockLoggedUser;
                // El controlador currentUser espera que el email venga en los headers por alguna razón
                req.headers.email = "test@example.com"; 
                next();
            };

            // B. Acción (Act)
            const response = await request(server).get("/api/user");

            // C. Afirmación (Assert)
            expect(response.status).toBe(200);
            expect(response.body.user).toBeDefined();
            expect(response.body.user.email).toBe("test@example.com");
            expect(response.body.user.username).toBe("testuser");
        });

        it("should return an error if the user is not authenticated", async () => {
            // A. Preparación
            // Simulamos que el middleware no adjuntó nada (o lo dejó pasar sin usuario)
            mockAuthImplementation = (req, res, next) => {
                req.loggedUser = null;
                next();
            };

            // B. Acción
            const response = await request(server).get("/api/user");

            // C. Afirmación
            // El controlador lanza UnauthorizedError, que probablemente se traduce en un 401
            expect(response.status).not.toBe(200);
            expect(response.body.user).toBeUndefined();
        });
    });

    describe("PUT /api/user (Update User)", () => {
        it("should successfully update user details", async () => {
            // A. Preparación
            // Creamos un mock del usuario logueado con una función 'save' espiable
            const mockLoggedUser = {
                username: "oldusername",
                bio: "oldbio",
                dataValues: {},
                save: jest.fn().mockResolvedValue(true),
                get() { return { username: this.username, bio: this.bio }; },
                toJSON() { return { ...this.get() }; }
            };

            mockAuthImplementation = (req, res, next) => {
                req.loggedUser = mockLoggedUser;
                next();
            };

            const requestBody = {
                user: {
                    username: "newusername",
                    bio: "newbio"
                }
            };

            // B. Acción
            const response = await request(server)
                .put("/api/user")
                .send(requestBody);

            // C. Afirmación
            expect(response.status).toBe(200);
            expect(mockLoggedUser.save).toHaveBeenCalledTimes(1);
            expect(bcryptHash).not.toHaveBeenCalled(); // No enviamos password, no debe llamarse
            // Verificamos que los valores mutaron en el mock antes de guardarse
            expect(mockLoggedUser.username).toBe("newusername");
            expect(mockLoggedUser.bio).toBe("newbio");
        });

        it("should hash the new password if provided", async () => {
            // A. Preparación
            const mockLoggedUser = {
                password: "oldHashedPassword",
                dataValues: {},
                save: jest.fn().mockResolvedValue(true),
                get() { return {}; },
                toJSON() { return {}; }
            };

            mockAuthImplementation = (req, res, next) => {
                req.loggedUser = mockLoggedUser;
                next();
            };

            const requestBody = {
                user: {
                    password: "newPlainTextPassword"
                }
            };

            // B. Acción
            const response = await request(server)
                .put("/api/user")
                .send(requestBody);

            // C. Afirmación
            expect(response.status).toBe(200);
            expect(bcryptHash).toHaveBeenCalledWith("newPlainTextPassword");
            expect(mockLoggedUser.password).toBe("newHashedPassword"); // Valor devuelto por nuestro mock de bcrypt
            expect(mockLoggedUser.save).toHaveBeenCalledTimes(1);
        });
    });
});
