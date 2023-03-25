const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));

// set up EJS as the view engine
app.set('view engine', 'ejs');

// set up a route to render the index page
app.get('/', function(req, res) {
  res.render('index', { output: generate('', '') });
});

// start the server
app.listen(3000, function() {
  console.log('Server listening on port 3000');
});

// function to generate output
function generate(input1, input2) {
  return [
    `Input 1: ${input1}`,
    `Input 2: ${input2}`
  ];
}
