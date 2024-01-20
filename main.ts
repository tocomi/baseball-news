import puppeteer, { Browser, Page } from 'puppeteer';
import { WebClient } from '@slack/web-api';
import 'dotenv/config';

const slackToken = process.env.SLACK_TOKEN || '';
const channelId = process.env.CHANNEL_ID || '';

async function setup(): Promise<{
  page: Page;
  browser: Browser;
}> {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  console.log('🚀 setup is DONE');
  return { page, browser };
}

async function postImage({
  imageBuffer,
  filename,
  title,
  url,
}: {
  imageBuffer: Buffer;
  filename: string;
  title: string;
  url: string;
}) {
  const slackClient = new WebClient(slackToken);
  const uploadResult = await slackClient.files.upload({
    file: imageBuffer,
    filename,
    title,
  });

  await slackClient.chat.postMessage({
    channel: channelId,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*<${url}|${title}>*`,
        },
      },
      {
        type: 'image',
        image_url: uploadResult.file?.permalink,
        alt_text: title,
      },
    ],
  });

  console.log('📸 Image posted:', filename);
}

async function sendTopics({ page, browser }: { page: Page; browser: Browser }) {
  const url = 'https://baseball.yahoo.co.jp/npb';
  await page.goto(url);

  const element = await page.$('#pkart');
  if (!element) {
    console.error('Element not found');
    await browser.close();
    return;
  }
  const screenshotBuffer = await element.screenshot();

  await postImage({
    imageBuffer: screenshotBuffer,
    filename: 'topics.png',
    title: '今日のトピックス',
    url,
  });
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
    // await sendTopics({ page, browser });
    await sendTodayGames({ page, browser });
    console.log('⚾ Finished');
  } finally {
    await browser.close();
  }
}

main();
