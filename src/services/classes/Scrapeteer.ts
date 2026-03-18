import puppeteer, { Browser, Page, HTTPRequest } from 'puppeteer';
import { selector, extraction } from '../types';
import { Resources } from '../enums';

export class Scrapeteer {
  protected defaultSelectors: selector[];
  protected defaultSkipResources: Resources[];
  protected browser: Browser | null = null;

  constructor(
    defaultSelectors: selector[] = [],
    defaultSkipResources: Resources[] = [
      Resources.image,
      Resources.stylesheet,
      Resources.font,
      Resources.script,
    ]
  ) {
    this.defaultSelectors = defaultSelectors;
    this.defaultSkipResources = defaultSkipResources;
  }

  setDefaultSelector(defaultSelector: selector[]) {
    this.defaultSelectors = defaultSelector;
  }

  setDefaultSkipResources(
    defaultSkipResources: Resources[] = [
      Resources.image,
      Resources.stylesheet,
      Resources.font,
      Resources.script,
    ]
  ) {
    this.defaultSkipResources = defaultSkipResources;
  }

  /**
   * Initiates Puppeteer
   */
  async launch(): Promise<void> {
    this.browser = await puppeteer.launch();
  }

  /**
   * Closes the browser instance
   */
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  /**
   * Extract data from a URL
   *
   * @param url - The URL to be extracted
   * @param selectors - Rules of how data should be extracted
   * @param skipResources - Page resources to avoid requesting
   */
  async extractFromUrl(
    url: string,
    selectors: selector[] = this.defaultSelectors,
    skipResources: Resources[] = this.defaultSkipResources
  ): Promise<extraction> {
    if (!this.browser) {
      throw new Error('Browser not launched. Call launch() first.');
    }

    // no selectors means nothing will be done
    if (!selectors.length) return {};

    const page: Page = await this.browser.newPage();

    await page.setRequestInterception(true);

    // handles the request abortion of any resource in skipResources
    page.on('request', (request: HTTPRequest) => {
      if (skipResources.includes(request.resourceType() as Resources))
        request.abort();
      else request.continue();
    });

    await page.goto(url);

    let data: extraction = {};
    try {
      // uses evaluate from Puppeteer to inject a function
      data = await page.evaluate(
        (selectorList: selector[]) =>
          // for every selector in the list
          selectorList.reduce((acc: extraction, selector: selector) => {
            // if there's a saveAs creates an empty array
            if (!Object.hasOwn(acc, selector.saveAs)) acc[selector.saveAs] = [];
            // Do a querySelectorAll and for each return...
            document.querySelectorAll(selector.query).forEach((tag) => {
              // ...get every attribute to be fetched...
              selector.attrsToFetch.forEach((attr: string) =>
                // ...stores in the return array as a string
                acc[selector.saveAs].push(
                  ((tag as unknown as Record<string, unknown>)[attr] as string)?.trim()
                )
              );
            });

            return acc;
          }, {}),
        selectors
      );
    } catch (e) {
      data = { error: [String(e)] };
    }

    await page.close();

    return data;
  }
}
