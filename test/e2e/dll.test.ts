import { DEV_READY_ENDPOINT } from '@shuvi/shared/constants';
import { AppCtx, Page, devFixture, resolveFixture } from '../utils';

const FIXTURE = 'dll';
const pkg = /react@18\.2\.0/; //react@18.2.0

jest.setTimeout(5 * 60 * 1000);

describe('without Dll preBundle', () => {
  let ctx: AppCtx;
  let page: Page;
  let modules: string[];

  beforeAll(async () => {
    ctx = await devFixture(FIXTURE, { experimental: { preBundle: false } });
    page = await ctx.browser.page();
    await page.goto(ctx.url(DEV_READY_ENDPOINT));
    modules = await require(resolveFixture(`dll/build/client/modules.json`));
  });

  afterAll(async () => {
    await ctx.close();
  });

  test('react is bundled from node-module', async () => {
    expect(modules.filter(module => pkg.test(module)).length).not.toBe(0);
  });

  test('Page /', async () => {
    page = await ctx.browser.page(ctx.url('/'));
    expect(page.statusCode).toBe(200);
    expect(await page.$text('#dll')).toBe('Hello DLL');
  });
});

describe('with Dll preBundle', () => {
  let ctx: AppCtx;
  let page: Page;
  let modules: string[];

  beforeAll(async () => {
    jest.resetModules();
    ctx = await devFixture(FIXTURE, { experimental: { preBundle: true } });
    page = await ctx.browser.page();
    await page.goto(ctx.url(DEV_READY_ENDPOINT));
    modules = await require(resolveFixture(`dll/build/client/modules.json`));
  });

  afterAll(async () => {
    await ctx.close();
  });

  test('react is bundled from remote instead from node-module', async () => {
    expect(modules.filter(module => pkg.test(module)).length).toBe(0);
  });

  test('Page /', async () => {
    page = await ctx.browser.page(ctx.url('/'));
    expect(page.statusCode).toBe(200);
    expect(await page.$text('#dll')).toBe('Hello DLL');
  });
});
