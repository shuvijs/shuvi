import { AppCtx, Page, launchFixture } from '../utils';

let ctx: AppCtx;
let page: Page;

jest.setTimeout(5 * 60 * 1000);

describe('Runtime Config', () => {
  beforeAll(async () => {
    ctx = await launchFixture('runtime-config', {
      runtimeConfig: {
        client: 'client',
        server: 'server',
        $serverOnly: 'server-only'
      }
    });
  });
  afterAll(async () => {
    await ctx.close();
  });

  afterEach(async () => {
    await page.close();
    // force require to load file to make sure compiled file get load correctlly
    jest.resetModules();
  });

  test('should works on server-side and client-sdie', async () => {
    page = await ctx.browser.page(ctx.url('/simple'));

    expect(await page.$text('#server')).toBe('server');
    await page.waitFor('#client');
    expect(await page.$text('#client')).toBe('client');
  });

  test('should get runtimeConfig on client-side (app.js side effect)', async () => {
    page = await ctx.browser.page(ctx.url('/simple'));

    expect(await page.$text('#app')).toBe('client');
  });

  test('should not access private config on client-side', async () => {
    page = await ctx.browser.page(ctx.url('/no-private'));
    expect(await page.$text('#no-private')).toBe('');
  });
});
