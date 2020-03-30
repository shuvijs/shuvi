import { AppCtx, Page, launchFixture } from "../utils";

let ctx: AppCtx;
let page: Page;

jest.setTimeout(1000 * 60);

describe("Basic Features", () => {
  beforeAll(async () => {
    ctx = await launchFixture("basic");
  }, 1000 * 60 * 5);
  afterAll(async () => {
    // shuvi.close();
    await page.close();
    await ctx.browser.close();
  });

  beforeEach(() => {
    // force require to load file to make sure compiled file get load correctlly
    jest.resetModules();
  });

  test("Open /", async () => {
    page = await ctx.browser.page(ctx.url("/"));
    expect(await page.$text("div")).toBe("Index Page");
  });

  test("Open /about", async () => {
    await page.goto(ctx.url("/about"));
    expect(await page.$text("div")).toBe("About Page");
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
});
