import { AppCtx, Page, launchFixture } from "../utils";

jest.setTimeout(1000 * 60);

afterEach(() => {
  // force require to load file to make sure compiled file get load correctlly
  jest.resetModules();
});

describe.only("Basic Features: CSR", () => {
  let ctx: AppCtx;
  let page: Page;

  beforeAll(async () => {
    ctx = await launchFixture("basic", {
      ssr: false,
      router: { history: "browser" }
    });
  });
  afterAll(async () => {
    await page.close();
    await ctx.close();
  });

  test("Page /", async () => {
    page = await ctx.browser.page(ctx.url("/"));
    expect(await page.$$attr("body script", "src")).toEqual(
      expect.arrayContaining([expect.stringMatching(/polyfill\.js/)])
    );
    await page.waitForSelector("#index");
    expect(await page.$text("#index")).toBe("Index Page");
  });

  test("Page /about", async () => {
    await page.goto(ctx.url("/about"));
    await page.waitForSelector("#about");
    expect(await page.$text("#about")).toBe("About Page");
  });

  test("process-env", async () => {
    await page.shuvi.navigate("/process-env");
    await page.waitForSelector("#process-env");
    expect(await page.$text("#process-env")).toBe("development");
  });
});
