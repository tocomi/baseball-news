import { Browser, ElementHandle, Page } from "puppeteer";
import { postMessage } from './slack/message'
import { setup } from "./puppeteer/setup";

async function sendTopics({ page, browser }: { page: Page; browser: Browser }) {
  const url = 'https://sports.yahoo.co.jp/list/news/npb?genre=npb';
  await page.goto(url);

  const elements = await page.$$('.cm-timeLine__itemArticleLink');
  if (!elements.length) {
    console.error('Element not found');
    await browser.close();
    return;
  }

  const getArticleInfo = async (
    element: ElementHandle<Element>
  ): Promise<{
    title: string;
    url: string;
  } | null> => {
    const titleElement = await element.$('.cm-timeLine__itemTitle');
    if (!titleElement) return null;
    const title = await (
      await titleElement.getProperty('textContent')
    ).jsonValue();
    if (!title) return null;

    const url = await (await element.getProperty('href')).jsonValue();
    if (!url || typeof url !== 'string') return null;

    return { title, url };
  };

  const promises = elements.map(getArticleInfo);
  const articles = await Promise.all(
    promises.map(async (promise) => {
      const articleInfo = await promise;
      if (!articleInfo) return;
      return articleInfo;
    })
  );
  const filteredArticles = articles
    .filter((article) => Boolean(article))
    .slice(0, 10);

  const blocks = filteredArticles.map((article) => ({
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `*<${article?.url}|${article?.title}>*`,
    },
  }));
  await postMessage({ blocks });
}

async function main() {
  console.log('⚾ Start');
  const { page, browser } = await setup();
  try {
    await sendTopics({ page, browser });
    // await sendTodayGames({ page, browser });
    console.log('⚾ Finished');
  } finally {
    await browser.close();
  }
}

main();
