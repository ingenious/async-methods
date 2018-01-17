// ===================   STANDARD HEADING   =====================
// Comes first
//
let am,
  // asyncMethods = require('async-methods')
  asyncMethods = require('./am.js')

class ExtendedPromise extends asyncMethods.ExtendedPromise {
  constructor(fn, context) {
    super(fn, context)

    let self = this
    this._state_ = context || {}
    this._state_.timer = this._state_.timer || +new Date()
    this._state_.prev = this._state_.prev || null
  }
  // ===============================================================

  // new prototype methods of ExtendedPromise

  // NB preferable not to use async as methods with reurn Promises not ExtendedPromises,
  //  but can use static

  // ===============================================================

  // returns previous 2 results (last and one before) in chain
  twoPrevious(fn) {
    let self = this,
      prev = (self._state_ && self._state_.prev) || null,
      transform,
      newContext = this._state_
    let argsHaveClass = am.argumentsHaveClass(arguments)

    newContext.prev = this
    transform = function(resolve, reject, result, err) {
      let newResult,
        prevExtendedPromises = [self]
      if (prev) {
        prevExtendedPromises.push(prev)
      }
      /* if(newContext.prev._state_ && newContext.prev._state_.prev){
        args.push(newContext.prev)
      }*/
      am.all(prevExtendedPromises).next(function(args) {
        if (argsHaveClass) {
          let newResult
          try {
            newResult = asyncMethods.ExtendedPromise._applyResultToClass(argsHaveClass, args)
            newResult.next(resolve).catch(reject)
          } catch (e) {
            reject(e)
          }
        } else if (typeof fn === 'function') {
          try {
            newResult = fn.apply(self, args)
            am(newResult)
              .next(resolve)
              .error(reject)
          } catch (e) {
            reject(e)
          }
        }
      })
    }

    return asyncMethods.ExtendedPromise._chain(self, newContext)(transform)
  }
}

//
//==========  This line comes between the ExtendedPromise class and any new static methods of am ============
//
// back extend async methods ExtendedPromise class
am = asyncMethods._extend(ExtendedPromise)

// ===========================================================================================================

am.trivial = function() {
  let self = this,
    something = arguments[0] || null

  //  ... do something

  // return ExtendedPromise
  return am(something)
}

module.exports = am
