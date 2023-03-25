const request = require('request');
const cheerio = require('cheerio');
//const MAX_DEPTH = 2; // Maximum recursion depth

async function findPath(startActor, endActor, depth = 0, MAX_DEPTH = 2, broad_search = false, visitedName = new Set(), visitedTitle = new Set()) {
  //console.log(`Checking ${startActor.split("/").slice(0, 5).join("/")}, end is ${endActor}, depth is ${depth}`);
  //console.log(`Current: ${startActor.split("/").slice(0, 5).join("/")}`);
  //console.log(`End: ${startActor.split("/").slice(0, 5).join("/")}`);
  if (startActor)
    if (startActor.includes('/name/') && startActor.split("/").slice(0, 5).join("/") === endActor) {
      console.log(`Found ${endActor}`);
      console.log(`!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!`);
      return [endActor];
    }
  if (depth >= MAX_DEPTH) {
    console.log(`Max Depth of ${MAX_DEPTH} reached at ${startActor}`);
    return [];
  }

  // Determine the page type (name or title) based on the URL
  const isNamePage = startActor.includes('/name/');
  const isTitlePage = startActor.includes('/title/');
  //console.log(`isTitlePage: ${isTitlePage}`);
  // Make a request to the start actor's page
  const options = {
    url: startActor,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
    }
  };

  let response;
  try {
    response = await makeRequest(options);
  } catch (err) {
    console.log(`Error occurred while fetching the page: ${err}`);
    return [];
  }
  if (isNamePage) {
    console.log(`add to visited names: ${startActor.split("/").slice(0, 5).join("/")}`);
    visitedName.add(startActor.split("/").slice(0, 5).join("/"));
  } else if (isTitlePage) {
    console.log(`--------------------------------NEW TITLE VISITED!!!!!!!!!!!: ${startActor.split("/").slice(0, 5).join("/")}`);
    visitedTitle.add(startActor.split("/").slice(0, 5).join("/"));
  }
  //console.log(`add to visited: ${startActor.split("/").slice(0, 6).join("/")}`);
  //visitedTitle.add(startActor.split("/").slice(0, 6).join("/"));

  const $ = cheerio.load(response);
  const links = $('a');
  // Loop through each link and follow it recursively, but only check relevant links based on page type
  for (let i = 0; i < links.length; i++) {

    const link = $(links[i]);
    const url = link.attr('href');
    //const fullUrl = `https://www.imdb.com${url.split("/").slice(0, 3).join("/")}`;
    //console.log(`Once started, checking ${`https://www.imdb.com${url.split("/").slice(0, 3).join("/")}`}`);
    //console.log(`DUPLICATE FOUND: ${visitedName.has(`https://www.imdb.com${url.split("/").slice(0, 3).join("/")}`)}`);

    if (url) {

      if (isNamePage && url.startsWith('/title/') && (broad_search || url.includes('?ref_=nm_knf_t')) && (!broad_search || url.includes('?ref_=nm_flmg_t')) && !visitedTitle.has(`https://www.imdb.com${url.split("/").slice(0, 3).join("/")}`)) {
        //if (url.includes('/bio/') || url.includes('/mediaindex/') || url.includes('/videogallery/') || url.includes('/bio?') || url.includes('/?ref')) {
        //  continue; // skip irrelevant links
        //}
        const fullUrl = `https://www.imdb.com${url}`;
        //console.log(`title pathname: ${url.split("/").slice(0, 3).join("/")}`);
        //visitedTitle.add(url.split("/").slice(0, 4).join("/"));

        const result = await findPath(fullUrl, endActor, depth + 1, MAX_DEPTH, false, visitedName, visitedTitle);

        if (result.length > 0) {
          return [startActor, ...result];
        }
      } else if (isTitlePage && url.startsWith('/name/') && url.includes('?ref_=tt_cl_t') && !visitedName.has(`https://www.imdb.com${url.split("/").slice(0, 3).join("/")}`)) {
        //if (url.includes('/bio/') || url.includes('/mediaindex/') || url.includes('/videogallery/') || url.includes('/bio?') || url.includes('/?ref')) {
        //  continue; // skip irrelevant links
        //}
        const fullUrl = `https://www.imdb.com${url}`;
        //console.log(`name pathname: ${url.split("/").slice(0, 3).join("/")}`);
        //visitedName.add(url.split("/").slice(0, 3).join("/"));

        const result = await findPath(fullUrl, endActor, depth + 1, MAX_DEPTH, false, visitedName, visitedTitle);

        if (result.length > 0) {
          return [startActor, ...result];
        }
      }
    }
  }

  console.log(`Dead end at ${startActor}`);
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

async function output(startActor, endActor) {
  //const startActor = 'https://www.imdb.com/name/nm0001570/';
  //const endActor = 'https://www.imdb.com/name/nm0085312';
  startActor = startActor.split("/").slice(0, 5).join("/");
  endActor = endActor.split("/").slice(0, 5).join("/");
  console.log(`Start actor: ${startActor}`);
  console.log(`End actor: ${endActor}`);
  if (!startActor.includes("www.imdb.com/name/nm") || !endActor.includes("www.imdb.com/name/nm")) {
    return ["Invalid input, please input the URLS of two imdb actors."]
  }// else if(startActor.startsWith("www")){

  //}
  const broad_search = true;
  const result = []

  if (!broad_search) {
    var_depth = 2; // Maximum recursion depth
    const result = await findPath(startActor, endActor, 0, var_depth);
    while (result.length == 0) {
      var_depth += 2
      console.log(`-----------------------------------------INCREASING SEARCH SIZE to ${var_depth}--------------------------:`);
      const result = await findPath(startActor, endActor, 0, var_depth);

    }
    console.log(`FINAL LIST: ${result}`);
    console.log(`CLICKS AWAY: ${result.length - 1}`);
    return result;
  } else {
    const result = await findPath(startActor, endActor, 0, 2, false);
    if (result.length == 0) {
      const result = await findPath(startActor, endActor, 0, 4, false);
    }
    if (result.length == 0) {
      const result = await findPath(startActor, endActor, 0, 2, true);
    }
    if (result.length == 0) {
      const result = await findPath(startActor, endActor, 0, 4, true);
    }
    console.log(`FINAL LIST: ${result}`);
    console.log(`CLICKS AWAY: ${result.length - 1}`)
    return result;
  }
}

module.exports = { output };

//output('https://www.imdb.com/name/nm0000168/', 'https://www.imdb.com/name/nm0000237');
