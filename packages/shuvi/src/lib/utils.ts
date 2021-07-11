import asyncWarpHandler from 'express-async-handler';
import { Runtime } from '@shuvi/types';

export function acceptsHtml(
  header: string,
  {
    htmlAcceptHeaders = ['text/html', '*/*']
  }: { htmlAcceptHeaders?: string[] } = {}
) {
  for (var i = 0; i < htmlAcceptHeaders.length; i++) {
    if (header.indexOf(htmlAcceptHeaders[i]) !== -1) {
      return true;
    }
  }
  return false;
}

export function dedupe<T extends Record<string, any>, K extends keyof T>(
  bundles: T[],
  prop: K
): T[] {
  const files = new Set();
  const kept = [];

  for (const bundle of bundles) {
    if (files.has(bundle[prop])) continue;
    files.add(bundle[prop]);
    kept.push(bundle);
  }
  return kept;
}

export function asyncMiddlewareWarp(fn: Runtime.IServerMiddlewareHandler) {
  return (asyncWarpHandler(
    (fn as unknown) as any
  ) as unknown) as Runtime.IServerMiddlewareHandler;
}
