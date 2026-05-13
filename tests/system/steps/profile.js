const {
    Given,
    When,
    Then,
    Before,
    After,
    setDefaultTimeout,
} = require("@cucumber/cucumber");
const { chromium, expect } = require("@playwright/test");
const {
    APP_URL,
    DEFAULT_USER,
    SECOND_USER,
    loginWithUi,
    createArticleViaApi,
    favoriteArticleViaApi,
} = require("./systemTestSupport");

setDefaultTimeout(60 * 1000);

let browser;
let page;
let dialogMessage;
let preparedArticleTitle;
let preparedFavoriteTitle;

function profileActionButton() {
    return page.locator(".user-info button.action-btn");
}

async function visitProfile(username) {
    await page.goto(`${APP_URL}/#/profile/${username}`);
    await page.waitForSelector(".profile-page", { timeout: 30000 });
    await expect(page.locator(".user-info h4")).toHaveText(username);
}

function profileArticleTitles() {
    return page.locator(".article-preview h1");
}

async function openProfileTab(tabText) {
    await page.click(`.articles-toggle .nav-link:has-text("${tabText}")`);
}

async function waitForFollowState(expectedText) {
    await expect(profileActionButton()).toContainText(expectedText);
}

function getFollowState(text) {
    if (text.includes("Unfollow")) return "Unfollow";
    if (text.includes("Follow")) return "Follow";
    if (text.includes("Followers")) return "Followers";
    return text;
}

async function ensureFollowState(expectedText) {
    const button = profileActionButton();
    await expect(button).toBeVisible();
    const text = await button.textContent();
    const currentState = getFollowState(text);

    if (currentState === expectedText) return;

    if (expectedText === "Follow" && currentState === "Unfollow") {
        await button.click();
        await waitForFollowState("Follow");
        return;
    }

    if (expectedText === "Unfollow" && currentState === "Follow") {
        await button.click();
        await waitForFollowState("Unfollow");
        return;
    }

    throw new Error(`Unexpected follow button state: ${text}`);
}

Before(async function () {
    browser = await chromium.launch({ headless: true });
    page = await browser.newPage();
    dialogMessage = null;
    preparedArticleTitle = null;
    preparedFavoriteTitle = null;
});

After(async function () {
    if (page) await page.close();
    if (browser) await browser.close();
});

Given("I am logged in with profile test user credentials", async function () {
    await loginWithUi(page, DEFAULT_USER);
});

When("I navigate to the profile page of {string}", async function (username) {
    await visitProfile(username);
});

When("I navigate to my profile page", async function () {
    await visitProfile(DEFAULT_USER.username);
});

Given(
    "I have created a profile article titled {string}",
    async function (title) {
        const uniqueTitle = `${title} ${Date.now()}`;
        const article = await createArticleViaApi({
            title: uniqueTitle,
            user: DEFAULT_USER,
        });

        preparedArticleTitle = article.title;
    },
);

Given("I have favorited an article titled {string}", async function (title) {
    const uniqueTitle = `${title} ${Date.now()}`;
    const article = await createArticleViaApi({
        title: uniqueTitle,
        user: SECOND_USER,
    });

    await favoriteArticleViaApi({ slug: article.slug, user: DEFAULT_USER });
    preparedFavoriteTitle = article.title;
});

Then("I should see the profile username {string}", async function (username) {
    await expect(page.locator(".user-info h4")).toHaveText(username);
});

Then("I should see a profile follow button", async function () {
    const button = profileActionButton();
    await expect(button).toBeVisible();
    const text = await button.textContent();
    const state = getFollowState(text);

    if (!["Follow", "Unfollow"].includes(state)) {
        throw new Error(`Expected follow button state, but got: ${text}`);
    }
});

Then("I should see the edit profile settings button", async function () {
    const editButton = page.locator('a:has-text("Edit Profile Settings")');
    await expect(editButton).toBeVisible();
});

Then("I should not see a profile follow button", async function () {
    await expect(profileActionButton()).toHaveCount(0);
});

When("I follow that user from the profile page", async function () {
    await ensureFollowState("Follow");
    await profileActionButton().click();
});

When("I unfollow that user from the profile page", async function () {
    await ensureFollowState("Unfollow");
    await profileActionButton().click();
});

Then("I should see the unfollow button for that profile", async function () {
    await waitForFollowState("Unfollow");
});

Then("I should see the follow button for that profile", async function () {
    await waitForFollowState("Follow");
});

When("I try to follow that user as a guest", async function () {
    page.once("dialog", async (dialog) => {
        dialogMessage = dialog.message();
        await dialog.dismiss();
    });

    await expect(profileActionButton()).toBeVisible();
    await profileActionButton().click();
});

When("I switch to the {string} profile tab", async function (tabText) {
    await openProfileTab(tabText);
});

Then(
    "the guest follow attempt should show an alert {string}",
    async function (message) {
        await expect.poll(() => dialogMessage).toBe(message);
    },
);

Then(
    "I should see my created article in the profile articles list",
    async function () {
        await expect(
            profileArticleTitles().filter({ hasText: preparedArticleTitle }),
        ).toHaveCount(1);
    },
);

Then(
    "I should see my favorited article in the profile articles list",
    async function () {
        await expect(
            profileArticleTitles().filter({ hasText: preparedFavoriteTitle }),
        ).toHaveCount(1);
    },
);

Then("the {string} profile tab should be active", async function (tabText) {
    await expect(
        page.locator(
            `.articles-toggle .nav-link.active:has-text("${tabText}")`,
        ),
    ).toBeVisible();
});
