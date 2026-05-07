require("dotenv").config({ path: `${__dirname}/../../.env` });
process.env.NODE_ENV = "development";

const Sequelize = require("sequelize");
const config = require("../../config/config.js")["development"];

async function createTestSequelize() {
    const sequelize = new Sequelize(
        config.database,
        config.username,
        config.password,
        config,
    );

    const db = {};

    // Load models
    const fs = require("fs");
    const path = require("path");
    const basename = path.basename(__filename);

    const modelsBasename = "index.js";
    fs.readdirSync(path.join(__dirname, "../../models"))
        .filter((file) => {
            return (
                file.indexOf(".") !== 0 &&
                file !== modelsBasename &&
                file.slice(-3) === ".js"
            );
        })
        .forEach((file) => {
            const model = require(path.join(__dirname, "../../models", file))(
                sequelize,
                Sequelize.DataTypes,
            );
            db[model.name] = model;
        });

    Object.keys(db).forEach((modelName) => {
        if (db[modelName].associate) {
            db[modelName].associate(db);
        }
    });

    db.sequelize = sequelize;
    db.Sequelize = Sequelize;

    await sequelize.sync({ alter: true });

    // Truncate all tables to ensure clean state
    const tables = Object.keys(db)
        .filter((key) => db[key].tableName)
        .map((key) => db[key].tableName);

    for (const table of tables) {
        await sequelize.query(`TRUNCATE TABLE "${table}" CASCADE`);
    }

    return db;
}

module.exports = { createTestSequelize };
