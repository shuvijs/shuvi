import {
  AppCtx,
  Page,
  launchFixture,
  resolveFixture,
  check,
  getIframeTextContent
} from '../utils/index';
import { renameSync, existsSync } from 'fs';

jest.setTimeout(5 * 60 * 1000);

describe('webpack watching should wait for fileBuilder', () => {
  let ctx: AppCtx;
  let page: Page;
  const filePath = resolveFixture(
    'webpack-watch-wait-file-builder/src/sample.js'
  );
  const newFilePath = resolveFixture(
    'webpack-watch-wait-file-builder/src/new-sample.js'
  );
  describe('changing files should work with WebpackWatchWaitForFileBuilderPlugin', () => {
    test(`webpack watching should wait for fileBuilder's buildEnd and should not throw error when changing files`, async () => {
      try {
        ctx = await launchFixture('webpack-watch-wait-file-builder', {
          plugins: ['./plugin/fileBuilder']
        });
        page = await ctx.browser.page(ctx.url('/'));
        expect(await page.$text('#__APP')).toBe('Index Page sample');
        const logSpy = jest.spyOn(console, 'log');
        const errorSpy = jest.spyOn(console, 'error');
        renameSync(filePath, newFilePath);
        await check(
          () => page.$text('#__APP'),
          t => /Index Page not exist/.test(t)
        );
        expect(logSpy).toHaveBeenNthCalledWith(
          1,
          expect.stringContaining('plugin onBuildStart')
        );
        expect(logSpy).toHaveBeenNthCalledWith(
          2,
          expect.stringMatching(/\[shuvi\/.+\] Compiling/)
        );
        expect(logSpy).toHaveBeenNthCalledWith(
          3,
          expect.stringMatching(/\[shuvi\/.+\] Compiling/)
        );
        expect(logSpy).toHaveBeenNthCalledWith(
          4,
          expect.stringContaining('plugin onBuildEnd')
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

  describe('changing files should not work without WebpackWatchWaitForFileBuilderPlugin', () => {
    test(`webpack watching should not wait for fileBuilder's buildEnd and should throw error when changing files`, async () => {
      try {
        ctx = await launchFixture('webpack-watch-wait-file-builder', {
          plugins: ['./plugin/fileBuilder', './plugin/disableWebpackPlugin']
        });
        page = await ctx.browser.page(ctx.url('/'));
        expect(await page.$text('#__APP')).toBe('Index Page sample');
        const errorSpy = jest.spyOn(console, 'error');
        renameSync(filePath, newFilePath);
        await check(
          () => page.$text('#__APP'),
          t => /Index Page not exist/.test(t)
        );
        expect(errorSpy).toBeCalled();
        expect(errorSpy).toHaveBeenCalledWith(
          expect.stringContaining('[shuvi/server] Failed to compile')
        );
        expect(errorSpy).toHaveBeenCalledWith(
          expect.stringContaining('[shuvi/client] Failed to compile')
        );
        errorSpy.mockClear();
        renameSync(newFilePath, filePath);
        await check(
          () => getIframeTextContent(page),
          t => /Module not found/.test(t)
        );
        expect(errorSpy).toBeCalled();
        expect(errorSpy).toHaveBeenCalledWith(
          expect.stringContaining('[shuvi/server] Failed to compile')
        );
        expect(errorSpy).toHaveBeenCalledWith(
          expect.stringContaining('[shuvi/client] Failed to compile')
        );
      } finally {
        await page.close();
        await ctx.close();
        if (existsSync(newFilePath)) {
          renameSync(newFilePath, filePath);
        }
      }
    });
  });
});
