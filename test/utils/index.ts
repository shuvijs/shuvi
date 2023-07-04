import Browser, { Page } from './browser';

export { Browser, Page };
export * from './fixture';
export * from './findPort';
export * from './launcher';
export * from './shuvi';
export * from './shared';

export const checkShuviPortal = (page: Page) => {
  return page.evaluate(() => {
    const iframeDocument = document.querySelector('iframe')?.contentDocument;
    return Boolean(
      iframeDocument && iframeDocument.querySelector('shuvi-portal')
    );
  });
};
