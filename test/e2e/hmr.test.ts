import { AppCtx, Page, launchFixture, resolveFixture, check } from '../utils';
import { readFileSync, writeFileSync, renameSync, existsSync } from 'fs';
import path from 'path';

function resolvePagePath(page: string) {
  return resolveFixture('basic/src/pages/hmr', page);
}

jest.setTimeout(5 * 60 * 1000);

afterEach(() => {
  // force require to load file to make sure compiled file get load correctlly
  jest.resetModules();
});

describe('Hot Module Reloading', () => {
  let ctx: AppCtx;
  let page: Page;

  beforeAll(async () => {
    ctx = await launchFixture('basic', { ssr: true });
  });
  afterAll(async () => {
    await page.close();
    await ctx.close();
  });

  // broken in webpack 4. should work in webpack 5
  // test('should work when delete a page and add it back', async () => {
  //   const pagePath = resolvePagePath('one.js');
  //   const newPagePath = resolvePagePath('new-one.js');

  //   try {
  //     page = await ctx.browser.page(ctx.url('/hmr/one'));

  //     expect(await page.$text('[data-test-id="hmr-one"]')).toBe(
  //       'This is the one page'
  //     );

  //     // Rename the file to mimic a deleted page
  //     renameSync(pagePath, newPagePath);

  //     await check(
  //       () => page.$text('#__APP'),
  //       t => /This page could not be found/.test(t)
  //     );

  //     // Rename the file back to the original filename
  //     renameSync(newPagePath, pagePath);

  //     // wait until the page comes back
  //     await check(
  //       () => page.$text('[data-test-id="hmr-one"]'),
  //       t => /This is the one page/.test(t)
  //     );
  //   } finally {
  //     if (existsSync(newPagePath)) {
  //       renameSync(newPagePath, pagePath);
  //     }
  //   }
  // });

  describe('editing a page', () => {
    test('should detect the changes and display it', async () => {
      const pagePath = resolvePagePath('two.js');
      let originalContent: string | undefined;
      let done = false;

      try {
        page = await ctx.browser.page(ctx.url('/hmr/two'));
        expect(await page.$text('[data-test-id="hmr-two"]')).toBe(
          'This is the two page'
        );

        originalContent = readFileSync(pagePath, 'utf8');
        const editedContent = originalContent.replace(
          'This is the two page',
          'COOL page'
        );

        // change the content
        writeFileSync(pagePath, editedContent, 'utf8');

        await check(
          () => page.$text('[data-test-id="hmr-two"]'),
          t => /COOL page/.test(t)
        );

        // add the original content
        writeFileSync(pagePath, originalContent, 'utf8');

        await check(
          () => page.$text('[data-test-id="hmr-two"]'),
          t => /This is the two page/.test(t)
        );

        done = true;
      } finally {
        if (!done && originalContent) {
          writeFileSync(pagePath, originalContent, 'utf8');
        }
      }
    });
  });
});
