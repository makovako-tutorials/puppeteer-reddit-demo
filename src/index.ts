import {self as reddit} from './reddit'
import {resolve} from 'path'
import {config} from "dotenv"


(async () => {
    config({path: resolve(__dirname, "../.env")})


    await reddit.initialize()

    console.log(`${process.env.REDDIT_USERNAME}`);
    

    await reddit.login(process.env.REDDIT_USERNAME as string,process.env.REDDIT_PASSWORD as string)

    // let results = await reddit.getResults('node',30)

    // console.log(results.length);

    debugger;
    

})();