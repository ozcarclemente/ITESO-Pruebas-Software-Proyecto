const {
    Given,
    When,
    Then,
    Before,
    After,
    setDefaultTimeout,
} = require("@cucumber/cucumber");
const { chromium } = require("@playwright/test");

setDefaultTimeout(60 * 1000);

let browser;
let page;
let currentArticleSlug; // tracks the slug after create/edit

const TEST_USER = {
    username: "exampleUser1",
    email: "example1@mail.com",
    password: "examplePwd1",
};

Before(async function () {
    browser = await chromium.launch({ headless: true }); // change headless to false if you want to see the tests execute in browser windows
    page = await browser.newPage();
});

After(async function () {
    if (page) await page.close();
    if (browser) await browser.close();
});

/*
  Background:
    Given I am logged in with exampleUser1 credentials
*/
Given("I am logged in with exampleUser1 credentials", async function () {
    console.log("Navigating to login page...");
    await page.goto("http://localhost:3000/#/login");
    await page.waitForTimeout(2000);

    console.log("Waiting for email input to load...");
    await page.waitForSelector('input[name="email"]', { timeout: 10000 });

    console.log("Inputting email and password...");
    await page.fill('input[name="email"]', TEST_USER.email);
    await page.fill('input[name="password"]', TEST_USER.password);

    console.log("Clicking 'Login' button...");
    await page.click('button:has-text("Login")');
    await page.waitForTimeout(5000);

    console.log("Waiting for home page to load...");
    await page.waitForSelector("nav", { timeout: 30000 });
    await page.waitForTimeout(2000);

    const storedAuth = await page.evaluate(() => {
        const stored = localStorage.getItem("loggedUser");
        return stored ? JSON.parse(stored) : null;
    });

    if (!storedAuth || !storedAuth.loggedUser || !storedAuth.loggedUser.token) {
        throw new Error(
            `Login failed: localStorage does not contain valid auth: ${JSON.stringify(storedAuth)}`,
        );
    }

    console.log(
        "Login successful. Token:",
        storedAuth.loggedUser.token.substring(0, 20),
    );
});

// Given: I navigate to the new article page
Given("I navigate to the new article page", async function () {
    console.log("Navigating to new article form...");
    await page.goto("http://localhost:3000/#/editor");
    await page.waitForSelector(".editor-page", { timeout: 30000 });
    await page.waitForTimeout(1000);
    console.log("Arrived to new article form.");
});

// Scenario: User creates a new article successfully
When("I input {string} in the article title", async function (title) {
    console.log(`Inputting title: "${title}"...`);
    await page.waitForSelector('input[name="title"]', { timeout: 10000 });
    await page.fill('input[name="title"]', title);
});

When(
    "I input {string} in the article description",
    async function (description) {
        console.log(`Inputting description: "${description}"...`);
        await page.waitForSelector('input[name="description"]', {
            timeout: 10000,
        });
        await page.fill('input[name="description"]', description);
    },
);

When("I input {string} in the article body", async function (body) {
    console.log(`Inputting body: "${body}"...`);
    await page.waitForSelector('textarea[name="body"]', { timeout: 10000 });
    await page.fill('textarea[name="body"]', body);
});

