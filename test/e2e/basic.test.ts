import { Shuvi, Browser, Page, findPort, launchFixture } from "../utils";

let port: number;
let shuvi: Shuvi;
let browser: Browser;
let page: Page;
const url = (route: string) => "http://localhost:" + port + route;

jest.setTimeout(1000 * 60);

describe("Basic Features", () => {
  beforeAll(async () => {
    port = await findPort();
    const res = await launchFixture("basic", port);
    browser = res.browser;
    shuvi = res.shuvi;
    page = await browser.page();

    // pre-build all pages at the start
    await Promise.all([]);
  }, 1000 * 60 * 5);
  afterAll(async () => {
    shuvi.close();
    await page.close();
    await browser.close();
  });

  test("Open /", async () => {
    await page.goto(url("/"));
    expect(await page.$text("div")).toBe("Index Page");
  });

  test("Open /about", async () => {
    await page.goto(url("/about"));
    expect(await page.$text("div")).toBe("About Page");
  });
});
