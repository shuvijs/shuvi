import { IncomingMessage, ServerResponse } from 'http';

export function sendHTML(
  req: IncomingMessage,
  res: ServerResponse,
  html: string
) {
  if (res.writableEnded || res.headersSent) return;

  if (!res.getHeader('Content-Type')) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
  }
  const buffer = Buffer.from(html);
  res.setHeader('Content-Length', buffer.length);

  // ctx.body will set ctx.status to 200, if ctx.status is not set before
  if (!res.statusCode) res.statusCode = 200;

  res.end(req.method === 'HEAD' ? null : buffer);
}
