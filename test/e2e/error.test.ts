import { AppCtx, Page, launchFixture } from '../utils';

jest.setTimeout(5 * 60 * 1000);

describe('Warnings', () => {
  let ctx: AppCtx;
  let page: Page;
  let logSpy = jest
    .spyOn(console, 'error')
    .mockImplementationOnce(() => void 0);

  beforeAll(async () => {
    ctx = await launchFixture('error', { ssr: true });
  });

  afterAll(async () => {
    await page.close();
    await ctx.close();
    logSpy.mockRestore();
  });

  test('should log onDocumentProps error', async () => {
    Object.assign(process.env, {
      NODE_ENV: 'development'
    });
    page = await ctx.browser.page(ctx.url('/'));

    expect(logSpy).toHaveBeenLastCalledWith(
      expect.stringMatching(
        /server error: \/.+onDocumentProps not returning object/
      )
    );
  });
});
