import { Runtime } from '@shuvi/types';

export function sendHTML(ctx: Runtime.IKoaContext, html: string) {
  if (ctx.res.writableEnded || ctx.res.headersSent) return;

  if (!ctx.response.type) {
    ctx.response.type = 'text/html; charset=utf-8';
  }
  ctx.response.length = Buffer.byteLength(html);
  ctx.body = ctx.request.method === 'HEAD' ? null : html;
}
