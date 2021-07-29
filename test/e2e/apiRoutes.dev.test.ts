import got from 'got';
import { AppCtx, launchFixture, resolveFixture } from '../utils';
import { readFileSync, writeFileSync } from 'fs';

let ctx: AppCtx;

jest.setTimeout(5 * 60 * 1000);

describe('apiRoutes development', () => {
  beforeAll(async () => {
    ctx = await launchFixture('api-routes');
  });
  afterAll(async () => {
    await ctx.close();
  });

  test('should work', async () => {
    let res;

    res = await got.get(ctx.url('/defer'));
    expect(res.body).toBe('defer OK');

    res = await got.get(ctx.url('/dir/a'));
    expect(res.body).toBe('dir/a OK');

    res = await got.get(ctx.url('/dir/b'));
    expect(res.body).toBe('dir/b OK');

    res = await got.get(ctx.url('/dir'));
    expect(res.body).toBe('dir/index OK');

    res = await got.get(ctx.url('/set-header'));
    expect(res.body).toBe('200 OK');
    expect(res.headers).toHaveProperty('shuvi-custom-header', 'bar');
  });

  test('should not match assetPublicPath for static files', async () => {
    const res = await got.get(ctx.url('/_shuvi/user.json'), {
      responseType: 'json'
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('name', 'foo');
  });

  describe('apiRoutes hmr', () => {
    test('should detect the changes and display it', async () => {
      const filePath = resolveFixture('api-routes/src/apis/hmr-test.js');
      let originalContent: string | undefined;
      let done = false;
      let page;

      try {
        page = await ctx.browser.page(ctx.url('/hmr-test'));
        expect(await page.$text('body')).toBe('body_content');

        originalContent = readFileSync(filePath, 'utf8');
        const editedContent = originalContent.replace(
          'body_content',
          'change_body_content'
        );

        // change the content
        writeFileSync(filePath, editedContent, 'utf8');

        page = await ctx.browser.page(ctx.url('/hmr-test'));

        expect(await page.$text('body')).toBe('change_body_content');

        // add the original content
        writeFileSync(filePath, originalContent, 'utf8');

        page = await ctx.browser.page(ctx.url('/hmr-test'));

        expect(await page.$text('body')).toBe('body_content');

        done = true;
      } finally {
        if (!done && originalContent) {
          writeFileSync(filePath, originalContent, 'utf8');
        }
      }
    });
  });
});
