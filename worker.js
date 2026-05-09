// Cloudflare Worker — Notion API Proxy
// 部署步驟：
// 1. 登入 cloudflare.com → Workers & Pages → Create a Worker
// 2. 貼上此檔案全部內容
// 3. Settings → Variables → 新增環境變數 NOTION_TOKEN（貼上 Notion Integration Token）
// 4. 部署後取得 Worker URL，貼入網頁的「Notion 聯動設定」

const NOTION_API = 'https://api.notion.com/v1';
const NOTION_VER = '2022-06-28';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    const url = new URL(request.url);
    const notionUrl = NOTION_API + url.pathname;
    const body = request.method !== 'GET' ? await request.text() : undefined;

    const res = await fetch(notionUrl, {
      method: request.method,
      headers: {
        'Authorization': 'Bearer ' + env.NOTION_TOKEN,
        'Content-Type': 'application/json',
        'Notion-Version': NOTION_VER,
      },
      body,
    });

    const text = await res.text();
    return new Response(text, {
      status: res.status,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });
  },
};
