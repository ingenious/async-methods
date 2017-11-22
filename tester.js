am = require('./am.js')

am
  .reject({ error: 99 })
  .next(function(r) {
    return r
  })
  .catch(function(err) {
    console.log(10, err)
  })
