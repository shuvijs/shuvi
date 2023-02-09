import { DEV_STYLE_HIDE_FOUC } from '@shuvi/shared/constants';
import { AppCtx, Page, devFixture } from '../utils';

jest.setTimeout(5 * 60 * 1000);

['CSS', 'LightningCss'].forEach(function (describeName) {
  let ctx: AppCtx;
  let page: Page;

  describe(describeName, () => {
    beforeAll(async () => {
      ctx = await devFixture(
        'css',
        describeName === 'LightningCss'
          ? {
              experimental: {
                lightningCss: true
              }
            }
          : {}
      );
    }, 1000 * 60 * 5);
    afterAll(async () => {
      await ctx.close();
    });
    afterEach(async () => {
      await page.close();
    });

    test('should import .css files', async () => {
      page = await ctx.browser.page(ctx.url('/css'));
      // wait for style inserting
      await page.waitForTimeout(1000);
      expect(
        await page.$eval(
          '#css',
          (el: Element) => window.getComputedStyle(el).fontSize
        )
      ).toBe('16px');
      expect(
        await page.$eval(
          '#css',
          (el: Element) => window.getComputedStyle(el).opacity
        )
      ).toBe('0.5');
    });

    test('should import .sass files', async () => {
      page = await ctx.browser.page(ctx.url('/sass'));
      // wait for style inserting
      await page.waitForTimeout(1000);
      expect(
        await page.$eval(
          '#css',
          (el: Element) => window.getComputedStyle(el).fontSize
        )
      ).toBe('16px');
      expect(
        await page.$eval(
          '#css',
          (el: Element) => window.getComputedStyle(el).opacity
        )
      ).toBe('0.5');
    });

    test('should import .scss files', async () => {
      page = await ctx.browser.page(ctx.url('/scss'));
      // wait for style inserting
      await page.waitForTimeout(1000);
      expect(
        await page.$eval(
          '#css',
          (el: Element) => window.getComputedStyle(el).fontSize
        )
      ).toBe('16px');
      expect(
        await page.$eval(
          '#css',
          (el: Element) => window.getComputedStyle(el).opacity
        )
      ).toBe('0.5');
    });

    test('should import .css files as css modules', async () => {
      page = await ctx.browser.page(ctx.url('/css-modules'));
      // wait for style inserting
      page.waitForFunction(`document
    .querySelectorAll('[${DEV_STYLE_HIDE_FOUC}]').length <= 0`);

      // wait for render
      page.waitForTimeout(1000);

      expect(await page.$attr('#css-modules', 'class')).toMatch(/test__.*/);
      expect(
        await page.$eval(
          '#css-modules',
          (el: Element) => window.getComputedStyle(el).opacity
        )
      ).toBe('0.5');
      const nextButtonStyle = await page.$eval(
        '#next-button',
        (el: Element) => {
          const { padding, border, cursor, backgroundColor, color } =
            window.getComputedStyle(el);
          return {
            padding,
            border,
            cursor,
            backgroundColor,
            color
          };
        }
      );
      expect(nextButtonStyle).toStrictEqual({
        padding: '7px 15px',
        border: '0px none rgb(255, 255, 255)',
        cursor: 'pointer',
        backgroundColor: 'rgb(0, 0, 255)',
        color: 'rgb(255, 255, 255)'
      });
    });

    test('should export class mapping for css modules on ssr', async () => {
      page = await ctx.browser.page(ctx.url('/css-modules-ssr'), {
        disableJavaScript: true
      });
      expect(await page.$attr('[data-test-id="css"]', 'class')).toMatch(
        /test__.*/
      );
      expect(await page.$attr('[data-test-id="sass"]', 'class')).toMatch(
        /test__.*/
      );
      expect(await page.$attr('[data-test-id="scss"]', 'class')).toMatch(
        /test__.*/
      );
    });

    test('should remove FOUC style when no css', async () => {
      page = await ctx.browser.page(ctx.url('/no-css'));
      // wait for style inserting
      page.waitForFunction(
        `document.querySelectorAll('[${DEV_STYLE_HIDE_FOUC}]').length <= 0`
      );
      expect(
        await page.$eval(
          'body',
          (el: Element) => window.getComputedStyle(el).display
        )
      ).not.toBe('none');
    });
  });
});
