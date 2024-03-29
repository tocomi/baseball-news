import { Browser, Page } from 'puppeteer';
import { postImage, postMessage } from './slack/message';
import { setup } from './puppeteer/setup';

const standingsUrl = 'https://baseball.yahoo.co.jp/npb/standings'

async function sendStandings({
  page,
  browser,
}: {
  page: Page;
  browser: Browser;
}) {
  // 順位表の要素
  await page.goto(standingsUrl);
  const standingsElements = await page.$$('.bb-modCommon01');
  if (standingsElements.length === 0) {
    console.error('Standings element is not found');
    await browser.close();
    return;
  }
  const centralLeagueStandingsElement = standingsElements[0];
  const centralLeagueScreenshotBuffer =
    await centralLeagueStandingsElement.screenshot();

  const pacificLeagueStandingsElement = standingsElements[1];
  const pacificLeagueScreenshotBuffer =
    await pacificLeagueStandingsElement.screenshot();

  // const preSeasonStandingsElement = standingsElements[3];
  // const standingsScreenshotBuffer =
  //   await preSeasonStandingsElement.screenshot();

  const images = [
    { imageBuffer: centralLeagueScreenshotBuffer, filename: 'central_league_standings.png' },
    { imageBuffer: pacificLeagueScreenshotBuffer, filename: 'pacific_league_standings.png' },
  ];

  await postImage({
    images,
    link: {
      title: '🏆 現在の順位',
      url: standingsUrl,
    },
  });
}

async function main() {
  console.log('⚾ Start');
  const { page, browser } = await setup();
  try {
    await sendStandings({ page, browser });
    console.log('⚾ Finished');
  } finally {
    await browser.close();
  }
}

main();
