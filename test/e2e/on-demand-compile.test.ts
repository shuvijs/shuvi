import { AppCtx, Page, launchFixtureAtCurrentProcess } from '../utils';

jest.setTimeout(5 * 60 * 1000);

function getCompiledPage(): string[] {
  return (global as any).__shuviPages || [];
}

function isPageCompiled(page: string) {
  return ((global as any).__shuviPages || []).indexOf(page) >= 0;
}

describe('On Demand Compile', () => {
  let ctx: AppCtx;
  let page: Page;
  const originalNodeEnv: string = (process.env as any).NODE_ENV;
  beforeAll(async () => {
    (process.env as any).NODE_ENV = 'development';
    ctx = await launchFixtureAtCurrentProcess('on-demand-compile');
  });
  beforeEach(() => {
    jest.resetAllMocks();
  });
  afterAll(async () => {
    await page.close();
    await ctx.close();
    (process.env as any).NODE_ENV = originalNodeEnv;
  });
  afterEach(() => {
    // force require to load file to make sure compiled file get load correctlly
    jest.resetModules();
  });

  test('should compile on demand', async () => {
    // should compile at first request
    expect(getCompiledPage().length).toEqual(0);
    expect(isPageCompiled('index')).toBe(false);
    page = await ctx.browser.page(ctx.url('/'));
    expect(isPageCompiled('index')).toBe(true);
    expect(getCompiledPage().length).toEqual(1);
    // should compile while client navigate
    expect(isPageCompiled('a')).toBe(false);
    await page.shuvi.navigate('/a');
    await page.waitForSelector('#a');
  });
});
