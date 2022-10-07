import * as puppeteer from 'puppeteer';
import { selector, extraction } from '../types';
import { Resources } from '../enums';

export class Scrapeteer {
  protected defaultSelectors: selector[];
  protected defaultSkipResources: Resources[];
  protected browser: any;
  protected page: any;

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
   * Extract data from a URL
   *
   * @param url - The URL to be extracted
   * @param selectors - Rules of how data should be extracted
   * @param skipResourcers - Page resources to avoid request
   */
  async extractFromUrl(
    url: string,
    selectors: selector[] = this.defaultSelectors,
    skipResourcers: Resources[] = this.defaultSkipResources
  ): Promise<extraction> {
    // no selectors means nothing will be done
    if (!selectors.length) return {};

    const page = await this.browser.newPage();

    await page.setRequestInterception(true);

    // handles the request abortion of any resource in skipResourcers
    page.on('request', (request: any) => {
      if (skipResourcers.indexOf(request.resourceType()) !== -1)
        request.abort();
      else request.continue();
    });

    await page.goto(url);

    let data = {};
    try {
      // uses evaluate from Puppeteer to inject a function
      data = await page.evaluate(
        (selectorList: selector[]) =>
          // for every selector in the list
          selectorList.reduce((acc: extraction, selector: selector) => {
            // if there's a saveAs creates a empty array
            if (!acc.hasOwnProperty(selector.saveAs)) acc[selector.saveAs] = [];
            // Do a querySelectorAll and for each return...
            document.querySelectorAll(selector.query).forEach((tag: any) => {
              // ...get every attribute to be fetched...
              selector.attrsToFetch.forEach((attr: string) =>
                // ...stores in the return array as a string
                acc[selector.saveAs].push(tag[attr]?.trim())
              );
            });

            return acc;
          }, {}),
        selectors
      );
    } catch (e) {
      data = { e };
    }

    return data;
  }
}
