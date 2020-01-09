"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const puppeteer_1 = __importDefault(require("puppeteer"));
const SUBREDDIT_URL = (reddit) => `https://old.reddit.com/r/${reddit}`;
exports.self = {
    browser: null,
    page: null,
    initialize: async (reddit) => {
        exports.self.browser = await puppeteer_1.default.launch({
        //   headless: false
        });
        exports.self.page = await exports.self.browser.newPage();
        // Go to subreddit
        await exports.self.page.goto(SUBREDDIT_URL(reddit), { waitUntil: "networkidle0" });
    },
    getResults: async (nr) => {
        let results = [];
        do {
            let new_results = await exports.self.parseResults();
            results = [...results, ...new_results];
            if (results.length < nr) {
                let nextPageBUtton = await exports.self.page.$('span[class="next-button"] > a[rel="nofollow next"]');
                if (nextPageBUtton) {
                    await nextPageBUtton.click();
                    await exports.self.page.waitForNavigation({ waitUntil: "networkidle0" });
                }
                else {
                    break;
                }
            }
        } while (results.length < nr);
        // console.log(results);
        return results.slice(0, nr);
    },
    parseResults: async () => {
        let elements = await exports.self.page.$$('#siteTable > div[class*="thing');
        let results = [];
        for (let element of elements) {
            //   console.log(element);
            let title = await element.$eval('p[class="title"]', node => node.textContent.trim());
            let rank = await element.$eval('span[class="rank"]', node => node.textContent.trim());
            let postTime = await element.$eval('p[class="tagline "] > time', node => node.getAttribute("title"));
            let authorUrl = await element.$eval('p[class="tagline "] > a[class*="author"]', node => node.getAttribute("href"));
            let authorName = await element.$eval('p[class="tagline "] > a[class*="author"]', node => node.textContent.trim());
            let score = await element.$eval('div[class="score likes"', node => node.textContent.trim());
            let comments = await element.$eval('a[data-event-action="comments"]', node => node.textContent.trim());
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
