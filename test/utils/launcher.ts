import { shuvi, Shuvi } from "shuvi/src/shuvi";
import { loadFixture } from "./fixture";
import Browser from "./browser";

export { Shuvi };

export async function launchFixture(
  name: string,
  port: number
): Promise<{ shuvi: Shuvi; browser: Browser }> {
  const config = await loadFixture(name);
  const shuviApp = shuvi({ dev: true, config });

  await shuviApp.listen(port);
  const browser = new Browser();
  await browser.start();

  return {
    shuvi: shuviApp,
    browser
  };
}
