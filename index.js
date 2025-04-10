require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

// Middleware to parse incoming POST request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use('/public', express.static(`${process.cwd()}/public`));

// Serve the front-end HTML
app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});


// ---------------------------
// URL Shortener Functionality
// ---------------------------

// In-memory store for URLs
let urlDatabase = {};
let counter = 1;

// POST route to receive a URL and return a short version
app.post('/api/shorturl', function (req, res) {
  const originalUrl = req.body.url;

  try {
    // Validate basic format
    const urlObj = new URL(originalUrl);
    const hostname = urlObj.hostname;

    // DNS lookup to verify domain exists
    dns.lookup(hostname, (err) => {
      if (err) {
        return res.json({ error: 'invalid url' });
      }

      // Save to database
      const shortUrl = counter++;
      urlDatabase[shortUrl] = originalUrl;

      res.json({
        original_url: originalUrl,
        short_url: shortUrl
      });
    });
  } catch (error) {
    // Invalid URL format
    res.json({ error: 'invalid url' });
  }
});

// GET route to redirect to original URL
app.get('/api/shorturl/:shortUrl', function (req, res) {
  const shortUrl = req.params.shortUrl;
  const originalUrl = urlDatabase[shortUrl];

  if (!originalUrl) {
    return res.json({ error: 'invalid url' });
  }

  res.redirect(originalUrl);
});

// Start the server
app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
