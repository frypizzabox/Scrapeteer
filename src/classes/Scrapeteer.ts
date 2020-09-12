import puppeteer from 'puppeteer'
import { selector, extraction } from '../types/selectors'

export class Scrapeteer {
  protected defaultSelector: selector[]
  protected browser: any
  protected page: any

  constructor(querySelector: selector[]) {
    this.defaultSelector = querySelector
  }

  async start(): Promise<void> {
    this.browser = await puppeteer.launch()
  }

  async extractFromUrl(
    url: string,
    selectorList: selector[] = this.defaultSelector
  ): Promise<extraction> {
    const page = await this.browser.newPage()

    await page.setRequestInterception(true)

    page.on('request', (request: any) => {
      if (['image', 'stylesheet', 'font', 'script'].indexOf(request.resourceType()) !== -1) {
        request.abort()
      } else {
        request.continue()
      }
    })

    await page.goto(url)

    try {
      const data = await page.evaluate(
        (selectorList: selector[]) =>
          selectorList.reduce((acc: extraction, selector: selector) => {
            if (!acc.hasOwnProperty(selector.saveAs)) acc[selector.saveAs] = []
            document.querySelectorAll(selector.query).forEach((tag: any) => {
              selector.attrsToFetch.forEach((attr: string) =>
                acc[selector.saveAs].push(tag[attr]?.trim())
              )
            })

            return acc
          }, {}),
        selectorList
      )

      page.close()

      return data
    } catch (e) {
      page.close()

      return e
    }
  }
}
