// License: https://github.com/nuxt/nuxt.js/blob/9831943a1f270069e05bbf1a472804b31ed4b007/LICENSE

import puppeteer, { ConsoleMessage, WaitForOptions } from 'puppeteer-core';
import * as qs from 'querystring';
import ChromeDetector from './chrome';

export interface Page extends puppeteer.Page {
  [x: string]: any;

  html(): Promise<string>;
  $text(selector: string, trim?: boolean): Promise<string>;
  $$text(selector: string, trim?: boolean): Promise<(string | null)[]>;
  $attr(selector: string, attr: string): Promise<string>;
  $$attr(selector: string, attr: string): Promise<(string | null)[]>;
  collectBrowserLog(): { texts: string[]; dispose: Function };
  statusCode?: number;
  shuvi: {
    navigate(path: string, query?: Record<string, any>): Promise<any>;
  };
}

export interface PageOptions extends WaitForOptions {
  disableJavaScript?: boolean;
}

export default class Browser {
  private _detector: any;
  private _browser!: puppeteer.Browser;

  constructor() {
    this._detector = new ChromeDetector();
  }

  async start(options: { baseURL?: string } = {}) {
    // https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#puppeteerlaunchoptions
    const _opts = {
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
      //headless: false,
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

  async page(url?: string, options: PageOptions = {}): Promise<Page> {
    if (!this._browser) {
      throw new Error('Please call start() before page(url)');
    }
    const page = (await this._browser.newPage()) as Page;
    page.setDefaultTimeout(30 * 1000);
    if (url) {
      if (options.disableJavaScript) {
        await page.setJavaScriptEnabled(false);
      } else {
        await page.setJavaScriptEnabled(true);
      }
      const response = await page.goto(url, options);
      page.statusCode = response?.status();
    }
    // await page.waitForFunction(`!!${page.$nuxtGlobalHandle}`);

    page.collectBrowserLog = () => {
      const texts: string[] = [];
      const onLogs = (msg: ConsoleMessage) => {
        texts.push(msg.text());
      };
      page.on('console', onLogs);

      return {
        texts,
        dispose: () => {
          page.off('console', onLogs);
        }
      };
    };
    page.html = () =>
      page.evaluate(() => window.document.documentElement.outerHTML);
    page.$text = (selector: string, trim: boolean) =>
      page.$eval(
        selector,
        (el: { textContent: string | null }, trim: any) => {
          if (el.textContent === null) {
            throw Error('no matching element');
          }

          return trim
            ? el.textContent.replace(/^\s+|\s+$/g, '')
            : el.textContent;
        },
        trim
      );
    page.$$text = (selector: string, trim: boolean) =>
      page.$$eval(
        selector,
        (els: any[], trim: any) =>
          els.map((el: { textContent: string | null }) => {
            if (el.textContent === null) {
              return null;
            }

            return trim
              ? el.textContent.replace(/^\s+|\s+$/g, '')
              : el.textContent;
          }),
        trim
      );
    page.$attr = (selector: string, attr: string) =>
      page.$eval(
        selector,
        (el, attr) => {
          const val = el.getAttribute(attr as string);
          if (val === null) {
            throw Error(`"${el.tagName}" no attr "${attr}"`);
          }
          return val;
        },
        attr
      );
    page.$$attr = (selector: string, attr: string) =>
      page.$$eval(
        selector,
        (els, attr) =>
          els.map((el: { getAttribute: (arg0: string) => any }) =>
            el.getAttribute(attr as string)
          ),
        attr
      );

    const getShuvi = () => page.evaluateHandle('window.__SHUVI');
    page.shuvi = {
      async navigate(path: string, query: Record<string, any> = {}) {
        const $shuvi = await getShuvi();
        if (query) {
          path = path + '?' + qs.stringify(query);
        }
        return page.evaluate(
          ($shuvi: { router: string[] }, path: string) =>
            $shuvi.router.push(path),
          $shuvi,
          path
        );
      }
    };
    return page;
  }
}
