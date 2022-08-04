import {
  AppCtx,
  Page,
  launchFixture,
  resolveFixture,
  check
} from '../utils/index';
import { renameSync, existsSync } from 'fs';

jest.setTimeout(5 * 60 * 1000);

describe('webpack watch wait file builder', () => {
  let ctx: AppCtx;
  let page: Page;
  const filePath = resolveFixture(
    'webpack-watch-wait-file-builder/src/sample.js'
  );
  const newFilePath = resolveFixture(
    'webpack-watch-wait-file-builder/src/new-sample.js'
  );

  test(`webpack should wait for fileBuilder's buildEnd and should not throw error when changing files`, async () => {
    try {
      ctx = await launchFixture('webpack-watch-wait-file-builder', {
        plugins: ['./plugin/fileBuilder']
      });
      page = await ctx.browser.page(ctx.url('/'));
      expect(await page.$text('#__APP')).toBe('Index Page sample');
      const errorSpy = jest.spyOn(console, 'error');
      renameSync(filePath, newFilePath);
      await check(
        () => page.$text('#__APP'),
        t => /Index Page not exist/.test(t)
      );
      expect(errorSpy).not.toHaveBeenCalled();
      renameSync(newFilePath, filePath);
      await check(
        () => page.$text('#__APP'),
        t => /Index Page sample/.test(t)
      );
      expect(console.error).toBeCalledTimes(0);
    } finally {
      await page.close();
      await ctx.close();
      if (existsSync(newFilePath)) {
        renameSync(newFilePath, filePath);
      }
    }
  });
});
