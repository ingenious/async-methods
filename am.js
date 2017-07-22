'use strict';

// To come:
// .if(fn,fn) or .if(fn).next() .elseif(fn,fn) or .elseif(fn).next() .else(fn) or .else().next()  .while(fn,fn) or .while(fn).next()
// .do(fn) .. until(fn)  .interval(fn,n)  or interval(n)
// .extend()  .clone()  .repeat(fn,n)  .pickBy()
let AM, am, methods = {},
  co = require('co'),
  amExtensions = {
    sfFn: function (initial) {
      let self = this,
        i = 1,
        args = [];
      for (i; i < arguments.length; i++) {
        args.push(arguments[i]);
      }
      let sfPromise = new Promise(function (resolve, reject) {
        args.push(resolve);
        args.push(reject);
        initial.apply(self, args);
      });
      return new AM(sfPromise);
    },
    reject: function (value) {
      return new AM(Promise.reject(value));
    },
    resolve: function (value) {
      return new AM(Promise.resolve(value));
    },

    waterfall: function (list) {
      let self = this,
        response;
      return new AM(function* () {
        // object
        if (list.constructor && list.constructor.name === 'Object') {
          response = {};
          for (var attr in list) {
            response[attr] = yield co(
              typeof list[attr] === 'function' ?
              am(list[attr].apply(self, [response])) :
              am(list[attr])
            );
          }
        } else {
          response = [];
          // array
          for (var i = 0; i < list.length; i++) {
            response[i] = yield co(
              typeof list[i] === 'function' ?
              am(list[i].apply(self, response)) :
              am(list[i])
            );
          }
        }
        return response;
      });

    },
    all: function (list) {
      if (Array.isArray(list)) {
        list = list.map(function (element) {
          return co(am(element));
        });
      }
      if (list.constructor && list.constructor.name === 'Object') {
        for (var attr in list) {
          list[attr] = co(am(list[attr]));
        }
      }
      return new AM(function* () {
        return yield list;
      });
    }
  },
  amMethods = {
    timeout: function (ms) {
      let amGen = this;
      return methods.chainGenerators.apply(amGen, [function (err, lastResult, resolve) {
        setTimeout(function () {
          amGen.prototype._state_.resolvesTo = lastResult;
          amGen.prototype._state_.index++;

          resolve(lastResult);
        }, ms);
      }]);
    },
    log: function (label, errorLabel) {
      label = (label !== null) ? (label || 'Result: ') : '';
      errorLabel = (label !== null) ? (errorLabel || 'error: ') : '';
      let amGen = this;
      return methods.chainGenerators.apply(amGen, [function (err, lastResult, resolve, reject) {
        if (err) {
          if (errorLabel) {
            console.log(errorLabel, '(' + (+new Date() - amGen.prototype._state_.timer) + 'ms) ', err);
          } else {
            console.log(err);
          }
          amGen.prototype._state_.rejectsWith = err;
          reject(err);
        } else {
          amGen.prototype._state_.resolvesTo = lastResult;
          if (label) {
            console.log(label, '(' + (+new Date() - amGen.prototype._state_.timer) + 'ms) ', lastResult);
          } else {
            console.log(lastResult);
          }
          resolve(lastResult);
        }
      }]);
    },
    co: function () {
      let amGen = this;
      return co(amGen);
    },
    then: function (fn) {
      let amGen = this;
      return co(amGen).then(fn);
    },
    catch: function (fn) {
      let amGen = this;
      return co(amGen).catch(fn);
    },
    error: function (fn) {
      let newResult, amGen = this;
      return methods.chainGenerators.apply(amGen, [function (err, lastResult, resolve, reject) {
        if (lastResult) {

          // don't pass result to function, pass it forward
          amGen.prototype._state_.resolvesTo = lastResult;
          resolve(amGen.prototype._state_.resolvesTo);
        } else {

          // pass err to function or generator
          if (fn.constructor.name !== 'GeneratorFunction') {
            try {
              newResult = fn.apply(amGen, [err]);
              if (newResult !== undefined) {
                amGen.prototype._state_.resolvesTo = newResult;
                resolve(newResult);
              } else {
                amGen.prototype._state_.rejectsWith = err;
                reject(err);
              }
            } catch (err) {
              amGen.prototype._state_.rejectsWith = err;
              reject(err);
            }
          } else {
            co(fn.apply(amGen, [err]))
              .then(function (newResult) {
                if (newResult !== undefined) {
                  amGen.prototype._state_.resolvesTo = newResult;
                  resolve(newResult);
                } else {
                  amGen.prototype._state_.rejectsWith = err;
                  reject(err);
                }
              })
              .catch(function (err) {
                amGen.prototype._state_.rejectsWith = err;
                reject(err);
              });
          }
        }
      }]);
    },
    next: function (fn) {
      let amGen = this;

      return methods.chainGenerators.apply(amGen, [function (err, lastResult, resolve, reject) {
        if (err) {
          amGen.prototype._state_.rejectsWith = err;
          reject(err);

        } else {
          let newResult;

          if (!methods.isGenerator(fn)) {
            try {
              newResult = fn.apply(amGen.prototype._state_, [lastResult]);
              amGen.prototype._state_.resolvesTo = newResult !== undefined ? newResult : lastResult;
              resolve(amGen.prototype._state_.resolvesTo);
            } catch (err) {
              amGen.prototype._state_.rejectsWith = err;
              reject(err);
            }
          } else {
            co(fn.apply(amGen, [lastResult]))
              .then(function (newResult) {
                amGen.prototype._state_.resolvesTo = newResult !== undefined ? newResult : lastResult;
                resolve(amGen.prototype._state_.resolvesTo);
              })
              .catch(function (err) {
                amGen.prototype._state_.rejectsWith = err;
                reject(err);
              });
          }
        }
      }]);
    },
    forEach: function (fn) {
      let amGen = this;
      return methods.chainGenerators.apply(amGen, [function (err, lastResult, resolve, reject) {
        let result, i, attr;
        if (err) {
          amGen.prototype._state_.rejectsWith = err;
          reject(err);
        } else {
          let newResult;
          if (!methods.isGenerator(fn)) {

            // synchronous
            try {
              if (typeof lastResult === 'object' && (lastResult.constructor.name === 'Object')) {

                // object
                newResult = {};
                i = 0;
                for (attr in lastResult) {
                  result = fn.apply(amGen, [lastResult[attr], attr]);
                  newResult[attr] = result === undefined ? result : result;
                }
              } else if (Array.isArray(lastResult)) {

                // array
                newResult = [];
                lastResult.forEach(function (result, i) {
                  let newresult = fn.apply(amGen, [result, i]);
                  newResult[i] = (newresult === undefined) ? result : newresult;
                });
              } else {

                // other
                newResult = fn.apply(amGen, [lastResult, 0, [lastResult]]);
              }
              amGen.prototype._state_.resolvesTo = newResult !== undefined ? newResult : lastResult;
              resolve(amGen.prototype._state_.resolvesTo);
            } catch (err) {
              amGen.prototype._state_.rejectsWith = err;
              reject(err);
            }
          } else {

            // asynchronous
            co(function* () {
              if (typeof lastResult === 'object' && (lastResult.constructor.name === 'Object')) {
                newResult = {};
                i = 0;
                for (attr in lastResult) {
                  result = yield co(fn.apply(amGen, [lastResult[attr], attr]));
                  newResult[attr] = result === undefined ? lastResult[attr] : result;
                }
              } else if (Array.isArray(lastResult)) {
                newResult = [];
                for (i = 0; i < lastResult.length; i++) {
                  result = lastResult[i];
                  let newresult = yield co(fn.apply(amGen, [result, i]));
                  newResult[i] = newresult === undefined ? lastResult[i] : newresult;
                }
              } else {
                newResult = yield co(fn.apply(amGen, [lastResult, 0, [lastResult]]));
              }
              amGen.prototype._state_.resolvesTo = newResult !== undefined ? newResult : lastResult;
              resolve(amGen.prototype._state_.resolvesTo);
            }).catch(function (err) {
              reject(err);
            });
          }
        }
      }]);
    },
    mapFilter: function (fn, tolerant) {
      let amGen = this,
        newResult, result;
      return methods.chainGenerators.apply(amGen, [function (err, lastResult, resolve, reject) {
        let i, attr;
        if (err) {
          amGen.prototype._state_.rejectsWith = err;
          reject(err);
        } else {
          if (!methods.isGenerator(fn)) {

            // synchronous
            try {
              if (typeof lastResult === 'object' && (lastResult.constructor.name === 'Object')) {

                // object
                newResult = {};
                i = 0;
                for (attr in lastResult) {
                  result = fn.apply(amGen, [lastResult[attr], attr, lastResult]);
                  if (result) {
                    newResult[attr] = result;
                  }
                }
              } else if (Array.isArray(lastResult)) {

                // array
                newResult = [];
                lastResult.map(function () {
                  return fn.apply(amGen, arguments);
                }).filter(function (item) {
                  return item ? true : false;
                });
              } else {
                result = fn.apply(amGen, [lastResult, 0, [lastResult]]);
                // other
                if (result) {
                  newResult = result;
                }
              }
              amGen.prototype._state_.resolvesTo = newResult;
              resolve(amGen.prototype._state_.resolvesTo);
            } catch (e) {
              amGen.prototype._state_.rejectsWith = err;
              reject(e);
            }
          } else {

            // asynchronous
            co(function* () {
              if (typeof lastResult === 'object' && (lastResult.constructor.name === 'Object')) {
                newResult = {};
                i = 0;
                for (attr in lastResult) {
                  if (!tolerant) {
                    result = yield co(fn.apply(amGen, [lastResult[attr], attr, lastResult]));
                  } else {
                    result = yield co(fn.apply(amGen, [lastResult[attr], attr, lastResult]))
                      .catch(function () {
                        return false;
                      });
                  }
                  if (result) {
                    newResult[attr] = result;
                  }
                }
              } else if (Array.isArray(lastResult)) {
                newResult = [];
                for (i = 0; i < lastResult.length; i++) {
                  if (!tolerant) {
                    result = yield co(fn.apply(amGen, [lastResult[i], i, lastResult]));
                  } else {

                    result = yield co(fn.apply(amGen, [lastResult[i], i, lastResult]))
                      .catch(function () {
                        return false;
                      });
                  }
                  if (result) {
                    newResult.push(result);
                  }
                }
              } else {
                newResult = null;
                if (!tolerant) {
                  result = yield co(fn.apply(amGen, [lastResult]));
                } else {
                  result = yield co(fn.apply(amGen, [lastResult])).catch(function () {
                    return false;
                  });
                }
                if (result) {
                  newResult = result;
                }
              }
              amGen.prototype._state_.resolvesTo = newResult;
              resolve(amGen.prototype._state_.resolvesTo);
            }).catch(function (err) {
              amGen.prototype._state_.rejectsWith = err;
              reject(err);
            });
          }
        }
      }]);

    },
    filter: function (fn, tolerant) {
      let amGen = this,
        newResult;
      return methods.chainGenerators.apply(amGen, [function (err, lastResult, resolve, reject) {
        let i, attr;
        if (err) {
          amGen.prototype._state_.rejectsWith = err;
          reject(err);
        } else {
          if (!methods.isGenerator(fn)) {

            // synchronous
            try {
              if (typeof lastResult === 'object' && (lastResult.constructor.name === 'Object')) {

                // object
                newResult = {};
                i = 0;
                for (attr in lastResult) {
                  if (fn.apply(amGen, [lastResult[attr], attr, lastResult])) {
                    newResult[attr] = lastResult[attr];
                  }
                }
              } else if (Array.isArray(lastResult)) {

                // array
                newResult = [];
                lastResult.filter(function () {
                  return fn.apply(amGen, arguments);
                });
              } else {
                newResult = null;
                // other
                if (fn.apply(amGen, [lastResult, 0, [lastResult]])) {
                  newResult = lastResult;
                }
              }
              amGen.prototype._state_.resolvesTo = newResult;
              resolve(amGen.prototype._state_.resolvesTo);
            } catch (e) {
              amGen.prototype._state_.rejectsWith = err;
              reject(e);
            }
          } else {

            // asynchronous
            co(function* () {
              if (typeof lastResult === 'object' && (lastResult.constructor.name === 'Object')) {
                newResult = {};
                i = 0;
                for (attr in lastResult) {
                  if (!tolerant) {
                    if (yield co(fn.apply(amGen, [lastResult[attr], attr, lastResult]))) {
                      newResult[attr] = lastResult[attr];
                    }
                  } else {
                    if (yield co(fn.apply(amGen, [lastResult[attr], attr, lastResult])).catch(function () {
                        return false;
                      })) {
                      newResult[attr] = lastResult[attr];
                    }
                  }
                }
              } else if (Array.isArray(lastResult)) {
                newResult = [];
                if (!tolerant) {
                  for (i = 0; i < lastResult.length; i++) {
                    if (yield co(fn.apply(amGen, [lastResult[i], i, lastResult]))) {
                      newResult.push(lastResult[i]);
                    }
                  }
                } else {
                  if (yield co(fn.apply(amGen, [lastResult[i], i, lastResult])).catch(function () {
                      return false;
                    })) {
                    newResult.push(lastResult[i]);
                  }
                }

              } else {
                if (!tolerant) {
                  newResult = yield co(fn.apply(amGen, [lastResult, 0, [lastResult]])) ? lastResult : null;
                } else {
                  newResult = yield co(fn.apply(amGen, [lastResult, 0, [lastResult]])).catch(function () {
                    return false;
                  }) ? lastResult : null;
                }
              }
              amGen.prototype._state_.resolvesTo = newResult;
              resolve(amGen.prototype._state_.resolvesTo);
            }).catch(function (err) {
              amGen.prototype._state_.rejectsWith = err;
              reject(err);
            });
          }
        }
      }]);

    },
    map: function (fn, tolerant) {
      let amGen = this;
      return methods.chainGenerators.apply(amGen, [function (err, lastResult, resolve, reject) {
        let i, attr, newResult;
        if (err) {
          amGen.prototype._state_.rejectsWith = err;
          reject(err);
        } else {
          if (!methods.isGenerator(fn)) {

            // synchronous
            try {
              if (typeof lastResult === 'object' && (lastResult.constructor.name === 'Object')) {

                // object
                newResult = {};
                i = 0;
                for (attr in lastResult) {
                  newResult[attr] = fn.apply(amGen, [lastResult[attr], attr, lastResult]);
                }
              } else if (Array.isArray(lastResult)) {

                // array
                newResult = [];
                lastResult.map(function () {
                  return fn.apply(amGen, arguments);
                });
              } else {

                // other
                newResult = fn.apply(amGen, [lastResult, 0, [lastResult]]);
              }
              amGen.prototype._state_.resolvesTo = newResult;
              resolve(amGen.prototype._state_.resolvesTo);
            } catch (err) {
              amGen.prototype._state_.rejectsWith = err;
              reject(err);
            }
          } else {

            // asynchronous
            co(function* () {
              if (typeof lastResult === 'object' && (lastResult.constructor.name === 'Object')) {
                newResult = {};
                i = 0;
                for (attr in lastResult) {
                  if (!tolerant) {
                    newResult[attr] = yield co(fn.apply(amGen, [lastResult[attr], attr, lastResult]));
                  } else {
                    newResult[attr] = yield co(fn.apply(amGen, [lastResult[attr], attr, lastResult])).catch(function () {
                      return null;
                    });
                  }
                }
              } else if (Array.isArray(lastResult)) {
                newResult = [];
                for (i = 0; i < lastResult.length; i++) {
                  if (!tolerant) {
                    newResult[i] = yield co(fn.apply(amGen, [lastResult[i], i, lastResult]));
                  } else {
                    newResult[i] = yield co(fn.apply(amGen, [lastResult[i], i, lastResult])).catch(function () {
                      return null;
                    });
                  }
                }
              } else {
                if (!tolerant) {
                  newResult = yield co(fn.apply(amGen, [lastResult, 0, [lastResult]]));
                } else {
                  newResult = yield co(fn.apply(amGen, [lastResult, 0, [lastResult]])).catch(function () {
                    return null;
                  });
                }
              }
              amGen.prototype._state_.resolvesTo = newResult;
              resolve(amGen.prototype._state_.resolvesTo);
            }).catch(function (err) {

              amGen.prototype._state_.rejectsWith = err;
              reject(err);
            });
          }
        }
      }]);
    }
  };
