import Browser, { Page } from './browser';

export { Browser, Page };

export * from './fixture';
export * from './findPort';
export * from './launcher';
export * from './build';

export function wait(timeout: number) {
  return new Promise((resolve) => setTimeout(resolve, timeout));
}

export function trim(s: TemplateStringsArray) {
  return s.join('\n').trim().replace(/^\s+/gm, '');
}
