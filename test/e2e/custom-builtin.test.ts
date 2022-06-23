import { AppCtx, Page, launchFixture } from '../utils';

let ctx: AppCtx;
let page: Page;

jest.setTimeout(5 * 60 * 1000);

describe('Custom app.js', () => {
  beforeAll(async () => {
    ctx = await launchFixture('custom-app');
  });
  afterAll(async () => {
    await ctx.close();
  });
  afterEach(async () => {
    await page.close();
  });

  test('should render the custom app', async () => {
    page = await ctx.browser.page(ctx.url('/'));

    expect(await page.$text('#pathname')).toBe('/');
  });

  test('App.getInitalProps should work', async () => {
    page = await ctx.browser.page(ctx.url('/'), {
      disableJavaScript: true
    });

    expect(await page.$text('#pathname')).toBe('/');
  });
});

describe('[SPA] Custom app', () => {
  beforeAll(async () => {
    ctx = await launchFixture('custom-app', {
      ssr: false
    });
  });
  afterAll(async () => {
    await ctx.close();
  });
  afterEach(async () => {
    await page.close();
  });

  test('App.getInitalProps should work', async () => {
    page = await ctx.browser.page(ctx.url('/'));
    await page.waitForSelector('#pathname');

    expect(await page.$text('#pathname')).toBe('/');
  });
});

describe('Custom document template', () => {
  beforeAll(async () => {
    ctx = await launchFixture('custom-document-template');
  });
  afterAll(async () => {
    await ctx.close();
  });
  afterEach(async () => {
    await page.close();
  });

  test('should work', async () => {
    page = await ctx.browser.page(ctx.url('/'));

    expect(await page.$attr('body', 'test')).toBe('1');
  });
});

describe('Custom document.js', () => {
  beforeAll(async () => {
    ctx = await launchFixture('custom-document');
  });
  afterAll(async () => {
    await ctx.close();
  });
  afterEach(async () => {
    await page.close();
  });

  test('should work', async () => {
    page = await ctx.browser.page(ctx.url('/'));

    expect(await page.$attr('meta[name="test"]', 'content')).toBe('1');
    expect(await page.$attr('body', 'test')).toBe('1');
  });
});

describe('Custom 404 page', () => {
  beforeAll(async () => {
    ctx = await launchFixture('custom-404');
  });
  afterAll(async () => {
    await ctx.close();
  });
  afterEach(async () => {
    await page.close();
  });

  test('should work', async () => {
    page = await ctx.browser.page(ctx.url('/none-exist-page'));

    expect(await page.$text('#custom-404')).toBe('404');

    await page.shuvi.navigate('/');
    await page.waitForSelector('#index');
    expect(await page.$text('#index')).toBe('Index Page');

    await page.shuvi.navigate('/none-exist-page');
    await page.waitForSelector('#custom-404');
    expect(await page.$text('#custom-404')).toBe('404');
  });
});

describe('Custom Runtime.js', () => {
  beforeAll(async () => {
    ctx = await launchFixture('custom-runtime');
  });
  afterAll(async () => {
    await ctx.close();
  });
  afterEach(async () => {
    await page.close();
  });
  test('should work', async () => {
    page = await ctx.browser.page();
    const result = await page.goto(ctx.url('/404'));

    if (!result) {
      throw Error('no result');
    }

    expect(result.status()).toBe(404);
    expect(await page.$text('div')).toMatch(/404/);
  });

  test('appComponent and rootAppComponent should work', async () => {
    page = await ctx.browser.page(ctx.url('/'));
    expect(await page.$text('div')).toMatch(
      /This is getAppComponentpathname: \/This is getRootAppComponentIndex Page: index props/
    );
  });
});

describe('Custom Server.js', () => {
  beforeAll(async () => {
    ctx = await launchFixture('custom-server');
  });
  afterAll(async () => {
    await ctx.close();
  });
  afterEach(async () => {
    await page.close();
  });

  test('should work', async () => {
    page = await ctx.browser.page();
    const result = await page.goto(ctx.url('/404'));

    if (!result) {
      throw Error('no result');
    }

    expect(result.status()).toBe(404);
    expect(await page.$text('div')).toMatch(/404/);
  });

  test('should get pageData in client and custom documentProps', async () => {
    page = await ctx.browser.page(ctx.url('/page-data'));
    await page.waitForSelector('[data-test-id="page-data"]');
    expect(await page.$text('[data-test-id="page-data"]')).toBe('bar');
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

  test('should replace renderToHTML by hooks', async () => {
    jest.spyOn(console, 'log');

    page = await ctx.browser.page(ctx.url('/'));
    expect(console.log).toHaveBeenLastCalledWith(
      expect.stringMatching(/custom-renderToHTML[\s\S]+\<html\>/)
    );
  });
});
