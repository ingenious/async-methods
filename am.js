'use strict';

let am;
class AM extends Promise {
  constructor(fn, context) {
    super(fn);
    this._state_ = context || {};
    this._state_.timer = this._state_.timer || +new Date();
    this._state_.prev = this._state_.prev || null;
  }

  prev() {
    return this._state_.prev;
  }
  next(fn) {
    let self = this,
      newContext = {
        timer: self._state_.timer,
        prev: self
      };
    return AM._chain(self, newContext)(fn,
      function (resolve, reject, fn, result /*, err*/ ) {
        if (!am.isGenerator(fn)) {
          let newResult = fn.apply(self, [result]);

          // if function doesnt return passs through
          if (newResult === undefined) {
            resolve(result);
          } else {
            resolve(newResult);
          }
        } else {
          am.co(fn.apply(self, [result]))
            .then(function (newResult) {

              // if generator doesn't return pass through
              if (newResult === undefined) {
                resolve(result);
              } else {
                resolve(newResult);
              }
            })
            .catch(reject);
        }
      });
  }

  timeout(ms) {
    let self = this;
    return new AM(function (resolve, reject) {
      setTimeout(function () {
        self.then(resolve).catch(reject);
      }, ms);
    }, {
      // pass through context
      timer: self._state_.timer,
      prev: self._state_.prev
    });
  }

  wait(ms) {
    let self = this;
    return new AM(function (resolve, reject) {
      setTimeout(function () {
        self.then(resolve).catch(reject);
      }, ms);
    }, {
      // pass through context
      timer: self._state_.timer,
      prev: self._state_.prev
    });
  }

  mapFilter(fn, tolerant) {
    let self = this,
      mapFilter = true,
      newContext = {
        timer: self._state_.timer,
        prev: self
      };
    return AM._chain(self, newContext)(fn,
      function (resolve, reject, fn, result, err) {
        let attr, i, mapped, newResult;
        if (err) {
          reject(err);
        } else if (!am.isGenerator(fn) && am.isObject(result)) {

          // 1. object in (synchronous)
          mapped = {};
          for (attr in result) {
            try {
              newResult = fn.apply(self, [result[attr], attr, result]);
            } catch (e) {
              if (!tolerant) {
                reject(e);
              }
            }
            if (newResult) {
              mapped[attr] = newResult;
            }
          }
          resolve(mapped);
        } else if (!am.isGenerator(fn) && am.isArray(result)) {

          // 2. array in (synchronous)
          mapped = [];
          for (i = 0; i < result.length; i++) {
            try {
              newResult = fn.apply(self, [result[i], i, result]);
            } catch (e) {
              if (!tolerant) {
                reject(e);
              }
            }
            if (newResult) {
              mapped.push(newResult);
            }
          }
          resolve(mapped);
        } else if (!am.isGenerator(fn)) {

          // 3. other in (synchronous)
          try {
            newResult = fn.apply(self, [result, 0, [result]]);
          } catch (e) {
            if (!tolerant) {
              reject(e);
            }
          }
          mapped = newResult || null;
          resolve(mapped);
        } else if (am.isGenerator(fn) && (am.isArray(result) || am.isObject(result))) {

          // 4,5. object or array in (asynchronous)
          if (result.length || (am.isObject(result) && Object.keys(result).length)) {
            am.filter(result, fn, tolerant, mapFilter).then(function () {
              resolve(result);
            }).catch(reject);
          } else {
            resolve(result);
          }

        } else if (am.isGenerator(fn)) {
          mapped = fn.apply(self, [result, 0, [result]]);

          // 6. other in (asynchronous)
          am(fn.apply(self, [result, 0, [result]]))
            .then(function (newResult) {
              resolve(newResult || null);
            }).catch(function (err) {
              if (!tolerant) {
                reject(err);
              } else {
                resolve(null);
              }
            });
        }
      }
    );
  }

