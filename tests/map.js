import assert from 'assert'
import am from '../am'

describe('.map()', function() {
  describe('Array synchronous', function() {
    it('should return promise resolving to array of returned values in \n        map function', function(
      done
    ) {
      assert.ok(
        am([5, 6, 7])
          .map(function(item) {
            return item / 2
          })
          .then(r => {
            assert.deepStrictEqual(r, [2.5, 3, 3.5])
            done()
          })
          .catch(err => {
            assert.fail('Promise rejected', err)
          })
          .catch(done) instanceof Promise
      )
    })
  })
  describe('Array asynchronous', function() {
    it('should return promise resolving to array of asynchronously \n        returned values in map generator function', function(
      done
    ) {
      assert.ok(
        am([5, 6, 7])
          .map(function*(item) {
            return yield Promise.resolve(item / 2)
          })
          .then(r => {
            assert.deepStrictEqual(r, [2.5, 3, 3.5])
            done()
          })
          .catch(err => {
            assert.fail('Promise rejected', err)
          })
          .catch(done) instanceof Promise
      )
    })
  })
  describe('Error handling - error passed to catch', function() {
    it('should reject ', done => {
      assert.ok(
        am([5, 6, 7])
          .map(function*(item, i) {
            if (i) {
              throw { error: 57 }
            }
            return yield Promise.resolve(item / 2)
          })
          .then(r => {
            assert.fail()
          })
          .catch(function(err) {
            assert.deepStrictEqual(err, { error: 57 })
            done()
          })
          .catch(done) instanceof Promise
      )
    })
  })

  describe('Error handling - use of tolerant attribute with array', function() {
    it('should resolve with failing items absent', done => {
      assert.ok(
        am([5, 6, 7])
          .map(function*(item, i) {
            if (i) {
              throw { error: 57 }
            }
            return yield Promise.resolve(item / 2)
          }, true)
          .then(r => {
            assert.deepStrictEqual(r, [2.5])
            done()
          })
          .catch(err => {
            assert.fail('Promise rejected', err)
          })
          .catch(done) instanceof Promise
      )
    })
  })
  describe('Error handling - use of tolerant attribute with object', function() {
    it('should resolve with failing items omitted', done => {
      assert.ok(
        am({ a: 2, b: 3 })
          .map(function*(item, attr) {
            if (attr === 'b') {
              throw { error: 57 }
            }
            return yield Promise.resolve(item / 2)
          }, true)
          .then(r => {
            assert.deepStrictEqual(r, { a: 1 })
            done()
          })
          .catch(err => {
            assert.fail('Promise rejected', err)
          })
          .catch(done) instanceof Promise
      )
    })
  })
  describe('Object synchronous', function() {
    it('should return promise resolving to object with returned values in \n        map function', function(
      done
    ) {
      assert.ok(
        am({ a: 123, b: 45 })
          .map(function(value, attr) {
            return value / 2
          })
          .then(r => {
            assert.deepStrictEqual(r, { a: 61.5, b: 22.5 })
            done()
          })
          .catch(err => {
            assert.fail('Promise rejected', err)
          })
          .catch(done) instanceof Promise
      )
    })
  })
  describe('Object asynchronous', function() {
    it('should return promise resolving to object with asynchronously \n        returned values in map generator function', function(
      done
    ) {
      assert.ok(
        am({ a: 123, b: 45 })
          .map(function*(value, attr) {
            return yield Promise.resolve(value / 2)
          })
          .then(r => {
            assert.deepStrictEqual(r, { a: 61.5, b: 22.5 })
            done()
          })
          .catch(err => {
            assert.fail('Promise rejected', err)
          })
          .catch(done) instanceof Promise
      )
    })
  })
})
