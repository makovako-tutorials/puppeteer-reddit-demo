import puppeteer, { Browser, Page } from "puppeteer";
import prompt from 'prompt-sync'




const REDDIT_URL = `https://old.reddit.com/`;
const SUBREDDIT_URL = (reddit: string) => `https://old.reddit.com/r/${reddit}`;

export const self = {
  browser: (null as unknown) as Browser,
  page: (null as unknown) as Page,
  initialize: async () => {
    self.browser = await puppeteer.launch({
      headless: false
    });
    self.page = await self.browser.newPage();

    
  },

  login: async(username: string, password: string) => {
    console.log('Here');
    
    await self.page.goto(REDDIT_URL, { waitUntil: "networkidle0" });
    
    // write in the username and paddword

    await self.page.type('input[name="user"]', username, {delay: 30});
    await self.page.type('input[name="passwd"]', password, {delay: 30});

    // click on the login

    await self.page.click('#login_login-main > div.submit > button');

    // wait till any of given selectors exist, either logout or error

    try  {
      await self.page.waitFor('form[id="login_otp"]',{timeout: 5000})
  
      let otp = prompt()('OTP code :')
  
      await self.page.type('input[name="otp"]',otp, {delay: 30});
      
      await self.page.click('#login_otp > div.tfa-login-bottom-panel > div.c-submit-group > button.btn.c-btn.c-btn-primary.tfa-login-submit')

    } catch(error) {
      // no otp screen, continue in logging in
    }


    await self.page.waitFor('form[action="https://old.reddit.com/logout"],div[class="status error"]');
    
    // check if any error
    let error = await self.page.$('div[class="status error"]')

    if (error) {
      let errorMessage = await (await error.getProperty('innerText')).jsonValue();
      console.log(`${username} failed to logi in`);
      console.log(`Error from the website: ${errorMessage}`);
      process.exit(1)
    } else {
      console.log(`${username} user now logged in`);
      
    }




  },

  getResults: async (reddit: string, nr: number) => {
    // Go to subreddit
    await self.page.goto(SUBREDDIT_URL(reddit), { waitUntil: "networkidle0" });

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
