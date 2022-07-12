import * as fs from 'fs';
import * as path from 'path';
import { AppCtx, Page, launchFixture, resolveFixture } from '../utils';

const FIXTURE = 'dll';
const pkg = 'polyfill';

function getFileContent(manifest: any, fileName: string): string {
  let realFile = '';
  const bundleKeys = Object.keys(manifest.bundles);
  for (let i = 0; i < bundleKeys.length; i++) {
    const key = bundleKeys[i];
    if (key.includes(fileName)) {
      realFile = manifest.bundles[key];
      break;
    }
  }
  if (!realFile) {
    throw new Error(`con't find webpack bundle file: ${fileName}`);
  }
  const fileDir = resolveFixture('dll/dist/client/');
  const fileContent = fs.readFileSync(path.join(fileDir, realFile), 'utf-8');
  return fileContent;
}

jest.setTimeout(5 * 60 * 1000);

describe('without Dll preBundle', () => {
  let ctx: AppCtx;
  let page: Page;
  let manifest: any;

  beforeAll(async () => {
    ctx = await launchFixture(FIXTURE, { experimental: { preBundle: false } });
    manifest = await require(resolveFixture(
      'dll/dist/build-manifest.client.json'
    ));
  });

  afterAll(async () => {
    await ctx.close();
  });

  test('polyfill is bundled in main.js', async () => {
    const fileContent = getFileContent(manifest, 'main');
    expect(fileContent).toMatch(pkg);
  });

  test('Page /', async () => {
    page = await ctx.browser.page(ctx.url('/'));
    expect(page.statusCode).toBe(200);
    expect(await page.$text('div')).toBe('Hello DLL');
  });
});

describe('with Dll preBundle', () => {
  let ctx: AppCtx;
  let page: Page;
  let manifest: any;

  beforeAll(async () => {
    ctx = await launchFixture(FIXTURE, { experimental: { preBundle: true } });
    manifest = await require(resolveFixture(
      'dll/dist/build-manifest.client.json'
    ));
  });

  afterAll(async () => {
    await ctx.close();
  });

  test('polyfill is not bundled in main.js', async () => {
    const fileContent = getFileContent(manifest, 'main');
    expect(fileContent).not.toMatch(pkg);
  });

  test('Page /', async () => {
    page = await ctx.browser.page(ctx.url('/'));
    expect(page.statusCode).toBe(200);
    expect(await page.$text('div')).toBe('Hello DLL');
  });
});
