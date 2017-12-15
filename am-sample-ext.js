// ===================   STANDARD HEADING   =====================
// Comes first
//
let am,
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

  // (NB don't use async, but can use static)

  // ===============================================================

  connect(url, database) {
    let self = this,
      dbValue,
      clientValue,
      transform = function(resolve, reject, result, err) {
        MongoClient.connect(url).then(function(client) {
          let db
          if (client.constructor.name === 'MongoClient') {
            db = client.db(database)
          } else {
            db = client
          }
          dbValue = db
          clientValue = client
          resolve(db)
        })
      }
    newContext = this._state_

    // _state_ properties can be functions as well as values or back pointers
    // this allows values to be set after the previous ExtendedPromise has resolved
    // otherwise newContext (this._state_ of the returned ExtendedPromise) properties are normally set before the previous promise has resolved

    newContext.db = function() {
      return dbValue
    }
    newContext.client = function() {
      return clientValue
    }
    newContext.prev = this
    return am.ExtendedPromise._chain(self, newContext)(transform)
  }

  collection(collectionName) {
    let self = this,
      transform,
      newContext = this._state_,
      chain = am.ExtendedPromise._chain
    newContext.prev = this

    // a transform function in the chain is passed 4 arguments -
    // resolve and reject determine what is resolved or rejected by the ExtendedPromise
    // self is the previous ExtendedPromise in the chain that calls the method
    // newContext is the value of this._state_ of the returned ExtendedPromise
    // _state_ property is used to persist data such as start time and previous-states chain through the chain of operations
    // NB.  _state_ should be preserved by all extension methods to ensure that all core methods still work correctly in the chain

    transform = function(resolve, reject, result, err) {
      let db = self._state_ && self._state_.db ? self._state_.db() : null
      self._state_.prev = self
      if (!db) {
        reject('Database not connected')
      }
      resolve(db.collection(collectionName))
    }

    // returns ExtendedPromise with this_state_ set correctly after previous promise is resolved
    return chain(self, newContext)(transform)
  }
}

//
//==========  This line comes between the ExtendedPromise class and any new static methods of am ============
//
// back extend async methods ExtendedPromise class
am = asyncMethods._extend(ExtendedPromise)

// ===========================================================================================================

am.sample = function() {
  let self = this,
    something
  //  ... do something

  // return ExtendedPromise
  return am(something)
}

module.exports = am
