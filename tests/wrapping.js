import assert from 'assert'
import am from '../am'

describe('Wrapping', function() {
  describe('Generator', function() {
    it('should return extended promise resolving to returned value of generator', function(done) {
      let ep = am(function*() {
        yield Promise.resolve()
        return { a: 23864 }
      })
      assert.ok(ep instanceof am.ExtendedPromise)
      assert.ok(
        ep
          .then(r => {
            assert.deepStrictEqual(r, { a: 23864 })
            done()
          })
          .catch(err => {
            assert.fail('Promise rejected', err)
          })
          .catch(done) instanceof Promise
      )
    })
    it('should return extended promise rejecting to an error occuring in the generator', function(
      done
    ) {
      let ep = am(function*() {
        throw { error: 567 }
        return yield Promise.resolve({ a: 23864 })
      })
      assert.ok(ep instanceof am.ExtendedPromise)
      assert.ok(
        ep.catch(r => {
          assert.deepStrictEqual(r, { error: 567 })
          done()
        }) instanceof Promise
      )
    })
    it('should allow Promise to be yielded in wrapped generator', function(done) {
      am(function*() {
        return yield Promise.resolve({ a: 23864 })
      })
        .then(r => {
          assert.deepStrictEqual(r, { a: 23864 })
          done()
        })
        .catch(err => {
          assert.fail('Promise rejected', err)
        })
        .catch(done)
    })
    it('should allow Generator to be yielded in wrapped generator', function(done) {
      am(function*() {
        return yield function*() {
          return yield Promise.resolve({ a: 23864 })
        }
      })
        .then(r => {
          assert.deepStrictEqual(r, { a: 23864 })
          done()
        })
        .catch(err => {
          assert.fail('Promise rejected', err)
        })
        .catch(done)
    })
    it('should allow function with callback to be yielded in wrapped generator', function(done) {
      am(function*(a, b) {
        return yield function(cb) {
          cb(null, [567, 89])
        }
      })
        .then(r => {
          assert.deepStrictEqual(r, [567, 89])
          done()
        })
        .catch(err => {
          assert.fail('Promise rejected', err)
        })
        .catch(done)
    })
    it('should pass an error returned in callback to the reject value of\n        the returned Promise', function(
      done
    ) {
      am(function*(a, b) {
        return yield function(cb) {
          cb({ error: 78 })
        }
      })
        .then(r => {
          assert.fail()
        })
        .catch(err => {
          assert.deepStrictEqual(err, { error: 78 })
          done()
        })
        .catch(done)
    })
    it('should allow Array of asynchrous oprations to be yielded in\n        wrapped generator', function(
      done
    ) {
      am(function*() {
        return yield [Promise.resolve(567), Promise.resolve(89)]
      })
        .then(r => {
          assert.deepStrictEqual(r, [567, 89])
          done()
        })
        .catch(err => {
          assert.fail('Promise rejected', err)
        })
        .catch(done)
    })
    it('should allow Object of asynchrous oprations to be yielded in \n        wrapped generator', function(
      done
    ) {
      am(function*() {
        return yield {
          a: Promise.resolve(567),
          b: function*() {
            return yield Promise.resolve(89)
          }
        }
      })
        .then(r => {
          assert.deepStrictEqual(r, { a: 567, b: 89 })
          done()
        })
        .catch(err => {
          assert.fail('Promise rejected', err)
        })
        .catch(done)
    })
    it('should allow static entities (boolean, strings etc) to be yielded in \n        wrapped generator', function(
      done
    ) {
      am(function*() {
        return yield true
      })
        .then(r => {
          assert.deepStrictEqual(r, true)

          am(function*() {
            return yield 56789
          })
            .then(r => {
              assert.deepStrictEqual(r, 56789)
              done()
            })
            .catch(function(err) {
              assert.fail('Promise rejected', err)
            })
            .catch(done)
        })
        .catch(err => {
          assert.fail('Promise rejected', err)
        })
        .catch(done)
    })
  })
  describe('Iterator (Invoked Generator)', function() {
    it('should return extended promise resolving to returned value of invoked generator', function(
      done
    ) {
      let ep = am(
        (function*(value) {
          return yield Promise.resolve({ a: value })
        })(23864)
      )
      assert.ok(
        ep
          .then(r => {
            assert.deepStrictEqual(r, { a: 23864 })
            done()
          })
          .catch(err => {
            assert.fail('Promise rejected', err)
          })
          .catch(done) instanceof Promise
      )
    })
    it('should return extended promise rejecting to an error occuring in \n        the invoked generator', function(
      done
    ) {
      let ep = am(
        (function*(value) {
          throw { error: 567 }
          return yield Promise.resolve({ a: value })
        })(23864)
      )
      assert.ok(
        ep
          .catch(r => {
            assert.deepStrictEqual(r, { error: 567 })
            done()
          })
          .catch(done) instanceof Promise
      )
    })
  })
  describe('Array', function() {
    it('should return Promise resolving to an array', function(done) {
      let ep = am([2, 3])
      assert.ok(ep instanceof am.ExtendedPromise)
      assert.ok(
        ep
          .then(r => {
            assert.ok(r instanceof Array)
            assert.deepStrictEqual(r, [2, 3])
            done()
          })
          .catch(err => {
            assert.fail('Promise rejected', err)
          })
          .catch(done) instanceof Promise
      )
    })
  })
  describe('Object', function() {
    it('should return Promise resolving to an object', function(done) {
      let ep = am({ a: 2, b: 3 })
      assert.ok(ep instanceof am.ExtendedPromise)
      assert.ok(
        ep
          .then(r => {
            assert.ok(r instanceof Object)
            assert.deepStrictEqual(r, { a: 2, b: 3 })
            done()
          })
          .catch(err => {
            assert.fail('Promise rejected', err)
          })
          .catch(done) instanceof Promise
      )
    })
  })
  describe('Promise', function() {
    it('should return extended promise resolving or rejecting to resolved or \n        rejected value of wrapped extended promise', function(
      done
    ) {
      let ep = am(Promise.resolve(56789))
      assert.ok(ep instanceof am.ExtendedPromise)
      assert.ok(
        ep
          .then(r => {
            assert.equal(r, 56789)
            assert.ok(
              am(Promise.reject({ error: 56789 })).catch(r => {
                assert.deepStrictEqual(r, { error: 56789 })
                done()
              }) instanceof Promise
            )
          })
          .catch(err => {
            assert.fail('Promise rejected', err)
          })
          .catch(done) instanceof Promise
      )
    })
  })
})
