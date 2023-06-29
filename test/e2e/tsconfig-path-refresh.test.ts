import {
  AppCtx,
  Page,
  devFixture,
  resolveFixture,
  check
} from '../utils/index';
import { readFileSync, writeFileSync } from 'fs';

jest.setTimeout(5 * 60 * 1000);

const FIXTURE = 'tsconfig-path-refresh';
const TSCONFIG_FILE_PATH = `${FIXTURE}/tsconfig.json`;
const MAIN_PAGE_PATH = `${FIXTURE}/src/routes/page.tsx`;

declare global {
  interface Window {
    [key: string]: any;
  }
}

describe('Tsconfig Path Refresh', () => {
  let ctx: AppCtx;
  let page: Page;

  beforeAll(async () => {
    ctx = await devFixture(FIXTURE);
    page = await ctx.browser.page(ctx.url('/'));
  });

  afterAll(async () => {
    await page.close();
    await ctx.close();
  });

  test('should load with initial paths config correctly', async () => {
    expect(await page.$text('#first-component')).toEqual('first component');
    expect(await page.$text('#second-component')).toEqual('second component');
    expect(await page.$text('#first-data')).toEqual(
      JSON.stringify({
        data: 'first'
      })
    );
  });

  test.skip('should automatically load added paths correctly', async () => {
    const mainPageContent = readFileSync(
      resolveFixture(MAIN_PAGE_PATH),
      'utf8'
    );
    const tsconfigContent = readFileSync(
      resolveFixture(TSCONFIG_FILE_PATH),
      'utf8'
    );
    try {
      expect(await page.$text('#first-component')).toEqual('first component');
      expect(await page.$text('#second-component')).toEqual('second component');
      expect(await page.$text('#first-data')).toEqual(
        JSON.stringify({
          data: 'first'
        })
      );

      // edit the main page import
      let editedMainPageContent = mainPageContent.replace(
        '@myComponent2',
        '@myTestComponent2'
      );
      writeFileSync(
        resolveFixture(MAIN_PAGE_PATH),
        editedMainPageContent,
        'utf8'
      );

      // edit the tsconfig paths
      const tsconfig = JSON.parse(tsconfigContent);
      writeFileSync(
        resolveFixture(TSCONFIG_FILE_PATH),
        JSON.stringify({
          ...tsconfig,
          compilerOptions: {
            paths: {
              ...tsconfig.compilerOptions.paths,
              '@myTestComponent2': ['src/components/component-2-test.tsx']
            }
          }
        }),
        'utf8'
      );

      expect(await page.$text('#first-component')).toEqual('first component');
      // component-2 should be updated to component-2-test
      await check(
        () => page.$text('#second-component'),
        t => /Test 2 component/.test(t)
      );
      expect(await page.$text('#first-data')).toEqual(
        JSON.stringify({
          data: 'first'
        })
      );
    } finally {
      writeFileSync(resolveFixture(MAIN_PAGE_PATH), mainPageContent, 'utf8');
      writeFileSync(
        resolveFixture(TSCONFIG_FILE_PATH),
        tsconfigContent,
        'utf8'
      );
    }
  });
});
