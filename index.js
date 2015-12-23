var cheerio = require('cheerio')
var got = require('got')

module.exports = ScrapeEngine

function ScrapeEngine () {
  if (!(this instanceof ScrapeEngine)) {
    return new ScrapeEngine()
  }

  this.lastfmURL = 'http://www.last.fm'
  // Two step selection
  // var selection = $('.col-main h2:contains(\'Artist\')').parent()
  // $(selection).find('ol.grid-items .grid-items-item a.link-block-target')
  this.filter = [
    '.col-main  ol.grid-items .grid-items-item a.link-block-target ', // Target: Artist 2step
    '.col-main h2:contains(\'Album\')', // Target: Album 2step
    '.chartlist .chartlist-name a.link-block-target', // Target: Titels
    '.col-main .grid-items-section .grid-items-item-main-text a.link-block-target', // Similar Artist 2Step
    '.col-main .grid-items a.link-block-target', // Similar Artist over "+similar" URL
    // ----------------------------------------------------------------------------//
    '.col-main .grid-items-section .grid-items-item-main-text a.link-block-target', // Similar titels
    '.header-tags a', // Genre: Artist, Titel, Album
    '.col-main .grid-items-section .grid-items-item-main-text a.link-block-target', // Tag: Top Artists 2Step
    '.col-main .grid-items-section .grid-items-item-main-text a.link-block-target', // Tag: Top Albums 2Step
    '.chartlist .chartlist-name a.link-block-target', // Tag: Top Titels
    // ----------------------------------------------------------------------------//
    '.col-main .grid-items-section .grid-items-item-main-text a.link-block-target', // Tag: Artists
    '.album-grid .album-grid-item>a', // Tag: Albums, content: el.find('p').text()
    '.chartlist .chartlist-name a.link-block-target', // Tag: Titel
    '.header-crumb', // Title, Album: Artist
    '.primary-album .metadata-display a', // Title: Album
    // ----------------------------------------------------------------------------//
    'li.tag', // Title: Genre
    '.header-avatar img' // Album: Cover, href: el.attr('src'), content: el.attr('alt')
  ]
}

// Get the cover of an album as a base64 encoded JSON
ScrapeEngine.prototype.getCover = function (album, artist, callback) {
  this.getCoverURL(album, artist, function (err, coverURL) {
    if (err) {
      callback(err, coverURL)
      return
    }

    got(coverURL, {encoding: null}, function (err, data) {
      if (err) {
        callback(err, data)
        return
      }

      var base64 = new Buffer(data, 'binary').toString('base64')
      callback(err, base64)
    })
  })
}

// Get the url of an album cover
ScrapeEngine.prototype.getCoverURL = function (album, artist, callback) {
  var self = this
  this.getURLAlbum(album, function (err, albumURL) {
    if (err) {
      callback(err, albumURL)
      return
    }

    var url = self.lastfmURL + albumURL
    got(url, function (err, html) {
      if (err) {
        callback(err, html)
        return
      }

      var $ = cheerio.load(html)
      var list = $(self.filter[16]).map(function (i, el) {
        el = $(el)
        var img = {
          src: el.attr('src'),
          content: el.attr('alt')
        }
        console.log(img)
        return img
      }).get()
      callback(err, list[0].src)
    })
  })
}

// Get the url of an specific album
ScrapeEngine.prototype.getURLAlbum = function (album, callback) {
  var self = this
  var list = []
  got(this.createQueryURL(null, album), function (err, html) {
    if (err) {
      callback(err, html)
      return
    }

    var $ = cheerio.load(html)
    $(self.filter[1]).parent().find('ol.grid-items .grid-items-item a.link-block-target').map(function (i, el) {
      el = $(el)
      var row = {
        href: el.attr('href'),
        content: el.text()
      }
      console.log(row)
      list.push(row)
    })
    callback(err, list[0].href)
  })
}

// Get a list of object, which contains similar artist information and the url
ScrapeEngine.prototype.getSimilarArtist = function (artist, callback) {
  var self = this
  this.getURLArtist(artist, function (err, artistURL) {
    var url = self.lastfmURL + artistURL + '/+similar'
    console.log(url)
    got(url, function (err, html) {
      if (err) {
        callback(err, html)
        return
      }

      var $ = cheerio.load(html)
      var list = $(self.filter[4]).map(function (i, el) {
        el = $(el)
        var row = {
          href: el.attr('href'),
          content: el.text()
        }
        console.log(row)
        return row
      }).get()
      callback(err, list)
    })
  })
}

// Get the url of a specific artist
ScrapeEngine.prototype.getURLArtist = function (artist, callback) {
  var self = this
  var list = []
  got(this.createQueryURL(artist), function (err, html) {
    if (err) {
      callback(err, html)
      return
    }

    var $ = cheerio.load(html)
    $(self.filter[0]).map(function (i, el) {
      el = $(el)
      var row = {
        href: el.attr('href'),
        content: el.text()
      }
      console.log(row)
      list.push(row)
    })
    callback(err, list[0].href)
  })
}

// Get the metadata of titel
ScrapeEngine.prototype.getMetadata = function (list, result, callback) {
  console.log('Result:' + result)
  console.log('Result.length:' + result.length)
  var self = this
  var url = self.lastfmURL + list[result.length].href
  console.log('URL: ' + url)

  got(url, function(err, html){
    if (err) {
      callback(err, html)
      return
    }
    var $ = cheerio.load(html)
    var metadata = {}

    metadata.artist = $(self.filter[13]).text()
    metadata.album = $(self.filter[14]).text()
    metadata.titel = list[result.length].content
    metadata.genre = $(self.filter[15]).first().text()
    result.push(metadata)
    console.log('Result:' + result)

    if (list.length !== result.length ){
      self.getMetadata(list, result, callback)
    } else {
      callback(err, result)
    }

  })
}

// Get a list of object, which contains similar titel information and the url
ScrapeEngine.prototype.getSimilarTitel = function (titel, callback) {
  var self = this
  var result = []
  this.getURLTitel(titel, function (err, titelURL) {
    if (err) {
      callback(err, titelURL)
      return
    }

    var url = self.lastfmURL + titelURL
    got(url, function (err, html) {
      if (err) {
        callback(err, html)
        return
      }

      var $ = cheerio.load(html)
      var list = $(self.filter[5]).map(function (i, el) {
        el = $(el)
        var row = {
          href: el.attr('href'),
          content: el.text()
        }
        console.log(row)
        return row
      }).get()
      self.getMetadata(list, result, callback)
    })
  })
}

// Get the url of a specific titel
ScrapeEngine.prototype.getURLTitel = function (titel, callback) {
  var self = this
  var list = []
  got(this.createQueryURL(null, null, titel), function (err, html) {
    if (err) {
      callback(err, html)
      return
    }

    var $ = cheerio.load(html)
    $(self.filter[2]).map(function (i, el) {
      el = $(el)
      var row = {
        href: el.attr('href'),
        content: el.text()
      }
      console.log(row)
      list.push(row)
    })
    callback(err, list[0].href)
  })
}

// Creates an query url with the passed metadata
ScrapeEngine.prototype.createQueryURL = function (artist, album, titel) {
  var result = this.lastfmURL + '/search?q='
  for (var i = 0; i < arguments.length; i++) {
    if (arguments[i]) {
      result += encodeURI(arguments[i])
    }
  }
  console.log(result)
  return result
}
