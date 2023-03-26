const request = require('request');
const axios = require('axios');
const cheerio = require('cheerio');
const LRU = require('lru-cache');
const display = true;
const cache = new LRU({
  max: 1000,
  maxAge: 1000 * 60 * 60, // 1 hour
});

async function findPathBFS(startActor, endActor, MAX_DEPTH = 2) {
    const visited = new Set();
    const queue = [[startActor, []]];

    while (queue.length > 0) {
        const [current, path] = queue.shift();
        if (display){
            console.log(`Current dequeued link: ${current}`);
        }
        if (current.includes("name/nm") && current === endActor) {
            return [...path, current];
        }
        if (display){
            console.log(`path length ${path.length}`);
        }
        if (path.length >= MAX_DEPTH) {
            continue;
        }

        if (visited.has(current)) {
            continue;
        }

        visited.add(current);

        let response;
        if (cache.has(current)) {
          response = cache.get(current);
        } else {
          try {
            response = await axios.get(current, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
              },
            });
            cache.set(current, response);
          } catch (err) {
            console.log(`Error occurred while fetching the page: ${err}`);
            return [];
          }
        }

        const $ = cheerio.load(response.data);
        const links = $('a');

        for (let i = 0; i < links.length ; i++) {
            const link = $(links[i]);

            const url = link.attr('href');
            if (!url) {
                continue;
            }
            let isTitle = current.includes("title/tt");
            const fullUrl = `https://www.imdb.com${url.split("/").slice(0, 3).join("/")}`;
            if (!((isTitle && fullUrl.includes("name/nm") && url.includes('?ref_=tt_cl_t'))
                || (current.includes("name/nm") && fullUrl.includes("title/tt") && url.includes('?ref_=nm_knf_t')))) {
                continue;
            }
            if (display){
                console.log(`full url: ${fullUrl}`);
            }

            if (isTitle && fullUrl == endActor){
                return [...path, current, fullUrl];
            }

            if (visited.has(fullUrl)) {
                continue;
            }

            

            queue.push([fullUrl, [...path, current]]);
            
        }
    }

    return [];
}



function makeRequest(options) {
    return new Promise((resolve, reject) => {
        request(options, (error, response, body) => {
            if (error) {
                reject(error);
            } else if (response.statusCode !== 200) {
                reject(`Unexpected status code: ${response.statusCode}`);
            } else {
                resolve(body);
            }
        });
    });
}

async function clean_url(url){
    let cleaned = (' ' + url).slice(1);
    if(url.startsWith("www.")){
      cleaned = "https://"+cleaned;
    } else if (url.startsWith("imdb.com")){
      cleaned = "https://www."+cleaned;
    } else if (!url.startsWith("https://")){
      return "";
    }
    cleaned = cleaned.split("/").slice(0, 5).join("/");
    if(!cleaned.includes("https://www.imdb.com/name/nm")){
      return "";
    }
    return cleaned;
  }

async function fast_output() {
    let t0 = performance.now();
    let startUrl = "https://www.imdb.com/name/nm0000168/";
    let endUrl = "https://www.imdb.com/name/nm0000237";
    startUrl = await clean_url(startUrl);
    endUrl = await clean_url(endUrl);
    let result = await findPathBFS(startUrl, endUrl, 10);
    console.log(result);
    let t1 = performance.now();
    console.log(`Time taken: ${(t1 - t0)/1000} seconds`);

    t0 = performance.now();
    result = await findPathBFS("https://www.imdb.com/name/nm0666739/", "https://www.imdb.com/name/nm0001804", 10);
    console.log(result);
    t1 = performance.now();
    console.log(`Time taken: ${(t1 - t0)/1000} seconds`);

    t0 = performance.now();
    result = await findPathBFS("https://www.imdb.com/name/nm0000204/", "https://www.imdb.com/name/nm0000136", 10);
    console.log(result);
    t1 = performance.now();
    console.log(`Time taken: ${(t1 - t0)/1000} seconds`);


}


fast_output();


