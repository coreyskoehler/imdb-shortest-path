const express = require('express');
const bodyParser = require('body-parser');
const search = require('./search');
const path = require('path');
const mime = require('mime');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// Set the MIME type for CSS files
app.use('/styles.css', (req, res, next) => {
  res.setHeader('Content-Type', mime.getType('css'));
  next();
});

// Serve static files from the public folder
app.use(express.static(path.join(__dirname, 'public')));


app.get('/', (req, res) => {
  res.render('index', { results: null });
});

app.post('/', async (req, res) => {
  const url1 = req.body.url1;
  const url2 = req.body.url2;
  const results = await search.output(url1, url2);
  //const results = await search.output('https://www.imdb.com/name/nm0000168/', 'https://www.imdb.com/name/nm0000237');
  res.render('index', { results });
});

app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});

// const results = output('https://www.imdb.com/name/nm0000168/', 'https://www.imdb.com/name/nm0000237'); // assuming the output function is defined in search.js
