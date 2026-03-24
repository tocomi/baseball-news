import { Block, WebClient } from '@slack/web-api';
import 'dotenv/config';

const slackToken = process.env.SLACK_TOKEN || '';
const channelId = process.env.CHANNEL_ID || '';

export async function postImage({
  images,
  link,
}: {
  images: {
    imageBuffer: Buffer;
    filename: string;
  }[];
  link: {
    title: string;
    url: string;
  };
}) {
  const slackClient = new WebClient(slackToken);

  for (const { imageBuffer, filename } of images) {
    await slackClient.files.uploadV2({
      channel_id: channelId,
      file: imageBuffer,
      filename,
      title: filename,
      initial_comment: `*<${link.url}|${link.title}>*`,
    });
  }

  console.log(
    '📸 Image posted:',
    images.map((image) => image.filename).join(', ')
  );
}

export async function postMessage({ blocks }: { blocks: Block[] }) {
  const slackClient = new WebClient(slackToken);
  await slackClient.chat.postMessage({
    channel: channelId,
    blocks,
  });

  console.log('📰 News posted');
}
