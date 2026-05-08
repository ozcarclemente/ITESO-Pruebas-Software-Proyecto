const request = require("supertest");
const express = require("express");

// 1. Importamos el enrutador real y el middleware de errores
const usersRoutes = require("../../routes/users");
const errorHandler = require("../../middleware/errorHandler");

// 2. Le decimos a Jest que intercepte cualquier importación a la carpeta models
jest.mock("../../models", () => {
    return {
        User: {
            findOne: jest.fn(),
            create: jest.fn(),
        },
    };
});

// También mockeamos el helper de JWT porque en el entorno de pruebas
// no tenemos las variables de entorno (.env) cargadas automáticamente,
// y jwt.sign lanza error si no tiene un 'secret'.
jest.mock("../../helper/jwt", () => {
    return {
        jwtSign: jest.fn().mockResolvedValue("mocked-jwt-token"),
    };
});

// Mockeamos bcrypt para el Login y Registro (hash)
jest.mock("../../helper/bcrypt", () => {
    return {
        bcryptHash: jest.fn(),
        bcryptCompare: jest.fn(),
    };
});

// Importamos los mocks recién creados
const { User } = require("../../models");
const { bcryptCompare } = require("../../helper/bcrypt");

// 3. Configuramos una instancia de Express específica para esta prueba
const app = express();
app.use(express.json());
app.use("/api/users", usersRoutes);
app.use(errorHandler);

let server;

describe("Users Routes - Integration Tests with Mocks", () => {
    
    beforeAll((done) => {
        // Iniciamos el servidor en un puerto aleatorio (0) una sola vez por archivo
        server = app.listen(0, done);
    });

    afterAll((done) => {
        // Cerramos el servidor al terminar todas las pruebas para liberar el puerto
        server.close(done);
    });

    // Limpiamos los mocks antes de cada prueba
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("POST /api/users (Sign Up)", () => {
        
        it("should successfully register a new user", async () => {
            // A. Preparación (Arrange)
            User.findOne.mockResolvedValue(null);
            
            const mockCreatedUser = {
                dataValues: {
                    id: 1,
                    email: "test@example.com",
                    username: "testuser",
                    bio: "hello",
                    image: null
                },
                get() {
                    return this.dataValues;
                },
                toJSON() {
                    return {
                        ...this.get(),
                        token: this.dataValues.token,
                        id: undefined,
                        password: undefined
                    };
                }
            };
            User.create.mockResolvedValue(mockCreatedUser);

            const requestBody = {
                user: {
                    username: "testuser",
                    email: "test@example.com",
                    password: "password123",
                    bio: "hello",
                    image: null
                }
            };

            // B. Acción (Act)
            const response = await request(server)
                .post("/api/users")
                .send(requestBody);

            // C. Afirmación (Assert)
            expect(response.status).toBe(201);
            expect(response.body.user).toBeDefined();
            expect(response.body.user.email).toBe("test@example.com");
            expect(response.body.user.token).toBeDefined();
            
            expect(User.findOne).toHaveBeenCalledTimes(1);
            expect(User.findOne).toHaveBeenCalledWith({
                where: { email: "test@example.com" }
            });
            expect(User.create).toHaveBeenCalledTimes(1);
        });

        it("should return an error if the email is already taken", async () => {
             // A. Preparación (Arrange)
             User.findOne.mockResolvedValue({ id: 1, email: "taken@example.com" });

             const requestBody = {
                 user: {
                     username: "newuser",
                     email: "taken@example.com",
                     password: "password123"
                 }
             };
 
             // B. Acción (Act)
             const response = await request(server)
                 .post("/api/users")
                 .send(requestBody);
 
             // C. Afirmación (Assert)
             // Nota: Si tu errorHandler devuelve un 409 o 422 para AlreadyTakenError,
             // esto pasará ya que no es 201.
             expect(response.status).not.toBe(201);
             expect(User.create).not.toHaveBeenCalled();
        });
    });

    describe("POST /api/users/login (Sign In)", () => {
        
        it("should successfully log in an existing user", async () => {
            // A. Preparación
            const mockExistentUser = {
                id: 1,
                email: "test@example.com",
                username: "testuser",
                password: "hashedPassword123", // Contraseña en el nivel raíz para Sequelize proxy
                dataValues: {
                    id: 1,
                    email: "test@example.com",
                    username: "testuser",
                    password: "hashedPassword123" 
                },
                get() { return this.dataValues; },
                toJSON() {
                    return {
                        ...this.get(),
                        token: this.dataValues.token,
                        id: undefined,
                        password: undefined
                    };
                }
            };
            
            // Simular que el usuario SÍ existe en la DB
            User.findOne.mockResolvedValue(mockExistentUser);
            // Simular que la contraseña es CORRECTA
            bcryptCompare.mockResolvedValue(true);

            const requestBody = {
                user: {
                    email: "test@example.com",
                    password: "password123" // Contraseña que envía el cliente
                }
            };

            // B. Acción
            const response = await request(server)
                .post("/api/users/login")
                .send(requestBody);

            // C. Afirmación
            expect(response.status).toBe(200);
            expect(response.body.user).toBeDefined();
            expect(response.body.user.email).toBe("test@example.com");
            expect(response.body.user.token).toBeDefined();
            // Verificamos que bcrypt se llamó con la contraseña plana y el hash
            expect(bcryptCompare).toHaveBeenCalledWith("password123", "hashedPassword123");
        });

        it("should return an error for invalid credentials", async () => {
            // A. Preparación
            const mockExistentUser = { 
                password: "hashedPassword123" 
            }; 
            
            User.findOne.mockResolvedValue(mockExistentUser);
            // Simular que la contraseña es INCORRECTA
            bcryptCompare.mockResolvedValue(false);

            const requestBody = {
                user: {
                    email: "test@example.com",
                    password: "wrongpassword"
                }
            };

            // B. Acción
            const response = await request(server)
                .post("/api/users/login")
                .send(requestBody);

            // C. Afirmación
            expect(response.status).not.toBe(200); 
            expect(response.body.user).toBeUndefined();
        });
    });
});
