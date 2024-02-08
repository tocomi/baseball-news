import { Browser, Page } from "puppeteer";
import { postImage } from "./slack/message";
import { setup } from "./puppeteer/setup";

async function sendTodayGames({
  page,
  browser,
}: {
  page: Page;
  browser: Browser;
}) {
  const url = 'https://baseball.yahoo.co.jp/npb';
  await page.goto(url);

  const element = await page.$('.bb-score');
  if (!element) {
    console.error('Element not found');
    await browser.close();
    return;
  }
  const screenshotBuffer = await element.screenshot();

  await postImage({
    imageBuffer: screenshotBuffer,
    filename: 'games.png',
    title: '⚾ 本日の試合はこちら',
    url,
  });
}

async function main() {
  console.log('⚾ Start');
  const { page, browser } = await setup();
  try {
    await sendTodayGames({ page, browser });
    console.log('⚾ Finished');
  } finally {
    await browser.close();
  }
}

main();
