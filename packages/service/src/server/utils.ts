import { IncomingMessage, ServerResponse } from 'http';
import fs from 'fs';
import send from 'send';

export function isStaticFileExist(path: string): Boolean {
  if (fs.existsSync(path)) {
    return !fs.statSync(path).isDirectory() && fs.statSync(path).isFile();
  }
  return false;
}

export function serveStatic(
  req: IncomingMessage,
  res: ServerResponse,
  path: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    send(req, path)
      .on('file', () => {
        res.statusCode = 200;
      })
      .on('directory', () => {
        // We don't allow directories to be read.
        const err: any = new Error('No directory access');
        err.code = 'ENOENT';
        reject(err);
      })
      .on('error', reject)
      .pipe(res)
      .on('finish', resolve);
  });
}

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
