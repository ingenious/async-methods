var am = require('../am.js'),
  join = require('path').join,
  assert = require('assert')

describe('Test adding extensions using .extend()', function() {
  describe('extend async-methods', function() {
    it('should add additional static methods to am and new chainable methods to ExtendedPromise', function(done) {
      am.extend('am-mongo')
      // check new methods revealed
      assert.ok(am.connect)
      assert.ok(am().connect)
      done()
    })
    it('should add additional methods when extension is a filepath and in an array', function(done) {
      am.extend([join(__dirname, '../am-sample-ext.js')])

      // check new methods revealed
      assert.ok(am.trivial)
      assert.ok(am().twoPrevious)
      done()
    })
  })
})
