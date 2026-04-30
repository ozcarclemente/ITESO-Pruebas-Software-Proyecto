const { Given, When, Then, Before, After } = require('@cucumber/cucumber');
const { chromium } = require('@playwright/test');

let browser;
let page;

Before(async function() {
  browser = await chromium.launch();
  page = await browser.newPage();
});

After(async function() {
  if (page) {
    await page.close();
  }
  if (browser) {
    await browser.close();
  }
});

Given('the application is running', async function() {
  // Application is already running via npm run dev
});

When('the user navigates to the home page', async function() {
  await page.goto('http://localhost:3000');
});

Then('the page title should contain {string}', async function(text) {
  const title = await page.title();
  if (!title.includes(text)) {
    throw new Error(`Expected title to contain "${text}", but got "${title}"`);
  }
});

Then('the navigation bar should be visible', async function() {
  const navbar = await page.locator('nav');
  const visible = await navbar.isVisible();
  if (!visible) {
    throw new Error('Navigation bar is not visible');
  }
});
