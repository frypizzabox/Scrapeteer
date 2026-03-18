import * as puppeteer from 'puppeteer'
import { selector, extraction } from '../types'
import { Resources } from '../enums'

export class Scrapeteer {
  protected defaultSelector: selector[]
  protected notLoad: Resources[]
  protected browser: any
  protected page: any

  constructor(
    querySelector: selector[] = [],
    notLoad: Resources[] = [Resources.image, Resources.stylesheet, Resources.font, Resources.script]
  ) {
    this.defaultSelector = querySelector
    this.notLoad = notLoad
  }

  async launch(): Promise<void> {
    this.browser = await puppeteer.launch()
  }

  setDefaultSelector(defaultSelector: selector[]) {
    this.defaultSelector = defaultSelector
  }

  async extractFromUrl(
    url: string,
    selectorList: selector[] = this.defaultSelector
  ): Promise<extraction> {
    if (!selectorList.length) return {}

    const page = await this.browser.newPage()

    await page.setRequestInterception(true)

    page.on('request', (request: any) => {
      if (this.notLoad.indexOf(request.resourceType()) !== -1) request.abort()
      else request.continue()
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
