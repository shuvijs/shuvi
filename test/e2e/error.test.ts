import { AppCtx, Page, serveFixture } from '../utils';

jest.setTimeout(5 * 60 * 1000);

describe('default error display', () => {
  let ctx: AppCtx;
  let page: Page;
  describe('SSR', () => {
    beforeAll(async () => {
      ctx = await serveFixture('default-error');
      page = await ctx.browser.page();
    });

    afterAll(async () => {
      await page.close();
      await ctx.close();
    });

    describe('server error', () => {
      test('should display 500 status code at server rendering error', async () => {
        const result = await page.goto(ctx.url('/render-error'));
        expect(result?.status()).toBe(500);
        expect(await page.$text('#__APP')).toContain(
          '500Internal Server Error'
        );
      });
      test('should display 500 status code at server loader error', async () => {
        const result = await page.goto(ctx.url('/loader-error'));
        expect(result?.status()).toBe(500);
        expect(await page.$text('#__APP')).toContain(
          '500Internal Server Error'
        );
      });
    });

    describe('client error', () => {
      describe('should display Application Internal Error at client router navigation', () => {
        test('For render error', async () => {
          await page.goto(ctx.url('/'));
          await page.shuvi.navigate('/render-error');
          await page.waitForTimeout(1000);
          expect(await page.$text('#__APP')).toContain(
            'Internal Application Error'
          );
        });

        test('For loader error', async () => {
          await page.goto(ctx.url('/'));
          await page.shuvi.navigate('/loader-error');
          await page.waitForTimeout(1000);
          expect(await page.$text('#__APP')).toContain(
            'Internal Application Error'
          );
        });
      });
    });
  });

  describe('SPA', () => {
    beforeAll(async () => {
      ctx = await serveFixture('default-error', { ssr: false });
      page = await ctx.browser.page();
    });

    afterAll(async () => {
      await page.close();
      await ctx.close();
    });

    describe('should display Application Internal Error', () => {
      test('For render error', async () => {
        await page.goto(ctx.url('/'));
        await page.shuvi.navigate('/render-error');
        await page.waitForTimeout(1000);
        expect(await page.$text('#__APP')).toContain(
          'Internal Application Error'
        );
      });

      test('For loader error', async () => {
        await page.goto(ctx.url('/'));
        await page.shuvi.navigate('/loader-error');
        await page.waitForTimeout(1000);
        expect(await page.$text('#__APP')).toContain(
          'Internal Application Error'
        );
      });
    });
  });
});
