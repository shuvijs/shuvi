import * as fs from 'fs';
import * as path from 'path';
import { AppCtx, Page, devFixture, resolveFixture } from '../utils';

let ctx: AppCtx;
let page: Page;

jest.setTimeout(5 * 60 * 1000);

describe('SPA mode', () => {
  beforeAll(async () => {
    ctx = await devFixture('spa');
  });
  afterAll(async () => {
    await ctx.close();
  });
  afterEach(async () => {
    if (page && !page.isClosed) {
      await page.close();
    }
  });

  it('should not include ssr-only runtime modules when ssr = false', async () => {
    page = await ctx.browser.page(ctx.url('/'));

    const fixtureDir = resolveFixture('spa');
    const fileContent = fs.readFileSync(
      path.join(fixtureDir, 'build/server/server.js'),
      'utf-8'
    );
    expect(fileContent).not.toContain('cutsom-app-mlmc3i27w1');
    expect(fileContent).not.toContain('runtime-plugin-xrHRS0jMox');
  });
});
