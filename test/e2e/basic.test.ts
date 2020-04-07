import { AppCtx, Page, launchFixture } from "../utils";

let ctx: AppCtx;
let page: Page;

jest.setTimeout(1000 * 60);

describe("Basic Features", () => {
  beforeAll(async () => {
    ctx = await launchFixture("basic");
  });
  afterAll(async () => {
    await page.close();
    await ctx.close();
  });

  afterEach(() => {
    // force require to load file to make sure compiled file get load correctlly
    jest.resetModules();
  });

  test("Page /", async () => {
    page = await ctx.browser.page(ctx.url("/"));
    expect(await page.$text("div")).toBe("Index Page");
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

  test("Head Component", async () => {
    await page.shuvi.navigate("/head");
    await page.waitForSelector("#head");
    expect(await page.title()).toBe("Test Title");
  });

  test("404 Page", async () => {
    await page.shuvi.navigate("/none-exist-page");
    await page.waitForSelector("div[class*=page404]");
    expect(await page.$text("body")).toMatch(/404/);
  });

  describe("redirect", () => {
    let localCtx: AppCtx;
    let localPage: Page;
    afterAll(async () => {
      await localCtx.close();
    });
    afterEach(async () => {
      await localPage.close();
    });

    test("should work in server side", async () => {
      localCtx = await launchFixture("basic");
      localPage = await localCtx.browser.page(
        localCtx.url("/redirect", { target: "/about" })
      );
      expect(await localPage.$text("div")).toBe("About Page");
    });

    test("should work in client side", async () => {
      localPage = await localCtx.browser.page(localCtx.url("/"));
      await localPage.shuvi.navigate("/redirect", { target: "/about" });
      await localPage.waitForSelector("#about");
      expect(await localPage.$text("#about")).toBe("About Page");
    });
  });
});
