// Cloudflare Worker — Notion API Proxy (Service Worker format)
// 環境變數 NOTION_TOKEN 在此格式下為全域變數，直接讀取即可

const NOTION_API = 'https://api.notion.com/v1';
const NOTION_VERSION = '2022-06-28';
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: CORS });
  }

  const url = new URL(request.url);

  // 測試端點：確認 token 是否有讀到
  if (url.pathname === '/ping') {
    return new Response(JSON.stringify({
      ok: true,
      tokenSet: typeof NOTION_TOKEN !== 'undefined' && NOTION_TOKEN !== '',
    }), { headers: { 'Content-Type': 'application/json', ...CORS } });
  }

  const notionUrl = NOTION_API + url.pathname;
  const body = request.method !== 'GET' ? await request.text() : undefined;

  const res = await fetch(notionUrl, {
    method: request.method,
    headers: {
      'Authorization': 'Bearer ' + NOTION_TOKEN,
      'Content-Type': 'application/json',
      'Notion-Version': NOTION_VERSION,
    },
    body,
  });

  const text = await res.text();
  return new Response(text, {
    status: res.status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });
}
