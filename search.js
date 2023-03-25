const request = require('request');
const cheerio = require('cheerio');

async function findPath(startActor, endActor, visited = new Set()) {
  console.log(`Checking ${startActor}`);
  if (startActor === endActor) {
    console.log(`Found ${endActor}`);
    return [endActor];
  }

  // Determine the page type (name or title) based on the URL
  const isNamePage = startActor.includes('/name/');
  const isTitlePage = startActor.includes('/title/');

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

  const $ = cheerio.load(response);
  const links = $('a');

  // Loop through each link and follow it recursively, but only check relevant links based on page type
  for (let i = 0; i < links.length; i++) {
    const link = $(links[i]);
    const url = link.attr('href');

    if (url) {
      if (isNamePage && url.startsWith('/title/') && !visited.has(url)) {
        const fullUrl = `https://www.imdb.com${url}`;
        visited.add(url);

        const result = await findPath(fullUrl, endActor, visited);

        if (result.length > 0) {
          return [startActor, ...result];
        }
      } else if (isTitlePage && url.startsWith('/name/') && !visited.has(url)) {
        if (url.includes('/bio/') || url.includes('/mediaindex/') || url.includes('/videogallery/') || url.includes('/bio?') || url.includes('/?ref')) {
          continue; // skip irrelevant links
        }

        const fullUrl = `https://www.imdb.com${url}`;
        visited.add(url);

        const result = await findPath(fullUrl, endActor, visited);

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

const startActor = 'https://www.imdb.com/name/nm0000168/';
const endActor = 'https://www.imdb.com/name/nm0000237/';
findPath(startActor, endActor);
