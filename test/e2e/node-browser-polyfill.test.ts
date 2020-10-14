import { AppCtx, Page, launchFixture } from '../utils';

jest.setTimeout(5 * 60 * 1000);

afterEach(() => {
  // force require to load file to make sure compiled file get load correctlly
  jest.resetModules();
});

describe('Node Browser Polyfill', () => {
  let ctx: AppCtx;
  let page: Page;

  beforeAll(async () => {
    ctx = await launchFixture('node-browser-polyfill', { ssr: true });
  });
  afterEach(async () => {
    await page.close();
  });
  afterAll(async () => {
    await ctx.close();
  });

  test('should polyfill node API for browser correctly', async () => {
    page = await ctx.browser.page(ctx.url('/'));
    const data = await page.$text('#node-browser-polyfills');

    const parsedData = JSON.parse(data);

    expect(parsedData.vm).toBe(105);
    expect(parsedData.hash).toBe(
      'b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9'
    );
    expect(parsedData.path).toBe('/hello/world/test.txt');
    expect(parsedData.buffer).toBe('hello world');
    expect(parsedData.stream).toBe(true);
  });
});
