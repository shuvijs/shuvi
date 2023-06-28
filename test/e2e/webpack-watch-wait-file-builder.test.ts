import {
  AppCtx,
  Page,
  devFixture,
  resolveFixture,
  check
} from '../utils/index';
import { copySync, renameSync, existsSync, removeSync } from 'fs-extra';

jest.setTimeout(30 * 60 * 1000);

const sampleFilePath = resolveFixture(
  'webpack-watch-wait-file-builder/src/sample.js'
);
const newSampleFilePath = resolveFixture(
  'webpack-watch-wait-file-builder/src/new-sample.js'
);
const routesDirPath = resolveFixture(
  'webpack-watch-wait-file-builder/src/routes'
);

const _routesDirPath = resolveFixture(
  'webpack-watch-wait-file-builder/src/_routes'
);

const newRoutesDirPath = resolveFixture(
  'webpack-watch-wait-file-builder/src/new-routes'
);

const oneDirPath = resolveFixture(
  'webpack-watch-wait-file-builder/src/routes/one'
);

const twoDirPath = resolveFixture(
  'webpack-watch-wait-file-builder/src/routes/two'
);
const threeDirPath = resolveFixture(
  'webpack-watch-wait-file-builder/src/routes/three'
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

afterEach(() => {
  removeSync(routesDirPath);
  copySync(_routesDirPath, routesDirPath);
  jest.restoreAllMocks();
});

describe('webpack watch wait file builder', () => {
  let ctx: AppCtx;
  let page: Page;

  describe('changing files should work with WebpackWatchWaitForFileBuilderPlugin', () => {
    test(`webpack watching should wait for fileBuilder's buildEnd and should not throw error when changing files`, async () => {
      try {
        ctx = await devFixture('webpack-watch-wait-file-builder');
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

          renameSync(newSampleFilePath, sampleFilePath);
          await check(
            () => page.$text('#__APP'),
            t => /Index Page sample1/.test(t)
          );

          // change one page file path and change back
          renameSync(onePageFilePath, newOnePageFilePath);
          await check(
            () => page.$text('#__APP'),
            t => /This page could not be found/.test(t)
          );

          renameSync(newOnePageFilePath, onePageFilePath);
          await check(
            () => page.$text('#__APP'),
            t => /Index Page sample1/.test(t)
          );

          // change one dir path and change back
          renameSync(oneDirPath, newOneDirPath);
          await check(
            () => page.$text('#__APP'),
            t => /This page could not be found/.test(t)
          );

          renameSync(newOneDirPath, oneDirPath);
          await check(
            () => page.$text('#__APP'),
            t => /Index Page sample1/.test(t)
          );

          // change routes dir path and change back
          renameSync(routesDirPath, newRoutesDirPath);
          await check(
            () => page.$text('#__APP'),
            t => /This page could not be found/.test(t)
          );

          renameSync(newRoutesDirPath, routesDirPath);
          await check(
            () => page.$text('#__APP'),
            t => /Index Page sample1/.test(t)
          );
        };

        const times = 5;

        for (let i = 0; i < times; i++) {
          await loopFn(i + 1);
        }
        expect(errorSpy).not.toHaveBeenCalled();
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
        ctx = await devFixture('webpack-watch-wait-file-builder');
        page = await ctx.browser.page(ctx.url('/one'));
        expect(await page.$text('#__APP')).toBe('Index Page sample1');
        const errorSpy = jest.spyOn(console, 'error');

        renameSync(oneDirPath, twoDirPath);
        await check(
          () => page.$text('#__APP'),
          t => /This page could not be found/.test(t)
        );
        expect(errorSpy).not.toHaveBeenCalled();
      } finally {
        await page.close();
        await ctx.close();
        if (existsSync(threeDirPath)) {
          renameSync(threeDirPath, oneDirPath);
        }
      }
    });
  });
});
