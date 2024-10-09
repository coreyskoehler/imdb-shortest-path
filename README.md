# IMDB Shortest Path

This Node.js web application finds the shortest link between two actors in a game of "IMDB Race". It scrapes IMDB to create chains of connections from one actor to another through shared movie appearances.

## Features

- Web scraping of IMDB using Axios and Cheerio
- Efficient iterative deepening search algorithm for finding the shortest path between actors
- LRU caching for improved performance
- Web interface for easy interaction

## Installation

1. Clone the repository
2. Run `npm install` to install dependencies
3. Start the server with `node app.js`

## Usage

1. Open the web interface in your browser
2. Enter the names of two actors
3. The app will find and display the shortest connection between them

## Project Structure

- `app.js`: Main application file
- `fast-search.js`: Optimized search algorithm
- `search.js`: Core search functionality
- `search.test.js`: Unit tests for search functions
- `public/`: Static assets
- `routes/`: Express route handlers
- `views/`: EJS templates for the web interface

## Technologies

- Node.js
- Express.js
- Axios
- Cheerio
- LRU Cache

## Contributing

Contributions are welcome! Please refer to the `todo.txt` file for planned improvements.

## License

MIT License

Copyright (c) 2024 Corey Koehler

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
