import * as fs from 'fs';
import * as path from 'path';
import {
  AppCtx,
  Page,
  serveFixture,
  launchFixture,
  resolveFixture
} from '../utils';

function getFileContent(
  manifest: any,
  fileName: string,
  from: string = 'loadble'
): string {
  let realFile = '';
  if (from === 'loadble') {
    const target = manifest.loadble;
    const loadbleKeys = Object.keys(target);
    for (let i = 0; i < loadbleKeys.length; i++) {
      const key = loadbleKeys[i];
      if (key.includes(fileName)) {
        realFile = target[key]['files'][0];
        break;
      }
    }
  } else if (from === 'bundles') {
    const target = manifest.bundles;
    const bundles = Object.keys(target);
    for (let i = 0; i < bundles.length; i++) {
      const key = bundles[i];
      if (key.includes(fileName)) {
        realFile = target[key];
        break;
      }
    }
  }
  if (!realFile) {
    throw new Error(`con't find webpack bundle file: ${fileName}`);
  }
  const fileDir = resolveFixture('loader-tree-shaking/dist/client/');
  const fileContent = fs.readFileSync(path.join(fileDir, realFile), 'utf-8');
  return fileContent;
}

jest.setTimeout(5 * 60 * 1000);

describe('Loader Tree Shaking development', () => {
  let ctx: AppCtx;
  let page: Page;
  let manifest: any;

  beforeAll(async () => {
    Object.assign(process.env, {
      NODE_ENV: 'development'
    });
    ctx = await launchFixture('loader-tree-shaking', { ssr: true }, {}, true);

    page = await ctx.browser.page();
    manifest = await require(resolveFixture(
      'loader-tree-shaking/dist/build-manifest.client.json'
    ));
  });

  afterAll(async () => {
    await page.close();
    await ctx.close();
  });

  test('route page should remove loader function-declaration/async', async () => {
    await page.goto(ctx.url('/function-declaration/async'));
    await page.waitForSelector('#content');
    const fileContent = getFileContent(manifest, 'function-declaration/async');
    expect(fileContent).not.toMatch('function-declaration-async-loader-symbol');
  });

  test('route page should remove loader function-declaration/normal', async () => {
    await page.goto(ctx.url('/function-declaration/normal'));
    await page.waitForSelector('#content');
    const fileContent = getFileContent(manifest, 'function-declaration/normal');
    expect(fileContent).not.toMatch(
      'function-declaration-normal-loader-symbol'
    );
  });

  test('route page should remove loader variable-declaration/async', async () => {
    await page.goto(ctx.url('/variable-declaration/async'));
    await page.waitForSelector('#content');
    const fileContent = getFileContent(manifest, 'variable-declaration/async');
    expect(fileContent).not.toMatch('variable-declaration-async-loader-symbol');
  });

  test('route page should remove loader variable-declaration/normal', async () => {
    await page.goto(ctx.url('/variable-declaration/normal'));
    await page.waitForSelector('#content');
    const fileContent = getFileContent(manifest, 'variable-declaration/normal');
    expect(fileContent).not.toMatch(
      'variable-declaration-normal-loader-symbol'
    );
  });

  test("main entry should only keep page's loader", async () => {
    await page.goto(ctx.url('/function-declaration/async'));
    await page.waitForSelector('#content');
    const fileContent = getFileContent(manifest, 'main', 'bundles');
    expect(fileContent).toMatch('function-declaration-async-loader-symbol');
    expect(fileContent).toMatch('function-declaration-normal-loader-symbol');
    expect(fileContent).toMatch('variable-declaration-async-loader-symbol');
    expect(fileContent).toMatch('variable-declaration-normal-loader-symbol');
    expect(fileContent).not.toMatch('component-symbol');
  });
});
