import puppeteer, { Browser, Page } from 'puppeteer';

export async function setup(): Promise<{
  page: Page;
  browser: Browser;
}> {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  console.log('🚀 setup is DONE');
  return { page, browser };
}
