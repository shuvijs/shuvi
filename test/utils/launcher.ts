import { shuvi, Shuvi } from "shuvi/src/shuvi";
import { loadFixture } from "./fixture";
import { findPort } from "./findPort";
import Browser from "./browser";

export { Shuvi };

export interface AppCtx {
  shuvi: Shuvi;
  browser: Browser;
  url: (x: string) => string;
}

export async function launchFixture(name: string): Promise<AppCtx> {
  const port = await findPort();
  const config = await loadFixture(name);
  const shuviApp = shuvi({ dev: true, config });

  await shuviApp.listen(port);
  const browser = new Browser();
  await browser.start();

  const url = (route: string) => "http://localhost:" + port + route;

  return {
    shuvi: shuviApp,
    browser,
    url
  };
}