  filter(fn, tolerant) {
    let self = this,
      newContext = {
        timer: self._state_.timer,
        prev: self
      };
    return AM._chain(self, newContext)(fn,
      function (resolve, reject, fn, result, err) {
        let attr, i, mapped, newResult;
        if (err) {
          reject(err);
        } else if (!am.isGenerator(fn) && am.isObject(result)) {

          // 1. object in (synchronous)
          mapped = {};
          for (attr in result) {
            try {
              newResult = fn.apply(self, [result[attr], attr, result]);
            } catch (e) {
              if (!tolerant) {
                reject(e);
              }
            }
            if (newResult) {
              mapped[attr] = result[attr];
            }
          }
          resolve(mapped);
        } else if (!am.isGenerator(fn) && am.isArray(result)) {

          // 2. array in (synchronous)
          mapped = [];
          for (i = 0; i < result.length; i++) {
            try {
              newResult = fn.apply(self, [result[i], i, result]);
            } catch (e) {
              if (!tolerant) {
                reject(e);
              }
            }
            if (newResult) {
              mapped.push(result[i]);
            }
          }
          resolve(mapped);
        } else if (!am.isGenerator(fn)) {

          // 3. other in (synchronous)
          try {
            newResult = fn.apply(self, [result, 0, [result]]);
          } catch (e) {
            if (!tolerant) {
              reject(e);
            }
          }
          mapped = newResult ? result : null;
          resolve(mapped);
        } else if (am.isGenerator(fn) && (am.isArray(result) || am.isObject(result))) {

          // 4,5. object or array in (asynchronous)
          am.filter(result, fn, tolerant).then(function (newResult) {
            resolve(newResult);
          }).catch(reject);

        } else if (am.isGenerator(fn)) {
          mapped = fn.apply(self, [result, 0, [result]]);

          // 6. other in (asynchronous)
          am(fn.apply(self, [result, 0, [result]]))
            .then(function (newResult) {
              resolve(newResult ? result : null);
            }).catch(function (err) {
              if (!tolerant) {
                reject(err);
              } else {
                resolve(null);
              }
            });
        }
      }
    );
  }

  // convert an AM object to a Promise
  promise() {
    let self = this;
    return new Promise(function (resolve, reject) {
      self.then(resolve).catch(reject);
    });
  }
  forEach(fn) {
    let self = this,
      newContext = {
        timer: self._state_.timer,
        prev: self
      };
    return AM._chain(self, newContext)(fn,
      function (resolve, reject, fn, result, err) {
        let attr, i, mapped;
        if (err) {
          reject(err);
        } else if (!am.isGenerator(fn) && am.isObject(result)) {

          // 1. object in (synchronous)
          mapped = {};
          for (attr in result) {
            mapped[attr] = fn.apply(self, [result[attr], attr, result]);
          }
          resolve(result);
        } else if (!am.isGenerator(fn) && am.isArray(result)) {

          // 2. array in (synchronous)
          mapped = [];
          for (i = 0; i < result.length; i++) {
            mapped[i] = fn.apply(self, [result[i], i, result]);
          }
          resolve(result);
        } else if (!am.isGenerator(fn)) {

          // 3. other in (synchronous)
          mapped = fn.apply(self, [result, 0, [result]]);
          resolve(result);
        } else if (am.isGenerator(fn) && am.isObject(result)) {

          // 4. object in (asynchronous)
          mapped = {};
          for (attr in result) {
            mapped[attr] = fn.apply(self, [result[attr], attr, result]);
          }
          am.forEach(mapped).then(function () {
            resolve(result);
          }).catch(reject);

        } else if (am.isGenerator(fn) && am.isArray(result)) {

          // 5. array in (asynchronous)
          mapped = [];
          for (i = 0; i < result.length; i++) {
            mapped[i] = fn.apply(self, [result[i], i, result]);
          }
          am.forEach(mapped).then(function () {
            resolve(result);
          }).catch(reject);

        } else if (am.isGenerator(fn)) {
          mapped = fn.apply(self, [result, 0, [result]]);
          // 6. other in (asynchronous)
          am.forEach(mapped).then(function () {
            resolve(result);
          }).catch(reject);
        }
      }
    );
  }

