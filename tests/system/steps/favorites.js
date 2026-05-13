const { Given, When, Then, Before, After } = require("@cucumber/cucumber");
const { chromium, expect } = require("@playwright/test");

let browser;
let page;

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

Given(
    "I am logged in with exampleUser1 credentials for favorites",
    async function () {
        await page.goto("http://localhost:3000/#/login");
        await page.waitForTimeout(1000);
        await page.fill('input[name="email"]', TEST_USER.email);
        await page.fill('input[name="password"]', TEST_USER.password);
        await page.click('button:has-text("Login")');
        await page.waitForURL("http://localhost:3000/#/", { timeout: 10000 });
        await page.waitForTimeout(500);
    },
);

Given("I am not logged in", async function () {
    await page.goto("http://localhost:3000/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();
});

Given("I navigate to the home page for favorites", async function () {
    await page.goto("http://localhost:3000/");
    await page.waitForSelector(".article-preview");
    // Verify we're on Global Feed
    await page.waitForSelector("button.nav-link.active");
    const activeTab = await page
        .locator("button.nav-link.active")
        .textContent();
    if (!activeTab.includes("Global Feed")) {
        await page.click('button:has-text("Global Feed")');
        await page.waitForTimeout(500);
    }
});

When("I click the favorite button on an article", async function () {
    // Get first article preview, find button with ion-heart icon
    const favButton = page
        .locator(".article-preview")
        .first()
        .locator("button")
        .filter({ has: page.locator("i.ion-heart") });

    const countBefore = await favButton.locator(".counter").innerText();
    this.countBefore = parseInt(countBefore.replace(/[() ]/g, ""));
    await favButton.click();
    await page.waitForTimeout(2000);
});

When(
    "I click the favorite button on the same article again",
    async function () {
        const favButton = page
            .locator(".article-preview")
            .first()
            .locator("button")
            .filter({ has: page.locator("i.ion-heart") });
        await favButton.click();
        await page.waitForTimeout(2000);
    },
);

Then("the favorite button should be active", async function () {
    const favButton = page
        .locator(".article-preview")
        .first()
        .locator("button")
        .filter({ has: page.locator("i.ion-heart") });
    await expect(favButton).toHaveClass(/active/);
});

Then("the favorite button should be inactive", async function () {
    const favButton = page
        .locator(".article-preview")
        .first()
        .locator("button")
        .filter({ has: page.locator("i.ion-heart") });
    const hasActive = await favButton.evaluate((el) =>
        el.classList.contains("active"),
    );
    expect(hasActive).toBe(false);
});

Then("the favorites count should increase", async function () {
    const favButton = page
        .locator(".article-preview")
        .first()
        .locator("button")
        .filter({ has: page.locator("i.ion-heart") });
    const countAfter = await favButton.locator(".counter").innerText();
    const count = parseInt(countAfter.replace(/[() ]/g, ""));
    expect(count).toBeGreaterThan(this.countBefore);
});

Then("the favorites count should decrease", async function () {
    const favButton = page
        .locator(".article-preview")
        .first()
        .locator("button")
        .filter({ has: page.locator("i.ion-heart") });
    const countAfter = await favButton.locator(".counter").innerText();
    const count = parseInt(countAfter.replace(/[() ]/g, ""));
    expect(count).toBe(this.countBefore - 1);
});

Then("I should see an alert {string}", async function (message) {
    page.on("dialog", async (dialog) => {
        expect(dialog.message()).toBe(message);
        await dialog.dismiss();
    });
});
