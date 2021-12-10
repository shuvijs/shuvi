import { AppCtx, Page, launchFixtureAtCurrentProcess } from '../utils';

jest.setTimeout(5 * 60 * 1000);

afterEach(() => {
  // force require to load file to make sure compiled file get load correctlly
  jest.resetModules();
});

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
  afterAll(async () => {
    await page.close();
    await ctx.close();
    (process.env as any).NODE_ENV = originalNodeEnv;
  });

  test('should compile at first request', async () => {
    expect(getCompiledPage().length).toEqual(0);
  });

  test('should compile at first request', async () => {
    expect(isPageCompiled('index')).toBe(false);
    page = await ctx.browser.page(ctx.url('/'));
    expect(isPageCompiled('index')).toBe(true);
    expect(getCompiledPage().length).toEqual(1);
  });

  test('should compile while client navigate', async () => {
    expect(isPageCompiled('a')).toBe(false);
    await page.shuvi.navigate('/a');
    await page.waitFor('#a');
  });
});
