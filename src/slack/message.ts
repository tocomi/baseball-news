import { Block, FilesUploadResponse, WebClient } from '@slack/web-api';
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

  const uploadResults: FilesUploadResponse[] = [];
  for (const { imageBuffer, filename } of images) {
    const uploadResult = await slackClient.files.upload({
      file: imageBuffer,
      filename,
      title: filename,
    });
    uploadResults.push(uploadResult);
  }

  await slackClient.chat.postMessage({
    channel: channelId,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*<${link.url}|${link.title}>*`,
        },
      },
      ...uploadResults.map((uploadResult) => ({
        type: 'image',
        image_url: uploadResult.file?.permalink,
        alt_text: uploadResult.file?.title || 'uploaded image',
      })),
    ],
  });

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
