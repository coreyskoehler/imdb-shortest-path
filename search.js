const cheerio = require('cheerio');
const axios = require('axios');
const LRU = require('lru-cache');

const cache = new LRU({
  max: 1000,
  maxAge: 1000 * 60 * 60, // 1 hour
});

const display_everything = false;
const display = false;
const debug_paths = false;

const size_line = 80;
const start_line = "+".repeat(size_line * 1.25);
const line = "_".repeat(size_line);
const small_line = "~".repeat(size_line / 1.5);

async function findPath(startActor, endActor, depth = 0, MAX_DEPTH = 2, broad_search = false, path = [], visitedName = new Set(), visitedTitle = new Set()) {
  if (display_everything) {
    console.log(`Checking ${startActor.split("/").slice(0, 5).join("/")}, end is ${endActor}, depth is ${depth}`);
    console.log(`Current: ${startActor.split("/").slice(0, 5).join("/")}`);
    console.log(`End: ${startActor.split("/").slice(0, 5).join("/")}`);
  }
  if (startActor)
    if (debug_paths) {
      path.push(startActor);
    }

  if (startActor.includes('/name/') && startActor.split("/").slice(0, 5).join("/") === endActor) {
    if (display) {
      console.log(`${line}`);
      console.log(`Found the final actor: ${endActor}`);
      if (debug_paths) {
        console.log(`${small_line}`);
        console.log(`Final path traveled:`);
        for (url in path) {
          console.log(`${path[url]}`);
        }
        console.log(`${small_line}`);
      }
    }
    return [endActor];
  }
  if (depth >= MAX_DEPTH) {
    if (display_everything) {
      console.log(`Max Depth of ${MAX_DEPTH} reached at ${startActor}`);
    }
    return [];
  }

  // Determine the page type (name or title) based on the URL
  const isNamePage = startActor.includes('/name/');
  const isTitlePage = startActor.includes('/title/');


  let response;
  if (cache.has(startActor)) {
    response = cache.get(startActor);
  } else {
    try {
      response = await axios.get(startActor, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
        },
      });
      cache.set(startActor, response);
    } catch (err) {
      console.log(`Error occurred while fetching the page: ${err}`);
      return [];
    }
  }
  const $ = cheerio.load(response.data);
  const links = $('a');


  if (isNamePage) {
    if (display_everything) {
      console.log(`Added to visited names: ${startActor.split("/").slice(0, 5).join("/")}`);
    }
    visitedName.add(startActor);
  } else if (isTitlePage) {
    if (display) {
      console.log(`New title visited: ${startActor.split("/").slice(0, 5).join("/")}`);
      if (debug_paths) {
        console.log(`${small_line}`);
        console.log(`Path traveled so far:`);
        for (url in path) {
          console.log(`${path[url]}`);
        }
        console.log(`${small_line}`);
      }
    }
    visitedTitle.add(startActor);
  }

  // Loop through each link and follow it recursively, but only check relevant links based on page type
  for (let i = 0; i < links.length; i++) {
    if (debug_paths) {
      var new_path = [...path];
    }
    const link = $(links[i]);
    const url = link.attr('href');
    if (display_everything) {
      const fullUrl = `https://www.imdb.com${url.split("/").slice(0, 3).join("/")}`;
      console.log(`Once started, checking ${`https://www.imdb.com${url.split("/").slice(0, 3).join("/")}`}`);
      console.log(`DUPLICATE FOUND: ${visitedName.has(`https://www.imdb.com${url.split("/").slice(0, 3).join("/")}`)}`);
    }

    if (url) {
      const fullUrl = `https://www.imdb.com${url}`;
      if (isNamePage && url.startsWith('/title/') && (broad_search || url.includes('?ref_=nm_knf_t')) && (!broad_search || url.includes('?ref_=nm_flmg_t')) && !visitedTitle.has(fullUrl)) {
        let result = null;
        if (debug_paths) {
          result = await findPath(fullUrl, endActor, depth + 1, MAX_DEPTH, false, new_path, visitedName, visitedTitle);
        } else {
          result = await findPath(fullUrl, endActor, depth + 1, MAX_DEPTH, false, path, visitedName, visitedTitle);
        }
        if (result.length > 0) {
          return [startActor, ...result];
        }
      } else if (isTitlePage && url.startsWith('/name/') && url.includes('?ref_=tt_cl_t') && !visitedName.has(fullUrl)) {
        let result = null;
        if (debug_paths) {
          result = await findPath(fullUrl, endActor, depth + 1, MAX_DEPTH, false, new_path, visitedName, visitedTitle);
        } else {
          result = await findPath(fullUrl, endActor, depth + 1, MAX_DEPTH, false, path, visitedName, visitedTitle);
        }

        if (result.length > 0) {
          return [startActor, ...result];
        }
      }
    }
  }
  if (display_everything) {
    console.log(`Dead end at ${startActor}`);
  }
  return [];
}

async function clean_url(url) {
  let cleaned = (' ' + url).slice(1);
  if (url.startsWith("www.")) {
    cleaned = "https://" + cleaned;
  } else if (url.startsWith("imdb.com")) {
    cleaned = "https://www." + cleaned;
  } else if (!url.startsWith("https://")) {
    return "";
  }
  cleaned = cleaned.split("/").slice(0, 5).join("/");
  if (!cleaned.includes("https://www.imdb.com/name/nm")) {
    return "";
  }
  return cleaned;
}

async function add_slash(result) {
  for (i in result) {
    result[i] = result[i].concat('/');
  }
  return result;
}

async function output(startActor, endActor) {
  const t0 = performance.now();
  startActor = await clean_url(startActor);
  endActor = await clean_url(endActor);
  if (startActor == "" || endActor == "") {
    return null;
  }
  if (display) {
    console.log(`${start_line}`);
    console.log(`Start actor: ${startActor}`);
    console.log(`End actor: ${endActor}`);
    console.log(`${start_line}`);
  }
  const broad_search = true;
  let result = []

  if (!broad_search) {
    var_depth = 2; // Maximum recursion depth
    result = await findPath(startActor, endActor, 0, var_depth);
    while (result.length == 0) {
      var_depth += 2
      if (display) {
        console.log(`${line}`);
        console.log(`Increasing search size to:  ${var_depth}`);
        console.log(`${line}`);
      }
      result = await findPath(startActor, endActor, 0, var_depth);

    }
    if (display) {
      console.log(`${line}`);
      console.log(`Final List:`);
      for (url in result) {
        console.log(`${result[url]}`);
      }
      console.log(`Clicks Away: ${result.length - 1}`);
      console.log(`${line}`);
    }
    return result;
  } else {
    if (display) {
      console.log(`First search, size 2, no depth`);
      console.log(`${line}`);
    }
    let result = await findPath(startActor, endActor, 0, 2, false);
    if (result.length == 0) {
      if (display) {
        console.log(`${line}`);
        console.log(`Second search, size 2, depth`);
        console.log(`${line}`);
      }
      result = await findPath(startActor, endActor, 0, 2, true);
    }
    if (result.length == 0) {
      if (display) {
        console.log(`${line}`);
        console.log(`Third search, size 4, no depth`);
        console.log(`${line}`);
      }
      result = await findPath(startActor, endActor, 0, 4, false);
    }

    if (result.length == 0) {
      if (display) {
        console.log(`${line}`);
        console.log(`Fourth search, size 4, depth`);
        console.log(`${line}`);
      }
      result = await findPath(startActor, endActor, 0, 4, true);
    }
    if (result.length == 0) {
      if (display) {
        console.log(`${line}`);
        console.log(`Final search, size 6, depth`);
        console.log(`${line}`);
      }
      result = await findPath(startActor, endActor, 0, 6, true);
    }
    if (display) {
      console.log(`${line}`);
      console.log(`Final List:`);
      for (url in result) {
        console.log(`${result[url]}`);
      }
      console.log(`Clicks away: ${result.length - 1}`)
      console.log(`${line}`);
    }
    if (result.length == 0) {
      return null;
    }
    const t1 = performance.now();
    console.log(`${small_line}`);
    console.log(`Runtime: ${(t1 - t0) / 1000} seconds`);
    console.log(`${small_line}`);
    return await add_slash(result);
  }
}
module.exports = { output };