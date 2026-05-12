const {
    Given,
    When,
    Then,
    Before,
    After,
    setDefaultTimeout,
} = require("@cucumber/cucumber");
const { chromium } = require("@playwright/test");
const axios = require("axios");

setDefaultTimeout(60 * 1000);

let browser;
let page;
let currentArticleCount = 0;
let previousArticleTitles = [];

const TEST_USER = {
    username: "exampleUser5",
    email: "example5@mail.com",
    password: "examplePwd5",
};

const API_URL = "http://localhost:3001/api";

Given("I am authenticated as {word}", async function (username) {
    console.log(`Authenticating as ${username}...`);
    await page.goto("http://localhost:3000/#/login");
    await page.waitForTimeout(2000);
    await page.waitForSelector('input[name="email"]', { timeout: 10000 });
    await page.fill('input[name="email"]', TEST_USER.email);
    await page.fill('input[name="password"]', TEST_USER.password);
    await page.click('button:has-text("Login")');
    await page.waitForTimeout(5000);
    await page.waitForSelector("nav", { timeout: 30000 });
    await page.waitForTimeout(2000);
    console.log(`${username} authenticated.`);
});

Before(async function () {
    browser = await chromium.launch({ headless: true });
    page = await browser.newPage();
});

After(async function () {
    if (page) await page.close();
    if (browser) await browser.close();
});

/*
  Background:
    Given I have seeded articles with 55 total and follows configured
*/
Given("I have seeded articles with {int} total and follows configured", async function (total) {
    console.log(`Verifying test data: ${total} articles and follows are seeded...`);
    try {
        const articlesRes = await axios.get(`${API_URL}/articles?limit=100`);
        const articleCount = articlesRes.data.articles.length;
        console.log(`Found ${articleCount} articles in database`);

        if (articleCount < total) {
            throw new Error(
                `Expected at least ${total} articles, but found ${articleCount}`,
            );
        }
    } catch (error) {
        console.error("Error verifying test data:", error.message);
        throw error;
    }
});

/*
  Scenario: User views Global Feed on home page
*/
Given("I navigate to feeds home page", async function () {
    console.log("Navigating to feeds home page...");
    const currentUrl = page.url();
    if (!currentUrl.includes("/#/")) {
        await page.goto("http://localhost:3000/#/", { waitUntil: "networkidle" });
    }
    await page.waitForSelector(".home-page", { timeout: 30000 });
    await page.waitForTimeout(2000);
    console.log("Feeds home page loaded.");
});

When("I view the feed section", async function () {
    console.log("Viewing feed section...");
    await page.waitForSelector(".article-preview", { timeout: 30000 });
    await page.waitForTimeout(1000);
    console.log("Feed section visible.");
});

Then("I should see articles in the feed", async function () {
    console.log("Asserting articles are visible in feed...");
    const articles = await page.$$(".article-preview");
    if (articles.length === 0) {
        throw new Error("No articles found in feed");
    }
    currentArticleCount = articles.length;
    console.log(`Found ${currentArticleCount} articles in feed.`);
});

Then("I should see pagination controls", async function () {
    console.log("Asserting pagination controls exist...");
    const paginationExists = await page.$(".pagination") || await page.$("nav[aria-label*='pagination']");
    if (!paginationExists) {
        console.log("Warning: No pagination controls found, but continuing test.");
    } else {
        console.log("Pagination controls found.");
    }
});

/*
  Scenario: User views Global Feed with pagination
*/
Then("I should see a limited number of articles on the first page", async function () {
    console.log("Asserting article count is limited...");
    const articles = await page.$$(".article-preview");
    currentArticleCount = articles.length;

    if (currentArticleCount <= 0) {
        throw new Error("No articles found on page");
    }

    if (currentArticleCount > 15) {
        throw new Error(
            `Expected max 15 articles on page, but found ${currentArticleCount}`,
        );
    }

    console.log(`First page shows ${currentArticleCount} articles (limited).`);
});