  map(fn, tolerant) {
    let self = this,
      newContext = {
        timer: self._state_.timer,
        prev: self
      };
    return AM._chain(self, newContext)(fn,
      function (resolve, reject, fn, result, err) {
        let attr, i, mapped;
        if (err) {
          reject(err);
        } else if (!am.isGenerator(fn) && am.isObject(result)) {

          // 1. object in (synchronous)
          mapped = {};
          for (attr in result) {
            mapped[attr] = fn.apply(self, [result[attr], attr, result]);
          }
          resolve(mapped);
        } else if (!am.isGenerator(fn) && am.isArray(result)) {

          // 2. array in (synchronous)
          mapped = [];
          for (i = 0; i < result.length; i++) {
            mapped[i] = fn.apply(self, [result[i], i, result]);
          }
          resolve(mapped);
        } else if (!am.isGenerator(fn)) {

          // 3. other in (synchronous)
          mapped = fn.apply(self, [result, 0, [result]]);
          resolve(mapped);
        } else if (am.isGenerator(fn) && am.isObject(result)) {

          // 4. object in (asynchronous)
          mapped = {};
          for (attr in result) {
            try {
              mapped[attr] = fn.apply(self, [result[attr], attr, result]);
            } catch (e) {
              reject(e);
            }
          }
          am.forEach(mapped, tolerant).then(function (newResult) {
            resolve(newResult);
          }).catch(reject);

        } else if (am.isGenerator(fn) && am.isArray(result)) {

          // 5. array in (asynchronous)
          mapped = [];
          for (i = 0; i < result.length; i++) {
            try {
              mapped[i] = fn.apply(self, [result[i], i, result]);
            } catch (e) {

              reject(e);
            }
          }
          am.forEach(mapped, tolerant)
            .then(function (newResult) {
              resolve(newResult);
            }).catch(reject);

        } else if (am.isGenerator(fn)) {

          try {
            mapped = fn.apply(self, [result, 0, [result]]);
          } catch (e) {
            reject(e);
          }

          // 6. other in (asynchronous)
          am.forEach(mapped, tolerant).then(function (newResult) {
            resolve(newResult);
          }).catch(reject);
        }
      }
    );
  }

  log(label, errorLabel, errorObject) {
    let self = this,
      stack, lineNumber, filepath, file;
    for (var i = 0; i < arguments.length; i++) {
      if (arguments[i] instanceof Error) {
        errorObject = arguments[i];
      }
    }
    if (errorObject) {
      stack = errorObject.stack.split('\n');
      lineNumber = stack[1].split(':')[1];
      filepath = stack[1].split(':')[0].split('/');
      file = filepath.slice(-2).join('/');
    }
    self.then(function (result) {
      if (label) {
        if (lineNumber) {
          console.log(label, ' line ' + lineNumber, ' of ' + file, result);
        } else {
          console.log(label, '[' + (new Date() - self._state_.timer) + 'ms]', result);
        }
      } else {
        console.log(result);
      }
    }).catch(function (err) {
      if (errorLabel) {
        if (lineNumber) {
          console.log(errorLabel, ' line ' + lineNumber, ' of ' + file, ':', err);
        } else {
          console.log(errorLabel, err);
        }
      } else {
        console.log(err);
      }
    });

    // pass through
    return self;
  }

  error(fn) {
    let self = this,
      newContext = {
        timer: self._state_.timer,
        prev: self
      };
    return AM._chain(self, newContext)(fn,
      function (resolve, reject, fn, result, err) {
        let newResult;
        if (err) {
          if (!am.isGenerator(fn)) {
            newResult = fn(err);
            if (newResult === undefined) {

              // pass through if nothing returned
              reject(err);
            } else {
              resolve(newResult);
            }
          } else {
            am(fn(err))
              .then(function (newResult) {

                // pass through if nothing returned
                if (newResult === undefined) {
                  reject(err);
                } else {
                  resolve(newResult);
                }
              }).catch(reject);
          }
        } else {
          resolve(result);
        }
      });
  }
}

AM._chain = function (_am, context) {
  return function (fn, transform) {
    return new AM(function (resolve, reject) {
      _am.then(function (result) {
        try {
          transform(resolve, reject, fn, result, null);
        } catch (e) {
          reject(e);
        }
      }).catch(function (err) {
        try {
          transform(resolve, reject, fn, null, err);
        } catch (e) {
          reject(e);
        }
      });
    }, context || _am._state_);
  };
};

