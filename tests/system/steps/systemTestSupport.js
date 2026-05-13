const axios = require("axios");

const APP_URL = process.env.SYSTEM_TEST_APP_URL || "http://localhost:3000";
const API_URL = process.env.SYSTEM_TEST_API_URL || "http://localhost:3001/api";

const DEFAULT_USER = {
    username: "exampleUser1",
    email: "example1@mail.com",
    password: "examplePwd1",
};

const SECOND_USER = {
    username: "exampleUser2",
    email: "example2@mail.com",
    password: "examplePwd2",
};

async function loginWithUi(page, user = DEFAULT_USER) {
    await page.goto(`${APP_URL}/#/login`);
    await page.waitForSelector('input[name="email"]', { timeout: 10000 });
    await page.fill('input[name="email"]', user.email);
    await page.fill('input[name="password"]', user.password);
    await page.click('button:has-text("Login")');

    await page.waitForFunction(() => {
        const stored = localStorage.getItem("loggedUser");
        if (!stored) return false;

        const parsed = JSON.parse(stored);
        return Boolean(parsed?.loggedUser?.token);
    });
    await page.waitForSelector(".navbar", { timeout: 10000 });
}

async function apiLogin(user = DEFAULT_USER) {
    const { data } = await axios({
        data: { user: { email: user.email, password: user.password } },
        method: "POST",
        url: `${API_URL}/users/login`,
    });

    return { Authorization: `Token ${data.user.token}` };
}

async function createArticleViaApi({
    user = DEFAULT_USER,
    title,
    description = "System test description",
    body = "System test body",
    tagList = ["system-test"],
}) {
    const headers = await apiLogin(user);
    const { data } = await axios({
        data: { article: { body, description, tagList, title } },
        headers,
        method: "POST",
        url: `${API_URL}/articles`,
    });

    return data.article;
}

async function favoriteArticleViaApi({ user = DEFAULT_USER, slug }) {
    const headers = await apiLogin(user);
    const { data } = await axios({
        headers,
        method: "POST",
        url: `${API_URL}/articles/${slug}/favorite`,
    });

    return data.article;
}

module.exports = {
    APP_URL,
    API_URL,
    DEFAULT_USER,
    SECOND_USER,
    loginWithUi,
    apiLogin,
    createArticleViaApi,
    favoriteArticleViaApi,
};
