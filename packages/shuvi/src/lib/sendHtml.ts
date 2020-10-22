import { Runtime } from '@shuvi/types';

export function sendHTML(ctx: Runtime.IKoaContext, html: string) {
  if (ctx.res.writableEnded || ctx.res.headersSent) return;

  if (!ctx.response.headers['Content-Type']) {
    ctx.response.set('Content-Type', 'text/html; charset=utf-8');
  }
  ctx.response.set('Content-Length', Buffer.byteLength(html).toString());
  ctx.body = ctx.request.method === 'HEAD' ? null : html;
}
