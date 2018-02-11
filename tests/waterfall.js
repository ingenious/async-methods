var am = require('../am.js'),
  assert = require('assert')

describe('.waterfall()', function() {
  describe('Array of async functions', function() {
    it('should return extended promise resolving to array of returned value of async function', function(done) {
      let ep = am.waterfall([
        async function() {
          return await 23864
        },
        async function(first) {
          return await 563728
        },
        async function(first, second) {
          return (await first) + second
        }
      ])
      assert.ok(ep instanceof am.ExtendedPromise)
      assert.ok(
        ep
          .then(r => {
            assert.deepStrictEqual(r, [23864, 563728, 587592])
            done()
          })
          .catch(err => {
            assert.fail('Generator errored', err)
          })
          .catch(done) instanceof Promise
      )
    })

    it('should reject if error occurs in an async fucntion', function(done) {
      let ep = am.waterfall([
        async function() {
          return await 23864
        },
        async function() {
          throw { error: 78 }
          return await 563728
        }
      ])
      assert.ok(ep instanceof am.ExtendedPromise)
      assert.ok(
        ep
          .then(r => {
            assert.fail('Async returned', r)
            done()
          })
          .catch(err => {
            assert.deepStrictEqual(err, { error: 78 })
            done()
          })
          .catch(done) instanceof Promise
      )
    })
  })

  describe('Array of Generators', function() {
    it('should return extended promise resolving to array of returned value of generator', function(done) {
      let ep = am.waterfall([
        function*() {
          return yield 23864
        },
        function*(first) {
          return yield 563728
        },
        function*(first, second) {
          return yield first + second
        }
      ])
      assert.ok(ep instanceof am.ExtendedPromise)
      assert.ok(
        ep
          .then(r => {
            assert.deepStrictEqual(r, [23864, 563728, 587592])
            done()
          })
          .catch(err => {
            assert.fail('Generator errored', err)
          })
          .catch(done) instanceof Promise
      )
    })
    it('should reject if error occurs in a generator', function(done) {
      let ep = am.waterfall([
        function*() {
          return yield 23864
        },
        function*() {
          throw { error: 78 }
          return yield 563728
        }
      ])
      assert.ok(ep instanceof am.ExtendedPromise)
      assert.ok(
        ep
          .then(r => {
            assert.fail('Generator returned', r)
            done()
          })
          .catch(err => {
            assert.deepStrictEqual(err, { error: 78 })
            done()
          })
          .catch(done) instanceof Promise
      )
    })
  })

  describe('Array of Functions with callbacks', function() {
    it('should return extended promise resolving to array of returned values from callbacks', function(done) {
      let ep = am.waterfall([
        function(cb) {
          cb(null, 23864)
        },
        function(first, cb) {
          cb(null, 563728)
        },
        function(first, second, cb) {
          cb(null, first + second)
        }
      ])
      assert.ok(ep instanceof am.ExtendedPromise)
      assert.ok(
        ep
          .then(r => {
            assert.deepStrictEqual(r, [23864, 563728, 587592])
            done()
          })
          .catch(err => {
            assert.fail('Callback returned error', err)
          })
          .catch(done) instanceof Promise
      )
    })
    it('should reject if a callback returns error', function(done) {
      let ep = am.all([
        function(cb) {
          cb(null, 23864)
        },
        function(cb) {
          cb({ error: 45 })
        }
      ])
      assert.ok(ep instanceof am.ExtendedPromise)
      assert.ok(
        ep
          .then(r => {
            assert.fail('callback didn\t error', err)
            done()
          })
          .catch(err => {
            assert.deepStrictEqual(err, { error: 45 })
            done()
          })
          .catch(done) instanceof Promise
      )
    })
  })
  describe('Object Generators', function() {
    it('should return extended promise resolving to object of returned value of generator', function(done) {
      let ep = am.waterfall({
        a: function*() {
          return yield 23864
        },
        b: function*() {
          return yield 563728
        },
        cumulative: function*(result) {
          return yield result
        }
      })
      assert.ok(ep instanceof am.ExtendedPromise)
      assert.ok(
        ep
          .then(r => {
            assert.deepStrictEqual(r, { a: 23864, b: 563728, cumulative: { a: 23864, b: 563728 } })
            done()
          })
          .catch(err => {
            assert.fail('Generator errored', err)
          })
          .catch(done) instanceof Promise
      )
    })
    it('should reject if error occurs in a generator', function(done) {
      let ep = am.waterfall({
        a: function*() {
          return yield 23864
        },
        b: function*() {
          throw { error: 78 }
          return yield 563728
        }
      })
      assert.ok(ep instanceof am.ExtendedPromise)
      assert.ok(
        ep
          .then(r => {
            assert.fail('Generator returned', r)
            done()
          })
          .catch(err => {
            assert.deepStrictEqual(err, { error: 78 })
            done()
          })
          .catch(done) instanceof Promise
      )
    })
  })

  describe('Object of Async Functions', function() {
    it('should return extended promise resolving to object of returned value of fucntion', function(done) {
      let ep = am.waterfall({
        a: async function() {
          return await 23864
        },
        b: async function() {
          return await 563728
        },
        cumulative: async function(result) {
          return await result
        }
      })
      assert.ok(ep instanceof am.ExtendedPromise)

      ep
        .then(r => {
          assert.deepStrictEqual(r, { a: 23864, b: 563728, cumulative: { a: 23864, b: 563728 } })
          done()
        })
        .catch(err => {
          assert.fail('async function errored', err)
        })
        .catch(done)
    })
    it('should reject if error occurs in an async function', function(done) {
      let ep = am.waterfall({
        a: async function() {
          return await 23864
        },
        b: async function() {
          throw { error: 78 }
          return await 563728
        }
      })
      assert.ok(ep instanceof am.ExtendedPromise)
      assert.ok(
        ep
          .then(r => {
            assert.fail('Generator returned', r)
            done()
          })
          .catch(err => {
            assert.deepStrictEqual(err, { error: 78 })
            done()
          })
          .catch(done) instanceof Promise
      )
    })
  })

  describe('Object of Functions with callbacks', function() {
    it('should return extended promise resolving to array of returned values from callbacks', function(done) {
      let ep = am.waterfall({
        a: function(result, cb) {
          cb(null, 23864)
        },
        b: function(result, cb) {
          cb(null, 563728)
        },
        cumulative: function(result, cb) {
          cb(null, 2 * result.a)
        }
      })
      assert.ok(ep instanceof am.ExtendedPromise)
      assert.ok(
        ep
          .then(r => {
            assert.deepStrictEqual(r, { a: 23864, b: 563728, cumulative: 47728 })

            done()
          })
          .catch(err => {
            assert.fail('Callback returned error', err)
          })
          .catch(done) instanceof Promise
      )
    })
    it('should reject if a callback returns error', function(done) {
      let ep = am.waterfall({
        a: function(result, cb) {
          cb(null, 23864)
        },
        b: function(result, cb) {
          cb({ error: 45 })
        }
      })
      assert.ok(ep instanceof am.ExtendedPromise)
      assert.ok(
        ep
          .then(r => {
            assert.fail('callback didn\t error', err)
            done()
          })
          .catch(err => {
            assert.deepStrictEqual(err, { error: 45 })
            done()
          })
          .catch(done) instanceof Promise
      )
    })
  })
})
