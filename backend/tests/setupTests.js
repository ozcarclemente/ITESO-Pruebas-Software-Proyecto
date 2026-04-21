/*
 Setup for Postgres database connection during tests
*/

require("dotenv").config({ path: "./backend/.env" });
import { beforeAll } from "vitest";
const db = require("../models");

beforeAll(async () => {
    // sets up database for tests
    try {
        // sync the database
        await db.sequelize.sync({ force: true });
        console.log("Test Database synced.");
    } catch (err) {
        // throw error if unable to connect to database
        console.error("Unable to connect to the test database:", err);
        process.exit(1);
    }
});
