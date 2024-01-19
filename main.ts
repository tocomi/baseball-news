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

async function uploadImage({
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
  await slackClient.files.uploadV2({
    channel_id: channelId,
    file: imageBuffer,
    filename,
    title,
    initial_comment: url,
  });

  console.log('🖼️ File uploaded:', filename);
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

  await uploadImage({
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

  await uploadImage({
    imageBuffer: screenshotBuffer,
    filename: 'games.png',
    title: '今日の試合',
    url,
  });
}

async function main() {
  console.log('⚾ Start');
  const { page, browser } = await setup();
  try {
    await sendTopics({ page, browser });
    await sendTodayGames({ page, browser });
    console.log('⚾ Finished');
  } finally {
    await browser.close();
  }
}

main();
