import { IConfig } from "@shuvi/types";
import { shuvi, Shuvi } from "shuvi";
import { loadFixture } from "./fixture";
import { findPort } from "./findPort";
import Browser from "./browser";

export { Shuvi };

export interface AppCtx {
  shuvi: Shuvi;
  browser: Browser;
  url: (x: string) => string;
  close(): void;
}

export async function launchFixture(name: string, overrides?: Partial<IConfig>): Promise<AppCtx> {
  const port = await findPort();
  const config = await loadFixture(name, overrides);
  const shuviApp = shuvi({ dev: true, config });

  await shuviApp.listen(port);
  const browser = new Browser();
  await browser.start();

  const url = (route: string) => "http://localhost:" + port + route;

  return {
    shuvi: shuviApp,
    browser,
    url,
    close() {
      browser.close();
    }
  };
}
