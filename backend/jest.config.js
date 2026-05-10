module.exports = {
  testEnvironment: "node",

  testMatch: ["<rootDir>/tests/**/*.test.js"],

  collectCoverageFrom: [
    "**/*.js",

    "!tests/**",
    "!node_modules/**",
    "!coverage/**",

    "!index.js",
    "!config/**",
    "!migrations/**",
    "!seeders/**",
    "!**/*.test.js",
  ],

  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/coverage/",
  ],

  coverageReporters: ["text", "json", "html", "lcov"],
};