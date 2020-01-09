"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const reddit_1 = require("./reddit");
(async () => {
    await reddit_1.self.initialize('node');
    let results = await reddit_1.self.getResults(30);
    console.log(results.length);
})();
