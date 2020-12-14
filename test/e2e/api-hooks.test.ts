import { AppCtx, Page, launchFixture } from '../utils';

jest.setTimeout(5 * 60 * 1000);

afterEach(() => {
  // force require to load file to make sure compiled file get load correctlly
  jest.resetModules();
});

describe('API Hook', () => {
  let ctx: AppCtx;
  let page: Page;
  let spyGlobalTestHTML: jest.SpyInstance;

  beforeAll(async () => {
    (global as any).testHTML = () => {};
    // @ts-ignore
    spyGlobalTestHTML = jest.spyOn(global, 'testHTML');
    ctx = await launchFixture('api-hooks', { ssr: true });
  });
  afterEach(async () => {
    await page.close();
    jest.resetAllMocks();
  });
  afterAll(async () => {
    await ctx.close();
  });

  test('should inject custom documentProps', async () => {
    page = await ctx.browser.page(ctx.url('/'));

    expect(
      (
        await page.$$eval(
          'head > meta[name="testDocumentProps"]',
          element => element
        )
      ).length
    ).toBe(1);
  });

  test('should call onViewDone event', async () => {
    page = await ctx.browser.page(ctx.url('/'));

    expect(spyGlobalTestHTML).toBeCalledWith(
      expect.objectContaining({
        html: expect.anything(),
        req: expect.anything(),
        res: expect.anything(),
        appContext: expect.anything()
      })
    );
  });
});
