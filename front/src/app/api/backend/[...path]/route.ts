import { NextRequest } from 'next/server';

async function proxy(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const allowed = (request.method === 'POST' && path.join('/') === 'analyze') ||
    (request.method === 'GET' && path.join('/') === 'rules') ||
    (request.method === 'GET' && /^jobs\/[a-f0-9-]{36}(\/details)?$/.test(path.join('/')));
  if (!allowed) return Response.json({ detail: 'Маршрут не найден' }, { status: 404 });
  const key = process.env.BACKEND_API_KEY;
  if (!key) return Response.json({ detail: 'На сервере интерфейса не настроен BACKEND_API_KEY' }, { status: 503 });
  const base = (process.env.BACKEND_API_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');
  const headers = new Headers({ 'X-API-Key': key });
  if (request.headers.has('content-type')) headers.set('content-type', request.headers.get('content-type')!);
  try {
    const response = await fetch(`${base}/api/v1/${path.join('/')}`, {
      method: request.method,
      headers,
      body: request.method === 'POST' ? request.body : undefined,
      // Node fetch requires duplex for streaming video uploads.
      ...{ duplex: 'half' },
      cache: 'no-store',
      signal: AbortSignal.timeout(60_000),
    });
    return new Response(response.body, { status: response.status, headers: { 'Content-Type': response.headers.get('content-type') || 'application/json', 'Cache-Control': 'no-store' } });
  } catch {
    return Response.json({ detail: 'Бекенд недоступен. Проверьте запуск API и адрес BACKEND_API_URL.' }, { status: 502 });
  }
}

export const GET = proxy;
export const POST = proxy;
