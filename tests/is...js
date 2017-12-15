var am = require('../am.js'),
  assert = require('assert')

describe('static is... methods', () => {
  describe('isGenerator()', () => {
    it('should  return true or false', done => {
      let test = am.isGenerator([234, 567])
      assert.deepStrictEqual(test, false)
      test = am.isGenerator(function*() {
        yield Promise.resolve()
      })
      assert.deepStrictEqual(test, true)
      done()
    })
  })
  describe('isPromise()', () => {
    it('should  return true or false', done => {
      let test = am.isPromise([234, 567])
      assert.deepStrictEqual(test, false)
      test = am.isPromise(
        new Promise(resolve => {
          resolve()
        })
      )
      assert.deepStrictEqual(test, true)
      done()
    })
  })
  describe('isObject()', () => {
    it('should  return true or false', done => {
      let test = am.isObject([234, 567])
      assert.deepStrictEqual(test, false)
      test = am.isObject({})
      assert.deepStrictEqual(test, true)
      done()
    })
  })
  describe('isArray()', () => {
    it('should  return true or false', done => {
      let test = am.isArray([234, 567])
      assert.deepStrictEqual(test, true)
      test = am.isArray({})
      assert.deepStrictEqual(test, false)
      done()
    })
  })
  describe('isNextable()', () => {
    it('should  return true or false', done => {
      let test = am.isNextable([234, 567])
      assert.deepStrictEqual(test, false)
      test = am.isNextable(
        (function*(a) {
          yield Promise.resolve(a)
        })(47)
      )
      assert.deepStrictEqual(test, true)
      done()
    })
  })
  describe('isIterable()', () => {
    it('should  return true for arrays, arguments and iterators, false for others', done => {
      let test = am.isIterable([234, 567])
      assert.deepStrictEqual(test, true)
      test = am.isIterable(arguments)
      assert.deepStrictEqual(test, true)
      test = am.isIterable(
        (function*(a) {
          yield Promise.resolve(a)
        })(47)
      )
      assert.deepStrictEqual(test, true)
      test = am.isIterable({})
      assert.deepStrictEqual(test, false)
      done()
    })
  })
})