When("I publish the article", async function () {
    console.log("Clicking 'Publish Article' button...");
    await page.click('button:has-text("Publish Article")');

    console.log("Redirecting to article page...");
    await page.waitForSelector(".article-page", { timeout: 30000 });
    await page.waitForTimeout(2000);

    // capture the slug from the URL so other steps can reference it
    const url = page.url();
    const match = url.match(/#\/article\/(.+)$/);
    if (match) {
        currentArticleSlug = match[1];
        console.log(`Article published with slug: ${currentArticleSlug}`);
    }
});

// Scenario: User edits an existing article
When("I click the Edit Article button", async function () {
    console.log("Clicking 'Edit Article' button...");
    await page.waitForSelector('a:has-text("Edit Article")', {
        timeout: 10000,
    }); // the edit article text is an <a> inside a button
    await page.click('a:has-text("Edit Article")');

    console.log("Waiting for editor page to load...");
    await page.waitForSelector(".editor-page", { timeout: 30000 });
    await page.waitForTimeout(1500);
});

When("I update the article title with {string}", async function (newTitle) {
    console.log(`Updating title to: "${newTitle}"...`);
    await page.waitForSelector('input[name="title"]', { timeout: 10000 });
    await page.fill('input[name="title"]', newTitle);
});

When(
    "I update the article description with {string}",
    async function (newDesc) {
        console.log(`Updating description to: "${newDesc}..."`);
        await page.waitForSelector('input[name="description"]', {
            timeout: 10000,
        });
        await page.fill('input[name="description"]', newDesc);
    },
);

When("I update the article body with {string}", async function (newBody) {
    console.log(`Updating body to: "${newBody}"...`);
    await page.waitForSelector('textarea[name="body"]', { timeout: 10000 });
    await page.fill('textarea[name="body"]', newBody);
});

When("I submit the article update", async function () {
    console.log("Clicking 'Update Article' button...");
    await page.click('button:has-text("Update Article")');

    console.log("Redirecting to updated article page...");
    await page.waitForSelector(".article-page", { timeout: 30000 });
    await page.waitForTimeout(2000);

    // re-capture slug in case it changed after update
    const url = page.url();
    const match = url.match(/#\/article\/(.+)$/);
    if (match) {
        currentArticleSlug = match[1];
        console.log(`Updated article slug: ${currentArticleSlug}`);
    }
});

// Scenario: User deletes an article
When("I click the Delete Article button and confirm", async function () {
    console.log("Setting up dialog handler to accept confirmation...");
    page.on("dialog", (dialog) => {
        console.log(`Dialog: "${dialog.message()}", accepting...`);
        dialog.accept();
    });

    console.log("Clicking 'Delete Article' button...");
    await page.waitForSelector('button:has-text("Delete Article")', {
        timeout: 10000,
    });
    await page.click('button:has-text("Delete Article")');

    console.log("Redirecting to home page...");
    await page.waitForURL("http://localhost:3000/#/", { timeout: 30000 });
    await page.waitForTimeout(2000);
    console.log("Redirected to home page after deletion.");
});

// Then assertions
Then("I should be redirected to the article page", async function () {
    console.log("Asserting we are on an article page...");
    const url = page.url();
    if (!url.includes("/#/article/")) {
        throw new Error(
            `Expected to be on an article page, but current URL is: ${url}`,
        );
    }
    await page.waitForSelector(".article-page", { timeout: 10000 });
    console.log("Confirmed: on article page.");
});

Then(
    "I should see {string} as the article title",
    async function (expectedTitle) {
        console.log(`Asserting article title is: "${expectedTitle}"...`);
        await page.waitForSelector(".article-page h1", { timeout: 10000 });
        const titleText = await page.textContent(".article-page h1");

        if (!titleText || !titleText.includes(expectedTitle)) {
            throw new Error(
                `Expected article title to contain "${expectedTitle}", but got: "${titleText}"`,
            );
        }
        console.log(`Title confirmed: "${titleText}."`);
    },
);

Then("I should be redirected to the home page", async function () {
    console.log("Asserting we are on the home page...");
    const url = page.url();
    if (!url.endsWith("/#/")) {
        throw new Error(
            `Expected to be on the home page (/#/), but current URL is: ${url}`,
        );
    }
    console.log("Confirmed: on home page.");
});

Then(
    "the article {string} should not appear in the feed",
    async function (title) {
        console.log(
            `Asserting article "${title}" is not visible in the feed...`,
        );

        await page.waitForSelector(".article-preview", { timeout: 30000 });
        await page.waitForTimeout(1000);

        const articleTitles = await page.$$eval(
            ".article-preview h1",
            (elements) => elements.map((el) => el.textContent),
        );

        const found = articleTitles.some((t) => t && t.includes(title));
        if (found) {
            throw new Error(
                `Expected article "${title}" to be deleted, but it still appears in the feed.`,
            );
        }
        console.log(`Confirmed: article "${title}" is not in the feed.`);
    },
);
