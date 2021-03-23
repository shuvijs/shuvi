import { Runtime } from '@shuvi/types';

export function sendHTML(ctx: Runtime.IServerAppContext, html: string) {
  if (ctx.res.writableEnded || ctx.res.headersSent) return;

  if (!ctx.response.type) {
    ctx.response.type = 'text/html; charset=utf-8';
  }
  ctx.response.length = Buffer.byteLength(html);

  // ctx.body will set ctx.status to 200, if ctx.status is not set before
  ctx.status = ctx.res.statusCode;

  ctx.body = ctx.request.method === 'HEAD' ? null : html;
}
