import puppeteer, { Browser, Page } from 'puppeteer';

export async function setup(): Promise<{
  page: Page;
  browser: Browser;
}> {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  console.log('🚀 setup is DONE');
  return { page, browser };
}
