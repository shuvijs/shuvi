// License: https://github.com/nuxt/nuxt.js/blob/9831943a1f270069e05bbf1a472804b31ed4b007/LICENSE

// @ts-ignore
import puppeteer from "puppeteer-core";

import ChromeDetector from "./chrome";

export interface Page extends puppeteer.Page {
  [x: string]: any;
}

export default class Browser {
  private _detector: any;
  private _browser!: puppeteer.Browser;

  constructor() {
    this._detector = new ChromeDetector();
  }

  async start(options = {}) {
    // https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#puppeteerlaunchoptions
    const _opts = {
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
      ...options
    };

    if (!_opts.executablePath) {
      _opts.executablePath = this._detector.detect();
    }

    this._browser = await puppeteer.launch(_opts);
  }

  async close() {
    if (!this._browser) {
      return;
    }
    await this._browser.close();
  }

  async page(url?: string): Promise<Page> {
    if (!this._browser) {
      throw new Error("Please call start() before page(url)");
    }
    const page: Page = await this._browser.newPage();
    if (url) {
      await page.goto(url);
    }
    // await page.waitForFunction(`!!${page.$nuxtGlobalHandle}`);

    page.html = () =>
      page.evaluate(() => window.document.documentElement.outerHTML);
    page.$text = (selector: string, trim: boolean) =>
      page.$eval(
        selector,
        (el, trim) => {
          if (!el.textContent) {
            return "";
          }

          return trim
            ? el.textContent.replace(/^\s+|\s+$/g, "")
            : el.textContent;
        },
        trim
      );
    page.$$text = (selector: string, trim: boolean) =>
      page.$$eval(
        selector,
        (els, trim) =>
          els.map(el => {
            if (!el.textContent) {
              return [];
            }

            return trim
              ? el.textContent.replace(/^\s+|\s+$/g, "")
              : el.textContent;
          }),
        trim
      );
    page.$attr = (selector: string, attr: string) =>
      page.$eval(selector, (el, attr) => el.getAttribute(attr), attr);
    page.$$attr = (selector: string, attr: string) =>
      page.$$eval(
        selector,
        (els, attr) => els.map(el => el.getAttribute(attr)),
        attr
      );

    // page.$nuxtGlobalHandle = `window.$${globalName}`;
    // page.$nuxt = await page.evaluateHandle(page.$nuxtGlobalHandle);

    // page.nuxt = {
    //   async navigate(path, waitEnd = true) {
    //     const hook = page.evaluate(`
    //       new Promise(resolve =>
    //         ${page.$nuxtGlobalHandle}.$once('routeChanged', resolve)
    //       ).then(() => new Promise(resolve => setTimeout(resolve, 50)))
    //     `);
    //     await page.evaluate(
    //       ($nuxt, path) => $nuxt.$router.push(path),
    //       page.$nuxt,
    //       path
    //     );
    //     if (waitEnd) {
    //       await hook;
    //     }
    //     return { hook };
    //   },
    //   async go(n, waitEnd = true) {
    //     const hook = page.evaluate(`
    //       new Promise(resolve =>
    //         ${page.$nuxtGlobalHandle}.$once('routeChanged', resolve)
    //       ).then(() => new Promise(resolve => setTimeout(resolve, 50)))
    //     `);
    //     await page.evaluate(($nuxt, n) => $nuxt.$router.go(n), page.$nuxt, n);
    //     if (waitEnd) {
    //       await hook;
    //     }
    //     return { hook };
    //   },
    //   routeData() {
    //     return page.evaluate($nuxt => {
    //       return {
    //         path: $nuxt.$route.path,
    //         query: $nuxt.$route.query
    //       };
    //     }, page.$nuxt);
    //   },
    //   loadingData() {
    //     return page.evaluate($nuxt => $nuxt.$loading.$data, page.$nuxt);
    //   },
    //   errorData() {
    //     return page.evaluate($nuxt => $nuxt.nuxt.err, page.$nuxt);
    //   },
    //   storeState() {
    //     return page.evaluate($nuxt => $nuxt.$store.state, page.$nuxt);
    //   },
    //   transitionsData() {
    //     return page.evaluate($nuxt => $nuxt.nuxt.transitions, page.$nuxt);
    //   }
    // };
    return page;
  }
}
