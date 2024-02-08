import { Block, WebClient } from '@slack/web-api';
import 'dotenv/config';

const slackToken = process.env.SLACK_TOKEN || '';
const channelId = process.env.CHANNEL_ID || '';

export async function postImage({
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

export async function postMessage({ blocks }: { blocks: Block[] }) {
  const slackClient = new WebClient(slackToken);
  await slackClient.chat.postMessage({
    channel: channelId,
    blocks,
  });

  console.log('📰 News posted');
}