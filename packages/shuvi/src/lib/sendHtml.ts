import { IncomingMessage, ServerResponse } from 'http';

export function sendHTML(
  req: IncomingMessage,
  res: ServerResponse,
  html: string
) {
  if (res.finished || res.headersSent) return;

  if (!res.getHeader('Content-Type')) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
  }
  res.setHeader('Content-Length', Buffer.byteLength(html));
  res.end(req.method === 'HEAD' ? null : html);
}
