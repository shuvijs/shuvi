import { launchFixture } from "shuvi-test-utils";

jest.setTimeout(5 * 60 * 1000);

describe('react-16 test ', function () {
  const targetElementSelector = "#index"
  const expectResult = "Index Page";
  const getFixtureResult = async (ssr:boolean = true) => {

    let text:string;

    const ctx = await launchFixture('react-16', { ssr });

    const page = await ctx.browser.page(ctx.url("/"))

    await page.waitForSelector(targetElementSelector)

    text =  await page.$text(targetElementSelector)

    // await page.close();
    // await ctx.close();

    return text

  }


  test("should ssr render", async () => {
    const text = await getFixtureResult();
    expect(text).toBe(expectResult);
  });

  test("should csr render", async () => {
    const text = await getFixtureResult(false);
    expect(text).toBe(expectResult);
  });

});
