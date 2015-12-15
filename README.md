# Scrape Engine
This module retrieves data from the music recommander system last.fm via scraping. It takes metadata as an argument and provides the obtained data to a callback.

## Install

```sh
npm install https://github.com/peermusic/scrape-engine
```

```js
var scrapeEngine = require('scrape-engine')
```
## Usage

```js
var scrapeEngine = require('scrape-Engine')

// Get a list of object, which contains similar artist information and the url 
scrapeEngine.getSimilarArtist('Adele', function (err, list) {
  if (err) {
    console.log('Error: ' + err)
    return
  }
  console.log('list: ' + list)
})

// Get a list of object, which contains similar track information and the url 
scrapeEngine.getSimilarTitel('Rolling in the deep', function (err, list) {
  if (err) {
    console.log('Error: ' + err)
    return
  }
  console.log('list: ' + list)
})

// Get the cover of an album as a base64 encoded JSON
scrapeEngine.getCover('21', 'Adele', function (err, img) {
  if (err) {
    console.log('Error: ' + err)
    return
  }
  console.log(img)
})

```
