import { AppCtx, Page, launchFixture } from "../utils";

let ctx: AppCtx;
let page: Page;

jest.setTimeout(1000 * 60);

describe("Runtime Config", () => {
  afterAll(async () => {
    await page.close();
    await ctx.close();
  });

  afterEach(async () => {
    await page.close();
    // force require to load file to make sure compiled file get load correctlly
    jest.resetModules();
  });

  test("should render the custom app", async () => {
    ctx = await launchFixture("custom-app");
    page = await ctx.browser.page(ctx.url("/"));

    expect(await page.$text("#pathname")).toBe("/");
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
});
