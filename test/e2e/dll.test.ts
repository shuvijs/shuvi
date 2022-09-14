import { AppCtx, Page, devFixture, resolveFixture } from '../utils';

const FIXTURE = 'dll';
const pkg = /react@18\.1\.0/; //react@18.1.0

jest.setTimeout(5 * 60 * 1000);

describe('without Dll preBundle', () => {
  let ctx: AppCtx;
  let page: Page;
  let modules: string[];

  beforeAll(async () => {
    ctx = await devFixture(FIXTURE, { experimental: { preBundle: false } });
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
    expect(await page.$text('div')).toBe('Hello DLL');
  });
});

describe('with Dll preBundle', () => {
  let ctx: AppCtx;
  let page: Page;
  let modules: string[];

  beforeAll(async () => {
    jest.resetModules();
    ctx = await devFixture(FIXTURE, { experimental: { preBundle: true } });
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
    expect(await page.$text('div')).toBe('Hello DLL');
  });
});