am = function (initial) {
  let self = this,
    args = [];
  for (var i = 1; i < arguments.length; i++) {
    args.push(arguments[i]);
  }
  if (initial instanceof AM) {
    return initial;
  } else if (am.isPromise(initial)) {

    // wrap Promises
    return new AM(function (resolve, reject) {
      initial.then(resolve).catch(reject);
    });
  } else if (am.isGenerator(initial) || am.isNextable(initial)) {

    //wrap generators and iterables
    return am.co(initial);
  } else if (typeof initial === 'function') {

    // wrap functions
    return new AM(function (resolve, reject) {
      args.push(function (err) {
        if (err) {
          reject(err);
        } else {
          let args = [];
          for (var i = 1; i < arguments.length; i++) {
            args.push(arguments[i]);
          }
          resolve(args.length > 1 ? args : args[0]);
        }
      });
      initial.apply(self, args);
    });

  } else {

    // wrap other
    return new AM(function (resolve) {
      resolve(initial);
    });
  }
};
am.resolve = function (value) {
  if (am.isGenerator(value) || value instanceof AM || am.isPromise(value)) {
    return am(value).then(function (result) {
      return new AM(function (resolve) {
        resolve(result);
      });
    });
  } else {
    return new AM(function (resolve) {
      resolve(value);
    });
  }
};
am.reject = function (err) {
  if (am.isGenerator(err) || err instanceof AM || am.isPromise(err)) {
    am(err).catch(function (err) {
      return new AM(function (resolve) {
        resolve(err);
      });
    });
  } else {
    return new AM(function (resolve, reject) {
      reject(err);
    });
  }

};
am.isGenerator = function () {
  return arguments[0] && arguments[0].constructor && arguments[0].constructor.name === 'GeneratorFunction';
};
am.isNextable = function () {
  return arguments[0] && typeof arguments[0] === 'object' && typeof arguments[0].next === 'function';
};
am.isIterable = function () {
  return typeof arguments[0][Symbol.iterator] === 'function';
};
am.isObject = function () {
  return arguments[0] && arguments[0].constructor && arguments[0].constructor.name && arguments[0].constructor.name === 'Object';
};
am.isArray = function () {
  return arguments[0] && Array.isArray(arguments[0]);
};
am.isPromise = function (initial) {
  return initial && initial.constructor && initial.constructor.name === 'Promise';
};
am.co = function () {
  let iterable, self = this,
    args = [];
  for (var i = 1; i < arguments.length; i++) {
    args.push(arguments[i]);
  }
  if (am.isGenerator(arguments[0])) {

    iterable = arguments[0].apply(self, args);
  } else if (am.isNextable(arguments[0])) {

    iterable = arguments[0];
  }
  if (!iterable) {
    return am.apply(self, arguments);
  }
  return new AM(function (resolve, reject) {
    let iterate = function (next) {
      if (next.done) {
        return resolve(next.value);
      }
      try {

        // iterate down in data structure co-wise
        am.all(next.value)
          .then(function (result) {
            iterate(iterable.next(result));
          }).catch(function (err) {
            reject(err);
          });

      } catch (e) {
        reject(e);
      }
    };

    // kick of the iterable iteration
    iterate(iterable.next());
  });
};

am.race = function (initial) {
  let attr, i, list = [],
    response = {};
  if (!am.isObject(initial) && !am.isArray(initial)) {
    return am(initial);
  } else if (am.isArray(initial)) {
    for (i = 0; i < initial.length; i++) {
      list.push(am.all(initial[i]));
    }
    return AM.race(list);
  } else {
    return new AM(function (resolve, reject) {
      for (attr in initial) {
        (function (value, attr) {
          list.push(am.all(value)
            .then(function (result) {
              return am([attr, result]);
            }));
        })(initial[attr], attr);
      }
      AM.race(list).then(function (result) {
        response[result[0]] = result[1];
        resolve(response);
      }).catch(reject);
    });
  }
};

am.parallel = am.all = function (initial) {
  let attr, i, list = [],
    response = {};
  if (initial instanceof AM) {
    return initial;
  } else
  if (!am.isObject(initial) && !am.isArray(initial)) {
    return am(initial);
  } else if (am.isArray(initial)) {
    for (i = 0; i < initial.length; i++) {
      list.push(am.all(initial[i]));
    }
    return AM.all(list);
  } else {
    return new AM(function (resolve, reject) {
      for (attr in initial) {
        (function (value, attr) {
          list.push(am.all(value)
            .then(function (result) {
              response[attr] = result;
            }));
        })(initial[attr], attr);
      }
      AM.all(list).then(function () {
        resolve(response);
      }).catch(reject);
    });
  }
};

