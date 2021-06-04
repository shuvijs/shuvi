import { AppCtx, Page, launchFixture } from '../utils';

jest.setTimeout(5 * 60 * 1000);

afterEach(() => {
  // force require to load file to make sure compiled file get load correctlly
  jest.resetModules();
});

describe('TypesSript Suppport', () => {
  let ctx: AppCtx;
  let page: Page;

  beforeAll(async () => {
    // await fse.remove(resolveFixture('typescript', 'tsconfig.json'));
    ctx = await launchFixture('typescript', { ssr: true });
  });
  afterAll(async () => {
    await page.close();
    await ctx.close();
  });

  test('Page /', async () => {
    page = await ctx.browser.page(ctx.url('/hello'));

    expect(await page.$text('[data-test-id="pathname"]')).toEqual('/hello');
    expect(await page.$text('[data-test-id="bigInt"]')).toMatch(
      /1000000000000/
    );
  });
});
