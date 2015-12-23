var engine = require('../index.js')
engine = engine()

engine.getSimilarArtist('Adele', function (err, list) {
  if (err) {
    console.log('Error: ' + err)
    return
  }

  console.log('list: ' + list)
})

engine.getSimilarTitle('Rolling in the deep', function (err, list) {
  if (err) {
    console.log('Error: ' + err)
    return
  }

  console.log('list: ' + list)
})

engine.getCoverURL('21', 'Adele', function (err, img) {
  if (err) {
    console.log('Error: ' + err)
    return
  }

  console.log('list: ' + img)
})

engine.getCover('21', 'Adele', function (err, img) {
  if (err) {
    console.log('Error: ' + err)
    return
  }

  console.log(img)
})
