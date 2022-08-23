import {
  AppCtx,
  Page,
  launchFixture,
  resolveFixture,
  check,
  checkShuviPortal,
  wait
} from '../utils/index';
import { renameSync, existsSync } from 'fs';

jest.setTimeout(30 * 60 * 1000);

describe('webpack watch wait file builder', () => {
  let ctx: AppCtx;
  let page: Page;
  const sampleFilePath = resolveFixture(
    'webpack-watch-wait-file-builder/src/sample.js'
  );
  const newSampleFilePath = resolveFixture(
    'webpack-watch-wait-file-builder/src/new-sample.js'
  );
  const routesDirPath = resolveFixture(
    'webpack-watch-wait-file-builder/src/routes'
  );
  const newRoutesDirPath = resolveFixture(
    'webpack-watch-wait-file-builder/src/new-routes'
  );

  const oneDirPath = resolveFixture(
    'webpack-watch-wait-file-builder/src/routes/one'
  );

  const newOneDirPath = resolveFixture(
    'webpack-watch-wait-file-builder/src/routes/new-one'
  );

  const onePageFilePath = resolveFixture(
    'webpack-watch-wait-file-builder/src/routes/one/page.js'
  );

  const newOnePageFilePath = resolveFixture(
    'webpack-watch-wait-file-builder/src/routes/one/new-page.js'
  );
  describe('changing files should work with WebpackWatchWaitForFileBuilderPlugin', () => {
    test(`webpack watching should wait for fileBuilder's buildEnd and should not throw error when changing files`, async () => {
      try {
        ctx = await launchFixture('webpack-watch-wait-file-builder', {
          plugins: ['./plugin/fileBuilder']
        });
        page = await ctx.browser.page(ctx.url('/one'));
        expect(await page.$text('#__APP')).toBe('Index Page sample1');
        const errorSpy = jest.spyOn(console, 'error');
        const loopFn = async (time: number) => {
          console.log('------------ current time ------------', time);
          // change sample file path and change back
          renameSync(sampleFilePath, newSampleFilePath);
          await check(
            () => page.$text('#__APP'),
            t => /Index Page not exist/.test(t)
          );
          expect(errorSpy).not.toHaveBeenCalled();
          renameSync(newSampleFilePath, sampleFilePath);
          await check(
            () => page.$text('#__APP'),
            t => /Index Page sample1/.test(t)
          );
          expect(errorSpy).not.toHaveBeenCalled();

          // change one page file path and change back
          renameSync(onePageFilePath, newOnePageFilePath);
          await check(
            () => page.$text('#__APP'),
            t => /This page could not be found/.test(t)
          );
          expect(errorSpy).not.toHaveBeenCalled();
          renameSync(newOnePageFilePath, onePageFilePath);
          await check(
            () => page.$text('#__APP'),
            t => /Index Page sample1/.test(t)
          );
          expect(errorSpy).not.toHaveBeenCalled();

          // change one dir path and change back
          renameSync(oneDirPath, newOneDirPath);
          await check(
            () => page.$text('#__APP'),
            t => /This page could not be found/.test(t)
          );
          expect(errorSpy).not.toHaveBeenCalled();
          renameSync(newOneDirPath, oneDirPath);
          await check(
            () => page.$text('#__APP'),
            t => /Index Page sample1/.test(t)
          );
          expect(errorSpy).not.toHaveBeenCalled();

          // change routes dir path and change back
          renameSync(routesDirPath, newRoutesDirPath);
          await check(
            () => page.$text('#__APP'),
            t => /This page could not be found/.test(t)
          );
          expect(errorSpy).not.toHaveBeenCalled();
          renameSync(newRoutesDirPath, routesDirPath);
          await check(
            () => page.$text('#__APP'),
            t => /Index Page sample1/.test(t)
          );
          expect(errorSpy).not.toHaveBeenCalled();
        };

        const times = 2;

        for (let i = 0; i < times; i++) {
          await loopFn(i + 1);
        }
        expect(console.error).toBeCalledTimes(0);
      } finally {
        await page.close();
        await ctx.close();
        if (existsSync(newSampleFilePath)) {
          renameSync(newSampleFilePath, sampleFilePath);
        }
      }
    });

    test('webpack watching should not throw error when changing files frequently', async () => {
      try {
        ctx = await launchFixture('webpack-watch-wait-file-builder', {
          plugins: ['./plugin/fileBuilder']
        });
        page = await ctx.browser.page(ctx.url('/one'));
        expect(await page.$text('#__APP')).toBe('Index Page sample1');
        const errorSpy = jest.spyOn(console, 'error');
        const loopFn = async (time: number) => {
          console.log('------------ current time ------------', time);
          // change sample file path and change back
          renameSync(sampleFilePath, newSampleFilePath);

          expect(errorSpy).not.toHaveBeenCalled();
          renameSync(newSampleFilePath, sampleFilePath);
          await wait(200);
          expect(errorSpy).not.toHaveBeenCalled();

          // change one page file path and change back
          renameSync(onePageFilePath, newOnePageFilePath);
          await wait(200);
          expect(errorSpy).not.toHaveBeenCalled();
          renameSync(newOnePageFilePath, onePageFilePath);
          await wait(200);
          expect(errorSpy).not.toHaveBeenCalled();

          // change one dir path and change back
          renameSync(oneDirPath, newOneDirPath);
          await wait(200);
          expect(errorSpy).not.toHaveBeenCalled();
          renameSync(newOneDirPath, oneDirPath);
          await wait(200);
          expect(errorSpy).not.toHaveBeenCalled();

          // change routes dir path and change back
          renameSync(routesDirPath, newRoutesDirPath);
          await wait(200);
          expect(errorSpy).not.toHaveBeenCalled();
          renameSync(newRoutesDirPath, routesDirPath);
          await wait(200);
          expect(errorSpy).not.toHaveBeenCalled();
        };

        const times = 2;

        for (let i = 0; i < times; i++) {
          await loopFn(i + 1);
        }
        expect(console.error).toBeCalledTimes(0);
      } finally {
        await page.close();
        await ctx.close();
        if (existsSync(newSampleFilePath)) {
          renameSync(newSampleFilePath, sampleFilePath);
        }
      }
    });
  });

  describe.skip('changing files should not work without WebpackWatchWaitForFileBuilderPlugin', () => {
    test(`webpack watching should not wait for fileBuilder's buildEnd and should throw error when changing files`, async () => {
      try {
        ctx = await launchFixture('webpack-watch-wait-file-builder', {
          plugins: ['./plugin/fileBuilder', './plugin/disableWebpackPlugin']
        });
        page = await ctx.browser.page(ctx.url('/one'));
        expect(await page.$text('#__APP')).toBe('Index Page sample1');
        const errorSpy = jest.spyOn(console, 'error');
        renameSync(sampleFilePath, newSampleFilePath);
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
        renameSync(newSampleFilePath, sampleFilePath);
        await check(
          () => checkShuviPortal(page),
          t => t
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
        if (existsSync(newSampleFilePath)) {
          renameSync(newSampleFilePath, sampleFilePath);
        }
      }
    });
  });
});
