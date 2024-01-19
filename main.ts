import puppeteer from 'puppeteer';
import { WebClient } from '@slack/web-api';

const url = 'https://baseball.yahoo.co.jp/npb/';
const slackToken = 'xoxb-196318977316-6503638352436-wGSNre0PoYx9eDRMOiD0JAki';
const channelId = 'C5SAQTQMT';

async function screenshotAndPost() {
  // Puppeteerを使用してブラウザを起動し、ページにアクセス
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.goto(url);

  // 指定された要素のスクリーンショットを取得
  const element = await page.$('.bb-score');
  if (!element) {
    console.error('Element not found');
    await browser.close();
    return;
  }
  const screenshotBuffer = await element.screenshot();

  // Slackに画像を投稿
  const slackClient = new WebClient(slackToken);
  const result = await slackClient.files.upload({
    channels: channelId,
    file: screenshotBuffer,
    filename: 'screenshot.png',
    title: '今日のプロ野球',
    initial_comment: 'https://baseball.yahoo.co.jp/npb',
  });

  console.log('File uploaded:', result.file?.id);

  await browser.close();
}

screenshotAndPost().catch(console.error);
