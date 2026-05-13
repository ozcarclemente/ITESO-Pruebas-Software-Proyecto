const {
    Given,
    When,
    Then,
    Before,
    After,
    setDefaultTimeout,
} = require("@cucumber/cucumber");
const { chromium, expect } = require("@playwright/test");
const { APP_URL, DEFAULT_USER, loginWithUi } = require("./systemTestSupport");

setDefaultTimeout(60 * 1000);

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

Given("I am logged in for navigation tests", async function () {
    await loginWithUi(page, DEFAULT_USER);
});

When("I open the user dropdown menu", async function () {
    await page.click(".nav-item.dropdown .nav-link.dropdown-toggle");
    await expect(
        page.locator('.dropdown-menu[style*="display: block"]'),
    ).toBeVisible();
});

When("I click the logout dropdown item", async function () {
    await page.click('.dropdown-menu .dropdown-item:has-text("Logout")');
});

Then("I should see the guest navigation links", async function () {
    await expect(page.locator('.nav-link:has-text("Login")')).toBeVisible();
    await expect(page.locator('.nav-link:has-text("Sign up")')).toBeVisible();
});

Then("I should not see the authenticated navigation links", async function () {
    await expect(page.locator('.nav-link:has-text("New Article")')).toHaveCount(
        0,
    );
    await expect(page.locator(".nav-item.dropdown")).toHaveCount(0);
});

Then("my session should be removed from local storage", async function () {
    await expect
        .poll(() => page.evaluate(() => localStorage.getItem("loggedUser")))
        .toBe(null);
});

When("I navigate to an invalid article page", async function () {
    await page.goto(
        `${APP_URL}/#/article/this-article-does-not-exist-system-test`,
    );
});

When("I navigate to an invalid profile page", async function () {
    await page.goto(
        `${APP_URL}/#/profile/this-user-does-not-exist-system-test`,
    );
});

Given("I am on the not found page", async function () {
    await page.goto(`${APP_URL}/#/not-found`);
    await expect(page.locator(".not-found")).toBeVisible();
});

Then("I should see the not found page", async function () {
    await page.waitForURL(/#\/not-found$/);
    await expect(page.locator(".not-found h1")).toHaveText("404 Not Found");
});

Then("I should see the not found home link", async function () {
    await expect(
        page.locator('.not-found a:has-text("Go to home page")'),
    ).toBeVisible();
});

When("I click the not found home link", async function () {
    await page.click('.not-found a:has-text("Go to home page")');
});

Then(
    "I should be back on the home page from the not found page",
    async function () {
        await page.waitForURL(`${APP_URL}/#/`);
        await expect(page.locator(".home-page")).toBeVisible();
    },
);
