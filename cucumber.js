module.exports = {
    default: {
        require: ["tests/system/steps/**/*.js"],
        format: ["progress", "html:cucumber-report.html"],
        formatOptions: { snippetInterface: "async-await" },
        paths: ["tests/system/features/**/*.feature"],
    },
};
