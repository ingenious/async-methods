import assert from 'assert'
import am from '../am'

describe('log()', function() {
  describe('log resolved value', function() {
    it('should return extended promise resolving to original resolved value ', function(done) {
      am([123, 456])
        .log()
        .then(function(r) {
          assert.deepStrictEqual(r, [123, 456])
          done()
        })
        .catch(done)
    })
  })
  describe('log rejected value', function() {
    it('should return extended promise rejecting to original resolved value', function(done) {
      am
        .reject({ error: 234 })
        .log()
        .catch(function(err) {
          assert.deepStrictEqual(err, { error: 234 })
          done()
        })
        .catch(done)
    })
  })
})
