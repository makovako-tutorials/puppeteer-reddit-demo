"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const reddit_1 = require("./reddit");
const path_1 = require("path");
const dotenv_1 = require("dotenv");
(async () => {
    dotenv_1.config({ path: path_1.resolve(__dirname, "../.env") });
    await reddit_1.self.initialize();
    console.log(`${process.env.REDDIT_USERNAME}`);
    await reddit_1.self.login(process.env.REDDIT_USERNAME, process.env.REDDIT_PASSWORD);
    // let results = await reddit.getResults('node',30)
    // console.log(results.length);
    debugger;
})();
