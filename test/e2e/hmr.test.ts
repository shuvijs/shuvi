import {
  AppCtx,
  Page,
  launchFixture,
  resolveFixture,
  check,
  getIframeTextContent
} from '../utils';
import { readFileSync, writeFileSync, renameSync, existsSync } from 'fs';

function resolvePagePath(page: string) {
  return resolveFixture('basic/src/routes/hmr/' + page, 'page.js');
}

function resolveRoutePath(routeName: string) {
  return resolveFixture('basic/src/routes/hmr/' + routeName);
}

jest.setTimeout(5 * 60 * 1000);

describe('Hot Module Reloading', () => {
  let ctx: AppCtx;
  let page: Page;

  beforeAll(async () => {
    ctx = await launchFixture('basic', { ssr: true });
  });
  afterAll(async () => {
    await ctx.close();
  });

  test('should work when delete a page and add it back', async () => {
    const routePath = resolveRoutePath('one');
    const newRoutePath = resolveRoutePath('new-one');

    try {
      page = await ctx.browser.page(ctx.url('/hmr/one'));

      expect(await page.$text('[data-test-id="hmr-one"]')).toBe(
        'This is the one page'
      );

      // Rename the file to mimic a deleted page
      renameSync(routePath, newRoutePath);

      await check(
        () => page.$text('#__APP'),
        t => /This page could not be found/.test(t)
      );

      // Rename the file back to the original filename
      renameSync(newRoutePath, routePath);

      // wait until the page comes back
      await check(
        () => page.$text('[data-test-id="hmr-one"]'),
        t => /This is the one page/.test(t)
      );
    } finally {
      await page.close();

      if (existsSync(newRoutePath)) {
        renameSync(newRoutePath, routePath);
      }
    }
  });

  describe('editing a page', () => {
    test('should detect the changes and display it', async () => {
      const pagePath = resolvePagePath('two');

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
        await page.close();

        if (!done && originalContent) {
          writeFileSync(pagePath, originalContent, 'utf8');
        }
      }
    });

    test('should show compile error message', async () => {
      const pagePath = resolvePagePath('two');
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
          '</div>'
        );

        // change the content
        writeFileSync(pagePath, editedContent, 'utf8');

        // error box content
        await check(
          () => getIframeTextContent(page),
          t => /Error:/.test(t)
        );

        // add the original content
        writeFileSync(pagePath, originalContent, 'utf8');

        await check(
          () => page.$text('[data-test-id="hmr-two"]'),
          t => /This is the two page/.test(t)
        );

        done = true;
      } finally {
        await page.close();

        if (!done && originalContent) {
          writeFileSync(pagePath, originalContent, 'utf8');
        }
      }
    });
  });
});
