import {
  CLIENT_APPDATA_ID,
  CLIENT_CONTAINER_ID
} from "@shuvi/shared/lib/constants";
import { AppCtx, Page, launchFixture } from "../utils";

let ctx: AppCtx;
let page: Page;

jest.setTimeout(1000 * 60);

describe("Dynamic", () => {
  beforeAll(async () => {
    ctx = await launchFixture("dynamic");
  }, 1000 * 60 * 5);
  afterAll(async () => {
    await page.close();
    await ctx.close();
  });

  afterEach(async () => {
    await page.close();
    // force require to load file to make sure compiled file get load correctlly
    jest.resetModules();
  });

  test("should render dynamic import components", async () => {
    page = await ctx.browser.page(ctx.url("/ssr"), {
      waitUntil: ["domcontentloaded"] // resolve before client-side render
    });
    const appData = JSON.parse(await page.$text(`#${CLIENT_APPDATA_ID}`));

    expect(appData.dynamicIds.includes("./src/components/hello.js")).toBe(true);
    expect(await page.$text("div")).toBe("Hello World");
  });

  test("should render even there are no physical chunk exists", async () => {
    page = await ctx.browser.page(ctx.url("/no-chunk"));

    expect(await page.$text("p:nth-child(1)")).toBe("Welcome, normal");
    expect(await page.$text("p:nth-child(2)")).toBe("Welcome, dynamic");
  });

  test("should hydrate nested chunks", async () => {
    page = await ctx.browser.page(ctx.url("/nested"));
    const log = page.collectBrowserLog();
    let body = await page.$text("body");

    expect((await body.indexOf("Nested 1")) >= 0).toBe(true);
    expect((await body.indexOf("Nested 2")) >= 0).toBe(true);

    await page.waitForSelector("#BrowserLoaded");
    body = await page.$text("body");

    expect((await body.indexOf("Browser hydrated")) >= 0).toBe(true);
    log.texts.forEach(text => {
      expect(text).not.toMatch(/Expected server HTML to contain/);
    });

    log.dispose();
  });

  test("should render the Head component", async () => {
    page = await ctx.browser.page(ctx.url("/head"));
    await page.waitForSelector("#dynamic-style");

    expect(await page.$text("#head")).toBe("test");

    const style = await page.$text("#dynamic-style");

    expect(style).toMatch(/\.dynamic-style/);
    expect(style).toMatch(/background-color: green;/);
  });

  test("should only render the component on client side", async () => {
    page = await ctx.browser.page(ctx.url("/no-ssr"), {
      disableJavaScript: true
    });
    const appData = JSON.parse(await page.$text(`#${CLIENT_APPDATA_ID}`));

    expect(appData.dynamicIds).not.toContain("./src/components/hello.js");
    expect(await page.$text(`#${CLIENT_CONTAINER_ID}`)).toBe("");
  });

  test("custom chunkfilename", async () => {
    page = await ctx.browser.page(ctx.url("/chunkfilename"));

    expect(await page.$text("body", true)).toMatch(/test chunkfilename/);
    expect(await page.$$attr("script", "src")).toEqual(
      expect.arrayContaining([expect.stringMatching(/hello-world\.js/)])
    );
  });

  describe("custom loading", () => {
    test("'should render custom loading on the server side when `ssr:false` and `loading` is provided'", async () => {
      page = await ctx.browser.page(ctx.url("/no-ssr-custom-loading"), {
        disableJavaScript: true
      });

      expect(await page.$text("p")).toBe("LOADING");
    });

    test("should render the component on client side", async () => {
      page = await ctx.browser.page(ctx.url("/no-ssr-custom-loading"));
      await page.waitForSelector("p");

      expect(await page.$text("p")).toBe("Hello World");
    });
  });
});
