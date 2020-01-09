import puppeteer, { Browser, Page } from "puppeteer";

const SUBREDDIT_URL = (reddit: string) => `https://old.reddit.com/r/${reddit}`;

export const self = {
  browser: (null as unknown) as Browser,
  page: (null as unknown) as Page,
  initialize: async (reddit: string) => {
    self.browser = await puppeteer.launch({
    //   headless: false
    });
    self.page = await self.browser.newPage();

    // Go to subreddit
    await self.page.goto(SUBREDDIT_URL(reddit), { waitUntil: "networkidle0" });
  },

  getResults: async (nr: number) => {
    let results: any[] = [];
    do {
      let new_results = await self.parseResults();
      results = [...results, ...new_results];

      if (results.length < nr) {
        let nextPageBUtton = await self.page.$(
          'span[class="next-button"] > a[rel="nofollow next"]'
        );
        if (nextPageBUtton) {
          await nextPageBUtton.click();
          await self.page.waitForNavigation({ waitUntil: "networkidle0" });
        } else {
          break;
        }
      }
    } while (results.length < nr);
    // console.log(results);

    return results.slice(0, nr);
  },

  parseResults: async () => {
    let elements = await self.page.$$('#siteTable > div[class*="thing');
    let results = [];

    for (let element of elements) {
    //   console.log(element);

      let title = await element.$eval('p[class="title"]', node =>
        node.textContent!.trim()
      );
        let rank = await element.$eval('span[class="rank"]', node =>
          node.textContent!.trim()
        );
      let postTime = await element.$eval('p[class="tagline "] > time', node =>
        node.getAttribute("title")
      );
      let authorUrl = await element.$eval(
        'p[class="tagline "] > a[class*="author"]',
        node => node.getAttribute("href")
      );
      let authorName = await element.$eval(
        'p[class="tagline "] > a[class*="author"]',
        node => node.textContent!.trim()
      );
      let score = await element.$eval('div[class="score likes"', node =>
        node.textContent!.trim()
      );
      let comments = await element.$eval(
        'a[data-event-action="comments"]',
        node => node.textContent!.trim()
      );

      results.push({
        title,
        rank,
        postTime,
        authorUrl,
        authorName,
        score,
        comments
      });
    }
    return results;
  }
};
