var am = require('../am.js'),
  assert = require('assert')

describe('setClass()', function() {
  let testClass = class {
      constructor(aa) {
        this.aa = aa || 456
      }
      test24(arg) {
        return this.aa + 1 || 457
      }
      test44() {
        return 44
      }
      mapValues(value) {
        return 2 * value
      }
    },
    classB = class {
      constructor(aa) {
        this.aa = aa || 456
      }
      test24(arg) {
        return 222
      }
    }

  describe('set a reference class for a chain', function() {
    it('should return extended promise resolving to original resolved value and set _state_.class', function(done) {
      let chain = am([123, 456]).setClass(testClass, 456)

      chain
        .map('mapValues')
        .next(r => {
          assert.deepEqual(r, [246, 912])
        })
        .next('test24')
        .next(r => {
          assert.equal(r, 457)
          //done()
        })
        .next('test44')
        .next(r => {
          assert.ok(chain._state_ && chain._state_.class && typeof chain._state_.class === 'object')
          assert.equal(r, 44)
          done()
        })
        .error(err => {
          console.log(24, err)
          assert.fail('', err, '', null)
        })
        .catch(done)
    })
    it('should return extended promise resolving to original resolved value and set _state_.class', function(done) {
      let chain = am([123, 456]).setClass(testClass)

      chain
        .map('mapValues')
        .next(r => {
          assert.deepEqual(r, [246, 912])
        })
        .next('test24')
        .next(r => {
          assert.ok(chain._state_ && chain._state_.class && typeof chain._state_.class === 'object')
          assert.equal(r, 457)
          done()
        })
        .error(err => {
          console.log(24, err)
          assert.fail('', err, '', null)
        })
        .catch(done)
    })
    it('should return extended promise resolving to original resolved value and set _state_.class', function(done) {
      let chain = am([123, 456]).setClass(new testClass(456))

      chain
        .map('mapValues')
        .next(r => {
          assert.deepEqual(r, [246, 912])
        })
        .next('test24')
        .next(r => {
          assert.ok(chain._state_ && chain._state_.class && typeof chain._state_.class === 'object')
          assert.equal(r, 457)
          done()
        })
        .error(err => {
          console.log(24, err)
          assert.fail('', err, '', null)
        })
        .catch(done)
    })
    it('should give precendence to class argument in method call but retain the reference to set Class', function(done) {
      let chain = am([123, 456]).setClass(new testClass(456))

      chain
        .map('mapValues')
        .next(r => {
          assert.deepEqual(r, [246, 912])
        })
        .next('test24', classB)
        .next(r => {
          assert.ok(chain._state_ && chain._state_.class && typeof chain._state_.class === 'object')
          assert.equal(r, 222)
        })
        .next('test44')
        .next(r => {
          assert.ok(chain._state_ && chain._state_.class && typeof chain._state_.class === 'object')
          assert.equal(r, 44)
          done()
        })
        .error(err => {
          console.log(24, err)
          assert.fail('', err, '', null)
        })
        .catch(done)
    })
  })
  describe('.clearClass() clears a reference Class for a chain', function() {
    it('should return extended promise resolving to original resolved value and remove set _state_.class', function(done) {
      let chain = am([123, 456]).setClass(testClass, 456)

      chain
        .map('mapValues')
        .next(r => {
          assert.deepEqual(r, [246, 912])
        })
        .clearClass()

        // a string as an argument returns previous resolved result (like <promise>.then(<string>))
        .next('test24')
        .next(r => {
          assert.deepEqual(r, [246, 912])
          done()
        })

        .error(err => {
          console.log(105, err)
          assert.fail('', err, '', null)
        })
        .catch(done)
    })
  })
})