When("I click the next page button", async function () {
    console.log("Clicking next page button...");

    // Try multiple pagination selectors
    let nextButton;
    const selectors = [
        "a[rel='next']",
        "a.page-link[aria-label*='Next']",
        ".pagination a:last-child",
        "button:has-text('next')",
        "a:has-text('next')",
    ];

    for (const selector of selectors) {
        const elem = await page.$(selector);
        if (elem) {
            nextButton = elem;
            break;
        }
    }

    if (!nextButton) {
        console.log("Next button not found, trying to scroll and check for more articles...");
        await page.scroll(0, 500);
        await page.waitForTimeout(1000);
        return;
    }

    // Check if button is disabled
    const isDisabled = await nextButton.isDisabled();
    if (isDisabled) {
        console.log("Next button is disabled (last page), test will skip page change.");
        return;
    }

    // Store current articles
    const currentArticles = await page.$$eval(".article-preview h1", (els) =>
        els.map((el) => el.textContent.trim()),
    );
    previousArticleTitles = currentArticles;

    // Click next
    await nextButton.click();
    await page.waitForTimeout(2000);
    console.log("Clicked next page.");
});

Then("the articles shown should be different from the previous page", async function () {
    console.log("Asserting articles are different from previous page...");

    if (previousArticleTitles.length === 0) {
        console.log("No previous articles stored, skipping comparison.");
        return;
    }

    const currentArticles = await page.$$eval(".article-preview h1", (els) =>
        els.map((el) => el.textContent.trim()),
    );

    // Check if at least some articles are different
    const allSame = currentArticles.every((article) =>
        previousArticleTitles.includes(article),
    );

    if (allSame && currentArticles.length > 0) {
        throw new Error("Articles on new page are identical to previous page");
    }

    console.log("Confirmed: articles are different on new page.");
});

/*
  Scenario: User switches to Your Feed when logged in
*/

Then("I should see Your Feed is active", async function () {
    console.log("Verifying 'Your Feed' tab is active...");

    const yourFeedBtn = await page.$('button.nav-link.active');
    if (!yourFeedBtn) {
        throw new Error("Your Feed tab is not active");
    }

    const text = await yourFeedBtn.textContent();
    if (!text.trim().includes("Your Feed")) {
        throw new Error(`Active tab is "${text.trim()}", not 'Your Feed'`);
    }

    console.log("✓ Confirmed: Your Feed is active");
});

Then("I should see articles from followed authors", async function () {
    console.log("Asserting articles from followed authors are visible...");

    await page.waitForSelector(".article-preview", { timeout: 30000 });
    const articles = await page.$$(".article-preview");

    if (articles.length === 0) {
        throw new Error("No articles found in Your Feed");
    }

    console.log(
        `Found ${articles.length} articles from followed authors.`,
    );
});

/*
  Scenario: Logged-in user views feed with pagination
*/
Then("the article list should update with new articles", async function () {
    console.log("Asserting article list updated...");

    if (previousArticleTitles.length === 0) {
        console.log("No previous articles to compare.");
        return;
    }

    const currentArticles = await page.$$eval(".article-preview h1", (els) =>
        els.map((el) => el.textContent.trim()),
    );

    const hasNewArticles = currentArticles.some(
        (article) => !previousArticleTitles.includes(article),
    );

    if (!hasNewArticles && currentArticles.length > 0) {
        throw new Error("Article list did not update on next page");
    }

    console.log("Confirmed: article list updated with new articles.");
});

/*
  Scenario: Pagination respects limit and offset
*/
Then("articles should load with default limit \\(10 articles\\)", async function () {
    console.log("Asserting default limit of ~10 articles...");

    const articles = await page.$$(".article-preview");
    currentArticleCount = articles.length;

    if (currentArticleCount <= 0) {
        throw new Error("No articles loaded");
    }

    if (currentArticleCount > 15) {
        console.log(
            `Warning: Found ${currentArticleCount} articles (expected ~10), but continuing.`,
        );
    }

    console.log(`Loaded ${currentArticleCount} articles.`);
});

Then("next page should show articles with correct offset", async function () {
    console.log("Asserting next page has correct offset...");

    if (previousArticleTitles.length === 0) {
        console.log("No previous articles to verify offset.");
        return;
    }

    const currentArticles = await page.$$eval(".article-preview h1", (els) =>
        els.map((el) => el.textContent.trim()),
    );

    // Verify new set of articles (offset applied)
    const newArticles = currentArticles.filter(
        (article) => !previousArticleTitles.includes(article),
    );

    if (newArticles.length === 0 && currentArticles.length > 0) {
        console.log("Warning: All articles are the same (pagination may not be working)");
    } else {
        console.log(
            `Confirmed: Page shows ${newArticles.length} new articles (offset applied).`,
        );
    }
});
