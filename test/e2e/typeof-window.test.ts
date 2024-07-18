import { AppCtx, Page, serveFixture, resolveFixture } from '../utils';
import fse from 'fs-extra';

jest.setTimeout(5 * 60 * 1000);

const fixtureName = 'basic';

describe('typeof-window', () => {
  let ctx: AppCtx;
  let page: Page;

  beforeAll(async () => {
    ctx = await serveFixture(fixtureName, {
      ssr: true,
      router: { history: 'browser' }
    });
  });
  afterAll(async () => {
    await page.close();
    await ctx.close();
  });

  test(`webpack should remove 'typeof window' dead code.`, async () => {
    expect.assertions(2);
    page = await ctx.browser.page(ctx.url('/esmodule'));
    await page.waitForSelector('#hello');
    expect(await page.$text('#hello')).toBe('Hello World');

    const projectBuildPath = resolveFixture(fixtureName, 'build');
    const clientManifest = require(`${projectBuildPath}/build-manifest.client.json`);
    const loadble = clientManifest.loadble;
    for (const key in loadble) {
      if (key.includes('routes/esmodule/page')) {
        const pageStaticFilePath = resolveFixture(
          fixtureName,
          'build',
          'client',
          // filename
          loadble[key].files[0]
        );
        // read file content to check if 'typeof window' is removed
        const fileContent = await fse.readFile(pageStaticFilePath, 'utf-8');
        expect(fileContent).not.toContain('typeof window');
      }
    }
  });
});
