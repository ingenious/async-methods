var asyncMethods = require('../am.js'),
  am = require('../am-sample-ext.js')
assert = require('assert')

describe('Test extension template using ._extend()', function() {
  describe('extend async-methods', function() {
    it('should add additional methods to ExtendedPromise accepting synchronous function', function(done) {
      am(23)
        .next(function(r) {
          return 67
        })
        .twoPrevious(function(r, prev) {
          assert.equal(r, 67)
          assert.equal(prev, 23)
          done()
        })
    })
    it('should add additional methods to ExtendedPromise accepting generator', function(done) {
      am(23)
        .next(function*(r) {
          return yield 67
        })
        .twoPrevious(function*(r, prev) {
          yield Promise.resolve()
          assert.equal(r, 67)
          assert.equal(prev, 23)
          done()
        })
    })
    it('should add additional methods to ExtendedPromise accepting anonymous class', function(done) {
      am(23)
        .next(
          class {
            constructor(r) {
              return { a: 67 + r }
            }
          }
        )
        .twoPrevious(
          'test',
          class {
            test(lastResult, prev) {
              assert.deepEqual(lastResult, { a: 90 })
              assert.equal(prev, 23)
              done()
            }
          }
        )
        .error(err => {
          assert.fail(err, null, '')
        })
        .catch(done)
    })
  })
  describe('Add static methods to am', function() {
    it('should find additional static method', function(done) {
      am
        .trivial(56)
        .next(r => {
          assert.equal(r, 56)
          done()
        })
        .error(err => {
          assert.fail(err, null, '')
        })
        .catch(done)
    })
  })
})
