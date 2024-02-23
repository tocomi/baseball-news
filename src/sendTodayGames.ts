import { Browser, Page } from 'puppeteer';
import { postImage, postMessage } from './slack/message';
import { setup } from './puppeteer/setup';
import { SectionBlock } from '@slack/web-api';

/**
 * 当日の試合がある場合は true を返す
 */
const noTodayGames = async ({ page }: { page: Page }): Promise<boolean> => {
  // NOTE: 「XXはありません」の要素
  const element = await page.$('.bb-noData');
  if (!element) return false;

  // NOTE: 「記事はありません」のパターンもあるのでテキストまで確認
  const textContent = await (
    await element.getProperty('textContent')
  ).jsonValue();
  if (!textContent) return false;
  return textContent.includes('試合はありません');
};

async function sendTodayGames({
  page,
  browser,
}: {
  page: Page;
  browser: Browser;
}) {
  const scoreUrl = 'https://baseball.yahoo.co.jp/npb';
  await page.goto(scoreUrl);

  // 試合の有無のチェック
  if (await noTodayGames({ page })) {
    console.log('🚌 No Game today.');
    await postMessage({
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `🐨 *本日の試合はありません* 🐨`,
          },
        } as SectionBlock,
      ],
    });
    await browser.close();
    return;
  }

  // 試合結果の要素
  const scoreElement = await page.$('.bb-score');
  if (!scoreElement) {
    console.error('Score element is not found');
    await browser.close();
    return;
  }
  const scoreScreenshotBuffer = await scoreElement.screenshot();

  // 順位表の要素
  await page.goto('https://baseball.yahoo.co.jp/npb/standings');
  const standingsElements = await page.$$('.bb-modCommon01');
  if (standingsElements.length === 0) {
    console.error('Standings element is not found');
    await browser.close();
    return;
  }
  const preSeasonStandingsElement = standingsElements[3];
  const standingsScreenshotBuffer =
    await preSeasonStandingsElement.screenshot();

  const images = [
    { imageBuffer: scoreScreenshotBuffer, filename: 'games.png' },
    { imageBuffer: standingsScreenshotBuffer, filename: 'standings.png' },
  ];

  await postImage({
    images,
    link: {
      title: '⚾ 本日の試合はこちら',
      url: scoreUrl,
    },
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
