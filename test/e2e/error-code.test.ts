import { Page,launchFixture,AppCtx } from '../utils'

jest.setTimeout(5 * 60 * 1000);

describe('error code test', function () {

  let ctx:AppCtx;
  let page:Page

  beforeAll(async () => {
    ctx = await launchFixture("error-code")
    page = await ctx.browser.page(ctx.url("/"));
    await page.waitForSelector("#__APP")
  })


  afterAll(async () => {
    await page.close();
    await ctx.close();
  })

  it('http status code is 404', function () {
    expect(page.statusCode).toBe(404);
  });

  test("render status correct",async () => {
    const text = await page.$text("#__APP  > div > div > div:first-child")
    expect(text).toBe("404");
  })

  test("render description correct",async () => {
    const text = await page.$text("#__APP  > div > div > div:nth-child(2)")
    expect(text).toBe("page not found");

  })

});
