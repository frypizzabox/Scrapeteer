# Scrapeteer

Scrapeteer is a NodeJS library for web-scraping using [Puppeteer](https://www.npmjs.com/package/puppeteer).

## Installation

Use the package manager [npm](https://www.npmjs.com/) to install Scrapeteer.

```bash
npm install scrapeteer
```

## Usage

Scrapeteer will extract data from an web-page using a array of objects where wich one will represent rules of how to fetch and store data in the returning object.

```javascript
import Scrapeteer from 'scrapeter'

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
  await scrapeteer.start()

  const withDefault = await scrapeteer.extractFromUrl('http://amazon.com')
  const withOnRequest = await scrapeteer.extractFromUrl('http://amazon.com', onRequestTagsConfig)

  console.log('With default tags config: ', withDefault)
  console.log('With OnRequest tags config: ', withOnRequest)
})()
```

To prepare Scrapeteer for use is necessary to follow a sequence of steps:

1. Load Scrapeteer Class.
2. Instantiate it. Is possible to set pre-defined tag rules here, but is optional.
3. Call the `async` method `.start()` witch will load puppeteer with pre-defined settings.

### Tags Config:

```javascript
const tagsConfig = [
  {
    saveAs: 'title',
    query: 'meta[name="og:title"], meta[property="og:title"]',
    attrsToFetch: ['content'],
  },
  {
    saveAs: 'image',
    query: 'meta[name="og:image"], meta[property="og:image"]',
    attrsToFetch: ['content'],
  },
]
```

An object with tag rules are defined by three parameters:

1. **saveAs:** A string that represents the key in the returning object.

2. **query:** A string that will be used in a [document.querySelectorAll](https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelectorAll) during the scraping.

3. **attrsToFetch:** A array containing all the attributes to fetch from the html tags resulting from the query.

Scrapeteer will use what's defined in query to fetch html tags, going one by one of the resulting list and get the value from each attribute requested in attrsToFetch. After that it will store everything that was found into an array of strings and save in the resulting object by a key named as the saveAs value.

It goes by the sequence: `Fetch a tag by query -> Get values from Attributes -> Add to resulting object as defined`

You execute the `async` method `.extractFromUrl` to extract the data from a url. An set of tag rules can used as a second parameter witch will be used stead of the default one.

```Javascript
const withDefault = await scrapeteer.extractFromUrl('http://amazon.com') // Goes with default
const withOnRequest = await scrapeteer.extractFromUrl('http://amazon.com', onRequestTagsConfig)
```

The return will be an object with your scraped data. In case of no set of tag rules defined, the return will be a empty object.

```javascript
{
  "title": [
    "Here it comes an result",
    "here it comes another result",
  ],
  "image": [
    "http://imagine_a_image_here.png",
    "http://imagine_another_image_here.png",
    "http://imagine_one_more_image_here.png",
  ],
  "author": [] // empty array means no data was extracted from this set of tag rules
}
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[MIT](https://choosealicense.com/licenses/mit/)
