import { Browser, Page } from "puppeteer";
import { postImage, postMessage } from "./slack/message";
import { setup } from "./puppeteer/setup";
import { SectionBlock } from "@slack/web-api";

/**
 * 当日の試合がある場合は true を返す
 */
const noTodayGames = async ({
  page,
}: {
  page: Page;
}): Promise<boolean> => {
  // NOTE: 「XXはありません」の要素
  const element = await page.$('.bb-noData');
  if (!element) return false

  // NOTE: 「記事はありません」のパターンもあるのでテキストまで確認
  const textContent = await (
    await element.getProperty('textContent')
  ).jsonValue();
  return textContent === '試合はありません'
}

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

  if (await noTodayGames({page})) {
    console.log('🚌 No Game today.');
    await postMessage({
      blocks: [{
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `🐨 *本日の試合はありません* 🐨`,
        },
      } as SectionBlock]
    })
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
