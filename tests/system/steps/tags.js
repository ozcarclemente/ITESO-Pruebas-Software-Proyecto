const { Given, When, Then, Before, After } = require("@cucumber/cucumber");
const { chromium, expect } = require("@playwright/test");

let browser;
let page;

Before(async function () {
    browser = await chromium.launch({ headless: true });
    page = await browser.newPage();
});

After(async function () {
    if (page) await page.close();
    if (browser) await browser.close();
});

Given("I navigate to the home page", async function () {
    await page.goto("http://localhost:3000/");
    await page.waitForSelector("nav", { timeout: 30000 });
});

Then("I should see the {string} sidebar", async function (title) {
    const sidebar = await page.locator(".sidebar");
    await expect(sidebar).toBeVisible();
    const heading = await sidebar.locator("h6");
    await expect(heading).toHaveText(title);
});

Then("I should see at least one tag in the sidebar", async function () {
    const tags = await page.locator(".tag-list button");
    const count = await tags.count();
    if (count === 0) {
        // Wait a bit more in case they are loading
        await page.waitForTimeout(2000);
        const countRetry = await tags.count();
        if (countRetry === 0) throw new Error("No tags found in sidebar");
    }
});

When("I click on a tag from the sidebar", async function () {
    const firstTag = await page.locator(".tag-list button").first();
    this.tagName = await firstTag.innerText();
    await firstTag.click();
});

Then("the feed should filter articles by that tag", async function () {
    await page.waitForTimeout(1000);
    const activeTab = await page.locator("button.nav-link.active");
    await expect(activeTab).toContainText(this.tagName);
});

Then("I should see the tag tab as active", async function () {
    const activeTab = await page.locator("button.nav-link.active");
    await expect(activeTab).toBeVisible();
});
