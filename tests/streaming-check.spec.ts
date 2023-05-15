import { test, expect } from '@playwright/test';

test.afterEach(async ({ page }, testInfo) => {
  await page.screenshot({
    path: `screenshots/${testInfo.title}_${process.env.TITLE}.png`, fullPage: true }
  );
});

test('Netflix', async ({ page }) => {
  await page.goto('https://netflix.com/');

  // log in
  await page.getByRole('button', { name: /sign in/i }).click();
  await page
    .getByRole("textbox", { name: /email or phone number/i })
    .fill(process.env.NETFLIX_EMAIL as string);
  await page
    .getByRole("textbox", { name: /password/i })
    .fill(process.env.NETFLIX_PASSWORD as string);
  await page.getByRole('button', { name: /sign in/i }).click();

  // who's watching
  await page.getByText(process.env.NETFLIX_PROFILE_NAME as string).click();

  // search title
  await page.getByLabel('Search').click();
  await page
    .getByPlaceholder(/titles, people, genres/i)
    .fill(process.env.TITLE as string);

  const matchingTitles = page.getByRole('link', { name: new RegExp(process.env.TITLE as string, "i") })
  const matchingTitlesCount = await matchingTitles.count();
  // loop through them one-by-one to check visibility
  for (let index = 0; index < matchingTitlesCount; index++) {
    const loopTitle = matchingTitles.nth(index);
    await expect(loopTitle).toBeVisible();
  }
});

const huluLogin = async (page: any) => {
  await page.goto('https://hulu.com/');

  await page.getByRole('link', { name: /log in/i }).click();
  await page
    .getByRole("textbox", { name: /email/i })
    .type(process.env.HULU_EMAIL as string, {delay: 100});
  await page
    .getByRole("textbox", { name: /password/i })
    .type(process.env.HULU_PASSWORD as string, {delay: 100});
  await page.getByRole('button', { name: /log in/i }).click({delay: 100});
};

const verifyXfinityEmail = async (page: any) => {
  await page.goto('https://login.xfinity.com/login');
    await page.getByLabel('Enter your Xfinity ID').fill(process.env.XFINITY_EMAIL as string);
    await page.getByRole('button', { name: 'Let\'s go' }).click();
    await page.getByLabel('Enter your password').fill(process.env.XFINITY_PASSWORD as string);
    await page.getByLabel('Enter your password').press('Enter');

    await page.getByRole('button', { name: 'Account' }).click();
    await page.getByRole('link', { name: 'Check Email' }).click();
    await page.getByRole('option', { name: /^Unread, Hulu, Login Verification/i }).first().getByText('Login Verification').click();
    const oneTimeCode = await page.locator('b:below(:text("Here is your one-time verification code."))').innerText()
    await huluLogin(page);
    await page.getByRole('textbox', { name: 'Enter digit 1 of the code you received, or paste the entire code.' }).fill(oneTimeCode!);
};

test('Hulu', async ({ page }) => {
  await huluLogin(page);

  if (page.getByText('Email Verification')) {
    verifyXfinityEmail(page);
  }

  // who's watching
  await page.getByText(process.env.HULU_PROFILE_NAME as string).click();

  // search title
  await page.getByLabel('Search').click();

  await page.getByPlaceholder(/search/i).type(process.env.TITLE as string, {delay: 100});

  const startWithTitle = `^${process.env.TITLE as string}`;
  const matchingTitles = page.getByAltText(new RegExp(startWithTitle, "i"))
  const matchingTitlesCount = await matchingTitles.count();
  // loop through them one-by-one to check visibility
  for (let index = 0; index < matchingTitlesCount; index++) {
    const loopTitle = matchingTitles.nth(index);
    await expect(loopTitle).toBeVisible();
  }
});