import path from 'path';
import fs from 'fs';
import { IServerMiddlewareConfig } from '@shuvi/types';
import resolve from '@shuvi/utils/lib/resolve';

export interface Options {
  rootDir: string;
  srcDir: string;
}

const EXTENSIONS = ['js', 'ts'];

function resolveAbsolute(resolveFrom: string, handler: string): string | undefined {
  const absPath = (path.isAbsolute(handler)
    ? handler
    : path.resolve(resolveFrom, handler)
  ).replace(/\\/g, '/');

  // Note: already has extension
  if (path.extname(absPath)) {
    if (fs.existsSync(absPath)) {
      return absPath;
    } else {
      throw new Error(`"${absPath}" handler do not exist.`);
    }
  }
  
  // Note: attempt to resolve with extension
  for (let i = 0; i < EXTENSIONS.length; i++) {
    if (fs.existsSync(`${absPath}.${EXTENSIONS[i]}`)) {
      return absPath;
    }
  }

  return undefined;
}

export function resolveHandler(handler: string, options: Options) {
  const absPath = resolveAbsolute(options.srcDir, handler);
  if (absPath) return absPath;
  try {
    // Note: check if it is a npm module
    resolve.sync(handler, { basedir: options.rootDir });
    return handler;
  } catch (error) {
    throw new Error(`"${handler}" handler do not exist.`)
  }
}

export function normalizeServerMiddleware(
  middleware: IServerMiddlewareConfig
): { path: string; handler: string; options?: any[] } {
  let path: string;
  let handler: string;
  let options: any[] | undefined;

  if (typeof middleware === 'object') {
    path = middleware.path;
    handler = middleware.handler;
    options = middleware.options;
  } else if (typeof middleware === 'string') {
    path = '*'; // Note: match all routes
    handler = middleware;
  } else {
    throw new Error(`Middleware must be one of type [string, object]`);
  }

  return { path, handler, options };
}
