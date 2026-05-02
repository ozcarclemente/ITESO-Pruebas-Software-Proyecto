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
let lastCommentText;

const TEST_USER = {
    username: "exampleUser1",
    email: "example1@mail.com",
    password: "examplePwd1",
};

Before(async function () {
    browser = await chromium.launch({ headless: true });
    page = await browser.newPage();
});

After(async function () {
    if (page) await page.close();
    if (browser) await browser.close();
});

// Background steps
Given("I am logged in with test user credentials", async function () {
    console.log("[TEST] Going to login page...");
    await page.goto("http://localhost:3000/#/login");
    await page.waitForTimeout(2000);

    console.log("[TEST] Waiting for email input...");
    await page.waitForSelector('input[name="email"]', { timeout: 10000 });

    console.log("[TEST] Filling email and password...");
    await page.fill('input[name="email"]', TEST_USER.email);
    await page.fill('input[name="password"]', TEST_USER.password);

    console.log("[TEST] Clicking login button...");
    await page.click('button:has-text("Login")');
    await page.waitForTimeout(5000);

    console.log("[TEST] Waiting for home page...");
    await page.waitForSelector("nav", { timeout: 30000 });
    await page.waitForTimeout(2000);

    // Get actual token from localStorage (set by login form)
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
        "[TEST] Login successful! Token:",
        storedAuth.loggedUser.token.substring(0, 20) + "...",
    );
});

Given("I navigate to article {string}", async function (slug) {
    console.log(`[TEST] Navigating to article: ${slug}`);
    await page.goto(`http://localhost:3000/#/article/${slug}`);
    console.log("[TEST] Waiting for article page to load...");
    await page.waitForSelector(".article-page", { timeout: 30000 });
    console.log("[TEST] Waiting for components to fully render...");
    await page.waitForTimeout(2000);
    console.log("[TEST] Article page ready!");
});

// Comment write/submit steps
When("I write a comment {string}", async function (text) {
    console.log("[TEST] Waiting for textarea to be ready...");
    await page.waitForSelector("textarea.form-control", { timeout: 30000 });
    console.log("[TEST] Typing comment...");
    await page.locator("textarea.form-control").click();
    await page.locator("textarea.form-control").type(text, { delay: 50 });
    lastCommentText = text;
});

When("I submit the comment", async function () {
    console.log("[TEST] Submitting comment...");
    await page.click('button:has-text("Post Comment")');
    await page.waitForTimeout(5000);
    console.log("[TEST] Reloading page to see new comment...");
    await page.reload();
    await page.waitForTimeout(5000);
    console.log("[TEST] Waiting for comment to appear...");
    await page.waitForSelector(`.card-text:has-text("${lastCommentText}")`, {
        timeout: 60000,
    });
    console.log("[TEST] Comment appeared!");
});

Then("I should see {string} in the comments list", async function (text) {
    const commentLocator = page.locator(`.card-text:has-text("${text}")`);
    const count = await commentLocator.count();
    if (count === 0) {
        throw new Error(`Expected to find comment "${text}" in comments list`);
    }
});

// Delete steps
Given("I have posted a comment {string}", async function (text) {
    console.log(`[TEST] Posting comment: "${text}"`);
    console.log("[TEST] Waiting for textarea to be ready...");
    await page.waitForSelector("textarea.form-control", { timeout: 30000 });
    console.log("[TEST] Typing comment...");
    await page.locator("textarea.form-control").click();
    await page.locator("textarea.form-control").type(text, { delay: 50 });
    lastCommentText = text;
    await page.click('button:has-text("Post Comment")');
    await page.waitForTimeout(5000);
    console.log("[TEST] Reloading page...");
    await page.reload();
    await page.waitForTimeout(5000);
    console.log("[TEST] Waiting for comment to appear...");
    await page.waitForSelector(`.card-text:has-text("${text}")`, {
        timeout: 60000,
    });
    console.log("[TEST] Comment posted!");
});

When("I delete that comment", async function () {
    console.log("[TEST] Deleting comment...");
    // Pre-register dialog handler before clicking delete
    page.on("dialog", (dialog) => dialog.accept());

    // Find the card containing the comment and click its delete button
    const commentCard = page.locator(
        `.card:has(.card-text:has-text("${lastCommentText}"))`,
    );
    const deleteButton = commentCard.locator("button.btn-outline-secondary");
    await deleteButton.click();
    await page.waitForTimeout(5000);

    // Wait for comment to disappear from DOM
    console.log("[TEST] Waiting for comment to disappear...");
    await page.waitForFunction(
        (text) => {
            // eslint-disable-next-line no-undef
            const comments = document.querySelectorAll(".card-text");
            return !Array.from(comments).some((el) =>
                el.textContent.includes(text),
            );
        },
        lastCommentText,
        { timeout: 60000 },
    );
    console.log("[TEST] Comment deleted!");
});

Then(
    "the comment {string} should not appear in the list",
    async function (text) {
        const commentLocator = page.locator(`.card-text:has-text("${text}")`);
        const count = await commentLocator.count();
        if (count > 0) {
            throw new Error(
                `Expected comment "${text}" to be deleted but it still appears`,
            );
        }
    },
);