methods = {
  isGenerator: function (fn) {
    return fn.constructor && (fn.constructor.name === 'GeneratorFunction');
  },
  chainGenerators: function (cb) {
    let amGen = this,
      _state_ = amGen.prototype._state_,
      chainedPromise = new Promise(function (resolve, reject) {
        co(amGen).then(function (lastResult) {
          cb(null, lastResult, function (result) {
            resolve(result);
          }, function (err) {
            reject(err);
          });
        }).catch(function (err) {
          _state_.rejectsWith = err;
          cb(err, null, function (result) {
            resolve(result);
          }, function (err) {
            reject(err);
          });
        });
      }),
      // prepare generator for any next stage in chain
      nextAmGen = function* () {
        return yield chainedPromise;
      };


    return methods.extendGenerator(nextAmGen, _state_);
  },
  extendGenerator: function (amGen, _state_) {
    amGen.prototype._state_ = _state_;
    if (amGen.constructor.name !== 'GeneratorFunction') {
      console.log('INTERNAL:  not a generator');
    }
    // ADD METHODS
    for (var method in amMethods) {
      amGen[method] = amMethods[method];
    }
    amGen.promise = amGen.co;
    amGen.wait = amGen.timeout;

    return amGen;
  }
};
AM = function (initial, args) {

  // convert various object types to an async-methods-generator
  let amGen, _state_ = this;
  _state_.index = 1;
  _state_.timer = +new Date();

  // Generator
  if (methods.isGenerator(initial)) {

    // An am-generator
    if (initial.prototype._state_) {
      return initial;
    }

    // Other generator
    amGen = initial;

    // Iterator  
  } else if (typeof initial === 'object') {

    if (typeof initial[Symbol.iterator] === 'function') {
      _state_.resolvesTo = [];
      amGen = function* () {
        for (var i in initial) {
          _state_.resolvesTo.push(initial[i]);
        }
        return yield Promise.resolve(_state_.resolvesTo);
      };

    }

    // Promise
    else if (initial.constructor.name === 'Promise') {
      amGen = function* () {
        return yield initial;
      };

      // Array or Object
    } else if (initial.constructor.name === 'Array' || initial.constructor.name === 'Object') {
      _state_.resolvesTo = initial;
      amGen = function* () {
        return yield Promise.resolve(initial);
      };
    }

    // Function with callback
  } else if (initial.constructor.name === 'Function') {
    amGen = function* () {
      return yield(function (cb) {
        args.push(cb);
        initial.apply(_state_, args);
      });
    };

    // Other entity type
  } else {
    amGen = function* () {
      return yield Promise.resolve(initial);
    };
  }
  amGen.prototype._state_ = _state_;
  return methods.extendGenerator(amGen, _state_);
};
am = function (initial) {
  let i = 1,
    args = [];
  for (i; i < arguments.length; i++) {
    args.push(arguments[i]);
  }
  return new AM(initial, args);
};
for (var method in amExtensions) {
  am[method] = amExtensions[method];
}
am.parallel = am.all;
module.exports = am;