import { AppCtx, Page, launchFixture } from '../utils';

let ctx: AppCtx;
let page: Page;

jest.setTimeout(5 * 60 * 1000);

describe('SSR: Runtime Config', () => {
  beforeAll(async () => {
    ctx = await launchFixture('runtime-config', {
      runtimeConfig: {
        a: 'a',
        b: 'b',
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
    page = await ctx.browser.page(ctx.url('/basic'));

    expect(await page.$text('#server-a')).toBe('a');
    expect(await page.$text('#server-b')).toBe('b');
    await page.waitFor('#client-a');
    expect(await page.$text('#client-a')).toBe('a');
  });

  test('should get runtimeConfig on client-side before render', async () => {
    page = await ctx.browser.page(ctx.url('/basic'));

    expect(await page.$text('#app')).toBe('a');
  });

  test('should not access private config on client-side', async () => {
    page = await ctx.browser.page(ctx.url('/no-private'));
    expect(await page.$text('#no-private')).toBe('');
  });
});

describe('CSR: Runtime Config', () => {
  beforeAll(async () => {
    ctx = await launchFixture('runtime-config', {
      ssr: false,
      router: {
        history: 'browser'
      },
      runtimeConfig: {
        a: 'a',
        b: 'b',
        $private: 'server-only'
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

  test('should works', async () => {
    page = await ctx.browser.page(ctx.url('/ssr-false'));

    await page.waitFor('#a');
    expect(await page.$text('#a')).toBe('a');
    expect(await page.$text('#b')).toBe('b');
  });
});
