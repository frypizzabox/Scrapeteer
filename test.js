const Scrapeteer = require('./dist/index').default

const defaultTagsConfig = [
  {
    saveAs: 'title',
    query: 'meta[name="og:title"], meta[property="og:title"]',
    attrsToFetch: ['content'],
  },
]

const onRequestTagsConfig = [
  {
    saveAs: 'title',
    query: 'title',
    attrsToFetch: ['innerHTML'],
  },
  {
    saveAs: 'image',
    query: 'meta[name="og:image"], meta[property="og:image"]',
    attrsToFetch: ['content'],
  },
]

const scrapeteer = new Scrapeteer(defaultTagsConfig)

;(async () => {
  await scrapeteer.launch()

  const withDefault = await scrapeteer.extractFromUrl('http://amazon.com')
  const withOnRequest = await scrapeteer.extractFromUrl('http://amazon.com', onRequestTagsConfig)

  console.log('With default tags config: ', withDefault)
  console.log('With OnRequest tags config: ', withOnRequest)
})()
