import { Runtime } from '@shuvi/types';
import send from 'send';

export function serveStatic(
  ctx: Runtime.IServerContext,
  path: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    send(ctx.req, path)
      .on('file', () => {
        ctx.status = 200;
      })
      .on('directory', () => {
        // We don't allow directories to be read.
        const err: any = new Error('No directory access');
        err.code = 'ENOENT';
        reject(err);
      })
      .on('error', reject)
      .pipe(ctx.res)
      .on('finish', resolve);
  });
}
