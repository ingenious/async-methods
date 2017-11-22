import assert from 'assert'
import am from '../am'

describe('.mapFilter()', () => {
  describe('Array synchronous', () => {
    it('should return extended promise resolving to filtered array of returned values in \n        map function', function(
      done
    ) {
      let filtered = am([5, 6, 7]).mapFilter(function(item, i) {
        return item > 5 ? item / 2 : false
      })
      assert.ok(filtered instanceof am.ExtendedPromise)
      assert.ok(
        filtered
          .then(r => {
            assert.deepStrictEqual(r, [3, 3.5])
            done()
          })
          .catch(err => {
            assert.fail('Promise rejected', err)
          })
          .catch(done) instanceof Promise
      )
    })
  })
  describe('Array asynchronous', () => {
    it('should return  extended promise resolving to filtered array of asynchronously \n        returned values in map generator function', function(
      done
    ) {
      let filtered = am([5, 6, 7]).mapFilter(function*(item) {
        return item > 5 ? yield Promise.resolve(item / 2) : false
      })
      assert.ok(filtered instanceof am.ExtendedPromise)
      assert.ok(
        filtered
          .then(r => {
            assert.deepStrictEqual(r, [3, 3.5])
            done()
          })
          .catch(err => {
            assert.fail('Promise rejected', err)
          })
          .catch(done) instanceof Promise
      )
    })
  })
  describe('Error handling - error passed to catch', () => {
    it('should reject ', done => {
      am([5, 6, 7])
        .mapFilter(function*(item, i) {
          if (item === 6) {
            throw { error: 57 }
          }
          return yield Promise.resolve(item / 2)
        })
        .then(r => {
          console.log(57, r)
          assert.fail()
        })
        .catch(function(err) {
          assert.deepStrictEqual(err, { error: 57 })
          done()
        })
        .catch(done)
    })
  })

  describe('Error handling - use of tolerant attribute with array', () => {
    it('should resolve with null item values', done => {
      am([5, 6, 7])
        .mapFilter(function*(item, i) {
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
        .catch(done)
    })
  })
  describe('Error handling - use of tolerant attribute with object', () => {
    it('should resolve with null item values', done => {
      am({ a: 2, b: 3 })
        .mapFilter(function*(item, attr) {
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
        .catch(done)
    })
  })
  describe('Object synchronous', () => {
    it('should return extended promise resolving to object with returned values in \n        map function', function(
      done
    ) {
      am({ a: 123, b: 45 })
        .mapFilter(function(value, attr) {
          return attr === 'a' ? value / 2 : false
        })
        .then(r => {
          assert.deepStrictEqual(r, { a: 61.5 })
          done()
        })
        .catch(err => {
          assert.fail('Promise rejected', err)
        })
        .catch(done)
    })
  })
  describe('Object asynchronous', () => {
    it('should return extended promise resolving to object with asynchronously \n        returned values in map generator function', function(
      done
    ) {
      am({ a: 123, b: 45 })
        .mapFilter(function*(value, attr) {
          return attr === 'a' ? yield Promise.resolve(value / 2) : false
        })
        .then(r => {
          assert.deepStrictEqual(r, { a: 61.5 })
          done()
        })
        .catch(err => {
          assert.fail('Promise rejected', err)
        })
        .catch(done)
    })
  })
})
