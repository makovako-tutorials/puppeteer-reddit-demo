import {self as reddit} from './reddit'

(async () => {

    await reddit.initialize('node')

    let results = await reddit.getResults(30)

    console.log(results.length);
    

})();