# Scrapeteer

A declarative web scraping library for Node.js, powered by [Puppeteer](https://pptr.dev/).

Define CSS selectors, specify which attributes to extract, and get structured data back — no manual DOM traversal required.

> **Note:** This project was originally built in 2022 and has recently been modernized with updated dependencies and improved type safety. More updates and features are on the way.

## Installation

```bash
npm install scrapeteer
```

## Quick Start

```typescript
import Scrapeteer from 'scrapeteer';

const scraper = new Scrapeteer([
  {
    saveAs: 'titles',
    query: 'h1',
    attrsToFetch: ['innerText'],
  },
]);

const data = await scraper.launch();
const result = await scraper.extractFromUrl('https://example.com');
console.log(result);
// { titles: ['Example Domain'] }

await scraper.close();
```

## How It Works

Scrapeteer uses a **selector configuration** to define what to extract from a page:

```typescript
const selectors = [
  {
    saveAs: 'title',
    query: 'meta[property="og:title"]',
    attrsToFetch: ['content'],
  },
  {
    saveAs: 'images',
    query: 'meta[property="og:image"]',
    attrsToFetch: ['content'],
  },
];
```

Each selector has three properties:

| Property | Description |
|----------|-------------|
| `saveAs` | Key name in the returned object |
| `query` | CSS selector passed to `document.querySelectorAll` |
| `attrsToFetch` | Array of DOM attributes to extract from each matched element |

The extraction flow: **query the DOM** → **read attributes from each match** → **collect into an array under `saveAs`**

## API

### `new Scrapeteer(defaultSelectors?, defaultSkipResources?)`

Create a new instance. Both parameters are optional.

- `defaultSelectors` — array of selector configs used by default in `extractFromUrl`
- `defaultSkipResources` — resource types to block (defaults to `image`, `stylesheet`, `font`, `script` for faster scraping)

### `.launch()`

Starts the headless browser. Must be called before extracting.

### `.extractFromUrl(url, selectors?, skipResources?)`

Extracts data from a URL. Returns an object where each key (defined by `saveAs`) maps to an array of extracted strings.

```typescript
const result = await scraper.extractFromUrl('https://example.com');
// { title: ['Example Domain'], images: [] }
```

Override default selectors or skip resources per-call:

```typescript
const result = await scraper.extractFromUrl(
  'https://example.com',
  customSelectors,
  [Resources.image] // only block images
);
```

### `.setDefaultSelector(selectors)`

Update the default selectors after instantiation.

### `.setDefaultSkipResources(resources?)`

Update which resource types to block.

### `.close()`

Closes the browser instance. Always call this when done to avoid memory leaks.

## Resource Blocking

By default, Scrapeteer blocks unnecessary resources to speed up page loads:

```typescript
import { Resources } from 'scrapeteer';

// Available resources to block:
Resources.image
Resources.stylesheet
Resources.font
Resources.script
```

## Example Output

```json
{
  "title": ["Page Title"],
  "images": [
    "https://example.com/image1.png",
    "https://example.com/image2.png"
  ],
  "author": []
}
```

Empty arrays indicate no data matched that selector's rules.

## Tech Stack

- **TypeScript** with strict mode
- **Puppeteer** 24.x (headless Chromium)
- **Node.js** (CommonJS)

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](https://choosealicense.com/licenses/mit/)