// iterate a list of sync and async data object members in sequence
am.forEach = function (initial, tolerant) {
  let keys = [],
    list,
    response,
    iterate = function (_am, index) {
      if (index < keys.length) {
        return _am.then(function (result) {
          response[keys[index]] = result;
          if (index < keys.length - 1) {
            return iterate(am(list[keys[++index]]), index);
          } else {
            return am.resolve(response);
          }
        }).catch(function (err) {
          if (!tolerant) {
            return am.reject(err);
          } else if (index < keys.length - 1) {
            return iterate(am(list[keys[++index]]), index);
          } else {
            return am.resolve(response);
          }
        });
      } else {
        return am.resolve(response);
      }
    };
  if (!am.isObject(initial) && !am.isArray(initial)) {
    return am(initial);
  }
  if (am.isObject(initial)) {
    list = {};
    response = {};
    for (var attr in initial) {
      keys.push(attr);
      list[attr] = initial[attr];
    }
  } else {
    list = [];
    response = [];
    for (var i = 0; i < initial.length; i++) {
      keys.push(i);
      list[i] = initial[i];
    }
  }
  return iterate(am(list[keys[0]]), 0);
};

am.filter = function (initial, fn, tolerant, mapFilter) {
  let keys = [],
    list,
    response,
    iterate = function (_am, index) {
      if (index < keys.length) {
        return _am.then(function (result) {

          // if the result of the async operation returns a truthy response
          // include original element except if mapFilter include new result
          if (result && am.isArray(response)) {
            response.push(mapFilter ? result : initial[keys[index]]);
          } else if (result) {

            // object
            response[keys[index]] = mapFilter ? result : initial[keys[index]];
          }

          // iterate or return until all elements processed
          if (index < keys.length - 1) {
            return iterate(am(fn(list[keys[++index]])), index);
          } else {
            return Promise.resolve(response);
          }
        }).catch(function (err) {

          // if tolerant specified, on error continue iteration to end
          if (!tolerant) {
            return Promise.reject(err);
          } else {
            if (index < keys.length - 1) {
              return iterate(am(fn(list[keys[++index]])), index);
            } else {
              return am.resolve(response);
            }
          }
        });
      } else {
        return am.resolve(response);
      }
    };

  // if not object or array return promise 
  if (!am.isObject(initial) && !am.isArray(initial)) {
    return am(fn(initial)).next(function (newResult) {
      return am(newResult ? (mapFilter ? newResult : initial) : null);
    });
  } else if (am.isObject(initial)) {
    list = {};
    response = {};
    for (var attr in initial) {
      keys.push(attr);
      list[attr] = initial[attr];
    }
  } else {
    list = [];
    response = [];
    for (var i = 0; i < initial.length; i++) {
      keys.push(i);
      list[i] = initial[i];
    }
  }
  if (keys.length) {
    return iterate(am(fn(list[keys[0]])), 0);
  } else {
    return am(initial);
  }
};

// iterate a list of sync and async data object members in sequence
// applying result to each stage
am.waterfall = function (initial) {
  let keys = [],
    self = this,
    list,
    response,
    iterate = function (promise, index) {
      if (index < keys.length) {
        return promise.then(function (result) {
          response[keys[index]] = result;
          if (index < keys.length - 1) {
            ++index;
            if (typeof list[keys[index]] === 'function') {

              // handle array or object of callback functions or generators (apply arguments)
              if (am.isArray(initial)) {
                return iterate(am.apply(self, [list[keys[index]]].concat(response)), index);
              } else {
                return iterate(am.apply(self, [list[keys[index]], response]), index);
              }
            } else {

              // handle structure of non functions
              return iterate(am(list[keys[index]]), index);
            }
          } else {
            return AM.resolve(response);
          }
        }).catch(function (err) {
          return AM.reject(err);
        });
      } else {
        return am.resolve(response);
      }
    };
  if (!am.isObject(initial) && !am.isArray(initial)) {
    return am(initial);
  }
  if (am.isObject(initial)) {
    list = {};
    response = {};
    for (var attr in initial) {
      keys.push(attr);
      list[attr] = initial[attr];
    }
    return iterate(am.apply(self, [list[keys[0]], response]), 0);
  } else {
    list = [];
    response = [];
    for (var i = 0; i < initial.length; i++) {
      keys.push(i);
      list[i] = initial[i];
    }
    return iterate(am(list[keys[0]]), 0);
  }
};

am.fn = function (fn) {
  let self = this,
    args = [];
  for (var i = 1; i < arguments.length; i++) {
    args.push(arguments[i]);
  }
  if (typeof fn === 'function') {
    return am(fn.apply(self, args));
  } else {
    return am(fn);
  }
};

am.sfFn = function (initial) {
  let self = this,
    i = 1,
    args = [];
  for (i; i < arguments.length; i++) {
    args.push(arguments[i]);
  }
  return new AM(function (resolve, reject) {
    args.push(resolve);
    args.push(reject);
    initial.apply(self, args);
  });
};
module.exports = am;