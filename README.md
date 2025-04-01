# Baseball News

プロ野球のニュースを Slack に通知するスクリプトです。

# Setup

## 1. 通知用の Slack Bot を作成

TBD

## 2. 環境変数を設定

`.env.sample` をコピーして `.env` ファイルを作成します。

```
cp .env.sample .env
```

`.env` ファイルに通知対象のチャンネル ID と Bot の token を指定してください。

## 3. 実行

```
pnpm i
npx puppeteer browsers install chrome
pnpm sendXXX
```
