import { AppCtx, Page, launchFixture } from "../utils";

let ctx: AppCtx;
let page: Page;

jest.setTimeout(1000 * 60);

describe("Custom builtin", () => {
  afterAll(async () => {
    await ctx.close();
  });
  afterEach(async () => {
    await page.close();
    // force require to load file to make sure compiled file get load correctlly
    jest.resetModules();
  });

  describe("app", () => {
    let localCtx: AppCtx;
    beforeAll(async () => {
      localCtx = await launchFixture("custom-app");
    });
    afterAll(async () => {
      await localCtx.close();
    });

    test("should render the custom app", async () => {
      page = await localCtx.browser.page(localCtx.url("/"));

      expect(await page.$text("#pathname")).toBe("/");
    });

    test("App.getInitalProps should work in server side", async () => {
      page = await localCtx.browser.page(localCtx.url("/"), {
        disableJavaScript: true
      });

      expect(await page.$text("#pathname")).toBe("/");
    });

    test("App.getInitalProps should work in client side", async () => {
      localCtx = await launchFixture("custom-app", { ssr: false });
      page = await localCtx.browser.page(localCtx.url("/"));
      await page.waitForSelector("#pathname");

      expect(await page.$text("#pathname")).toBe("/");
    });
  });

  test("should render the custom template", async () => {
    ctx = await launchFixture("custom-document-template");
    page = await ctx.browser.page(ctx.url("/"));

    expect(await page.$attr("body", "test")).toBe("1");
  });

  test("should works with custom document", async () => {
    ctx = await launchFixture("custom-document");
    page = await ctx.browser.page(ctx.url("/"));

    expect(await page.$attr('meta[name="test"]', "content")).toBe("1");
    expect(await page.$attr("body", "test")).toBe("1");
  });

  test("should works with custom 404 page", async () => {
    ctx = await launchFixture("custom-404");
    page = await ctx.browser.page(ctx.url("/none-exist-page"));

    expect(await page.$text("#custom-404")).toBe("404");

    await page.shuvi.navigate("/");
    await page.waitForSelector("#index");
    expect(await page.$text("#index")).toBe("Index Page");

    await page.shuvi.navigate("/none-exist-page");
    await page.waitForSelector("#custom-404");
    expect(await page.$text("#custom-404")).toBe("404");
  });
});
