'use strict'

let am

class ExtendedPromise extends Promise {
  constructor(fn, context = {}) {
    super(fn)

    this._state_ = context || this._state_
    this._state_.timer = context.timer || this._state_.timer || +new Date()
    this._state_.prev = context.prev || this._state_.prev || null
  }

  prev() {
    let self = this
    // prevent unhandled Promise error
    self.error(err => {})
    return this._state_.prev || this
  }

  next(fn) {
    let self = this,
      argsHaveClass = am.argumentsHaveClass.apply(self, [arguments]),
      newContext = {}

    for (var attr in self._state_) {
      newContext[attr] = self._state_[attr]
    }
    newContext.prev = self

    return am.ExtendedPromise._chain(self, newContext)(function(resolve, reject, result, err) {
      if (err) {
        reject(err)
      } else {
        // synchronous step
        if (!argsHaveClass && typeof fn === 'function' && !am.isGenerator(fn)) {
          let newResult = fn.apply(self, [result])

          // if function doesnt return passs through
          if (newResult === undefined) {
            resolve(result)
          } else {
            resolve(newResult)
          }
        } else if (am.isGenerator(fn)) {
          // generator - asunchronous step
          am(fn.apply(self, [result]))
            .next(function(newResult) {
              // if generator doesn't return pass through
              if (newResult === undefined) {
                resolve(result)
              } else {
                resolve(newResult)
              }
            })
            .error(reject)
        } else if (argsHaveClass) {
          let newResult,
            args = [result]
          if (argsHaveClass.args) {
            // prepend any arguments added in method arguments to resolved value from previous step(s) in chain
            args = argsHaveClass.args.concat([result])
          }
          try {
            newResult = ExtendedPromise._applyResultToClass(argsHaveClass, args)

              // in case newResult is Promise
              //am(newResult)
              .next(resolve)
              .catch(reject)
          } catch (e) {
            reject(e)
          }
        } else {
          // if next passed anything other than function of generator function
          // mirrors behaviour of then()
          resolve(result)
        }
      }
    })
  }

  timeout(ms) {
    let self = this
    return am(
      new am.ExtendedPromise(
        function(resolve, reject) {
          setTimeout(function() {
            self.next(resolve).error(reject)
          }, ms)
        },
        {
          // pass through context
          timer: self._state_.timer,
          prev: self._state_.prev
        }
      )
    )
  }

  wait(ms) {
    let self = this

    // pass through context
    return am(
      new am.ExtendedPromise(function(resolve, reject) {
        setTimeout(function() {
          self.next(resolve).error(reject)
        }, ms)
      }, self._state_)
    )
  }

  mapFilter(fn, tolerant) {
    let self = this,
      argsHaveClass = am.argumentsHaveClass.apply(self, [arguments]),
      applyResultToClass = am.ExtendedPromise._applyResultToClass,
      mapFilter = true,
      newContext = {},
      args
    for (var attr in self._state_) {
      newContext[attr] = self._state_[attr]
    }
    newContext.prev = self
    return am.ExtendedPromise._chain(self, newContext)(function(resolve, reject, result, err) {
      let attr, i, mapped, newResult
      if (err) {
        reject(err)
      } else if (argsHaveClass && !am.isArray(result) && !am.isObject(result)) {
        //non-object/array applied to class (synchronous/asynchronous)
        args = [result]
        if (argsHaveClass.args) {
          // prepend any arguments added in method arguments to resolved value from previous step(s) in chain
          args = argsHaveClass.args.concat([result])
        }
        applyResultToClass(argsHaveClass, args)
          .next(resolve)
          .catch(reject)
      } else if (!argsHaveClass && !am.isGenerator(fn) && am.isObject(result)) {
        // 1. object applied to function (synchronous)
        mapped = {}
        for (attr in result) {
          try {
            newResult = fn.apply(self, [result[attr], attr, result])
          } catch (e) {
            if (!tolerant) {
              reject(e)
            }
          }
          if (newResult) {
            mapped[attr] = newResult
          }
        }
        resolve(mapped)
      } else if (!argsHaveClass && !am.isGenerator(fn) && am.isArray(result)) {
        // 2. array applied to  function
        mapped = []
        for (i = 0; i < result.length; i++) {
          try {
            newResult = fn.apply(self, [result[i], i, result])
          } catch (e) {
            if (!tolerant) {
              reject(e)
            }
          }
          if (newResult) {
            mapped.push(newResult)
          }
        }
        resolve(mapped)
      } else if (!argsHaveClass && !am.isGenerator(fn)) {
        // 3. non-array/object applied to function
        try {
          newResult = fn.apply(self, [result, 0, [result]])
        } catch (e) {
          if (!tolerant) {
            reject(e)
          }
        }
        mapped = newResult || null
        resolve(mapped)
      } else if (
        (argsHaveClass || am.isGenerator(fn)) &&
        (am.isArray(result) || am.isObject(result))
      ) {
        // 4,5. object or array applied to generator or class
        if (result.length || (am.isObject(result) && Object.keys(result).length)) {
          am
            .filter(result, argsHaveClass || fn, tolerant, mapFilter)
            .next(function(newResult) {
              resolve(newResult)
            })
            .error(reject)
        } else {
          resolve(result)
        }
      } else if (am.isGenerator(fn)) {
        mapped = fn.apply(self, [result, 0, [result]])

        // 6. non-array/generator applied to generator
        am(fn.apply(self, [result, 0, [result]]))
          .next(function(newResult) {
            resolve(newResult || null)
          })
          .error(function(err) {
            if (!tolerant) {
              reject(err)
            } else {
              resolve(null)
            }
          })
      }
    })
  }

  filter(fn, tolerant) {
    let self = this,
      argsHaveClass = am.argumentsHaveClass.apply(self, [arguments]),
      applyResultToClass = am.ExtendedPromise._applyResultToClass,
      newContext = {}
    for (var attr in self._state_) {
      newContext[attr] = self._state_[attr]
    }
    newContext.prev = self
    return am.ExtendedPromise._chain(self, newContext)(function(resolve, reject, result, err) {
      let attr, i, mapped, newResult
      if (err) {
        reject(err)
      } else if (argsHaveClass && !am.isArray(result) && !am.isObject(result)) {
        applyResultToClass(argsHaveClass, [result])
          .next(function(newResult) {
            resolve(newResult ? result : null)
          })
          .error(reject)
      } else if (!argsHaveClass && !am.isGenerator(fn) && am.isObject(result)) {
        // 1. object in (synchronous)
        mapped = {}
        for (attr in result) {
          try {
            newResult = fn.apply(self, [result[attr], attr, result])
          } catch (e) {
            if (!tolerant) {
              reject(e)
            }
          }
          if (newResult) {
            mapped[attr] = result[attr]
          }
        }
        resolve(mapped)
      } else if (!argsHaveClass && !am.isGenerator(fn) && am.isArray(result)) {
        // 2. array in (synchronous)
        mapped = []
        for (i = 0; i < result.length; i++) {
          try {
            newResult = fn.apply(self, [result[i], i, result])
          } catch (e) {
            if (!tolerant) {
              reject(e)
            }
          }
          if (newResult) {
            mapped.push(result[i])
          }
        }
        resolve(mapped)
      } else if (!argsHaveClass && !am.isGenerator(fn)) {
        // 3. non array/object in gnerator (synchronous)
        try {
          newResult = fn.apply(self, [result, 0, [result]])
        } catch (e) {
          if (!tolerant) {
            reject(e)
          }
        }
        mapped = newResult ? result : null
        resolve(mapped)
      } else if (
        (am.isGenerator(fn) || argsHaveClass) &&
        (am.isArray(result) || am.isObject(result))
      ) {
        // 4,5. object or array in generator (asynchronous) or class (synchronous/asynchronous)

        am
          .filter(result, argsHaveClass || fn, tolerant)
          .next(function(newResult) {
            resolve(newResult)
          })
          .error(reject)
      } else if (am.isGenerator(fn)) {
        mapped = fn.apply(self, [result, 0, [result]])

        // 6. other in (asynchronous)
        am(fn.apply(self, [result, 0, [result]]))
          .next(function(newResult) {
            resolve(newResult ? result : null)
          })
          .error(function(err) {
            if (!tolerant) {
              reject(err)
            } else {
              resolve(null)
            }
          })
      }
    })
  }

  // convert an ExtendedPromise object to a Promise
  promise() {
    let self = this
    return new Promise(function(resolve, reject) {
      self.next(resolve).error(reject)
    })
  }
  forEach(fn) {
    let self = this,
      argsHaveClass = am.argumentsHaveClass.apply(self, [arguments]),
      applyResultToClass = am.ExtendedPromise._applyResultToClass,
      newContext = {}
    for (var attr in self._state_) {
      newContext[attr] = self._state_[attr]
    }
    newContext.prev = self
    return am.ExtendedPromise._chain(self, newContext)(function(resolve, reject, result, err) {
      let attr, i, mapped
      if (err) {
        reject(err)
      } else if (!argsHaveClass && !am.isGenerator(fn) && am.isObject(result)) {
        // 1. object in (synchronous)
        mapped = {}
        for (attr in result) {
          mapped[attr] = fn.apply(self, [result[attr], attr, result])
        }
        resolve(result)
      } else if (!argsHaveClass && !am.isGenerator(fn) && am.isArray(result)) {
        // 2. array in (synchronous)
        mapped = []
        for (i = 0; i < result.length; i++) {
          mapped[i] = fn.apply(self, [result[i], i, result])
        }
        resolve(result)
      } else if (!argsHaveClass && !am.isGenerator(fn)) {
        // 3. other in (synchronous)
        mapped = am(fn.apply(self, [result, 0, [result]]))
        am(result)
          .next(resolve)
          .error(reject)
      } else if ((argsHaveClass || am.isGenerator(fn)) && am.isObject(result)) {
        // 4. object in (asynchronous)
        mapped = {}
        for (attr in result) {
          mapped[attr] = argsHaveClass
            ? applyResultToClass(argsHaveClass, [result[attr], attr, result])
            : fn.apply(self, [result[attr], attr, result])
        }
        am
          .forEach(mapped)
          .next(function() {
            resolve(result)
          })
          .error(reject)
      } else if ((argsHaveClass || am.isGenerator(fn)) && am.isArray(result)) {
        // 5. array in (asynchronous)
        mapped = []
        for (i = 0; i < result.length; i++) {
          mapped[i] = argsHaveClass
            ? applyResultToClass(argsHaveClass, [result[i], i, result])
            : fn.apply(self, [result[i], i, result])
        }
        am
          .forEach(mapped)
          .next(function() {
            resolve(result)
          })
          .error(reject)
      } else if (am.isGenerator(fn)) {
        mapped = am(fn.apply(self, [result, 0, [result]]))
        // 6. other in (asynchronous)
        // am
        //   .forEach(mapped)
        mapped
          .next(() => {
            resolve(result)
          })
          .error(reject)
      } else if (argsHaveClass) {
        mapped = applyResultToClass(argsHaveClass, [result, 0, [result]])
        // 7. other applied to Class (synchronous/asynchronous)
        // am
        //   .forEach(mapped)
        mapped
          .next(function() {
            resolve(result)
          })
          .error(reject)
      }
    })
  }

  map(fn, tolerant) {
    let self = this,
      argsHaveClass = am.argumentsHaveClass.apply(self, [arguments]),
      applyResultToClass = am.ExtendedPromise._applyResultToClass,
      newContext = {}
    for (var attr in self._state_) {
      newContext[attr] = self._state_[attr]
    }
    newContext.prev = self
    return am.ExtendedPromise._chain(self, newContext)(function(resolve, reject, result, err) {
      let attr, i, mapped
      if (err) {
        reject(err)
      } else if (!argsHaveClass && !am.isGenerator(fn) && am.isObject(result)) {
        // 1. object in (synchronous)
        mapped = {}
        for (attr in result) {
          mapped[attr] = fn.apply(self, [result[attr], attr, result])
        }
        resolve(mapped)
      } else if (!argsHaveClass && !am.isGenerator(fn) && am.isArray(result)) {
        // 2. array in (synchronous)
        mapped = []
        for (i = 0; i < result.length; i++) {
          mapped[i] = fn.apply(self, [result[i], i, result])
        }
        resolve(mapped)
      } else if (!argsHaveClass && !am.isGenerator(fn)) {
        // 3. other in (synchronous)
        mapped = fn.apply(self, [result, 0, [result]])
        am(mapped)
          .next(resolve)
          .error(reject)
      } else if ((argsHaveClass || am.isGenerator(fn)) && am.isObject(result)) {
        // 4. object in (asynchronous)
        mapped = {}
        for (attr in result) {
          try {
            mapped[attr] = argsHaveClass
              ? applyResultToClass(argsHaveClass, [result[attr], attr, result])
              : fn.apply(self, [result[attr], attr, result])
          } catch (e) {
            reject(e)
          }
        }
        am
          .forEach(mapped, tolerant)
          .next(function(newResult) {
            resolve(newResult)
          })
          .error(reject)
      } else if ((argsHaveClass || am.isGenerator(fn)) && am.isArray(result)) {
        // 5. array applied to generator  (asynchronous) or Class
        mapped = []
        for (i = 0; i < result.length; i++) {
          try {
            mapped[i] = argsHaveClass
              ? applyResultToClass(argsHaveClass, [result[i], i, result])
              : fn.apply(self, [result[i], i, result])
          } catch (e) {
            reject(e)
          }
        }
        am
          .forEach(mapped, tolerant)
          .next(function(newResult) {
            resolve(newResult)
          })
          .error(reject)
      } else if (am.isGenerator(fn)) {
        // 6. non object/array applied to generator (asynchronous)
        try {
          mapped = fn.apply(self, [result, 0, [result]])
        } catch (e) {
          reject(e)
        }

        /* am
          .forEach(mapped, tolerant)*/
        mapped.next(resolve).error(reject)
      } else if (argsHaveClass) {
        // 7. non array/object applied to Class (synchronous/asynchronous)
        try {
          mapped = applyResultToClass(argsHaveClass, [result, 0, [result]])
          mapped.next(resolve).error(reject)
        } catch (e) {
          reject(e)
        }

        mapped.next(resolve).error(reject)
      }
    })
  }

  log(label, errorLabel, errorObject) {
    let self = this,
      stack,
      lineNumber,
      filepath,
      file
    for (var i = 0; i < arguments.length; i++) {
      if (arguments[i] instanceof Error) {
        errorObject = arguments[i]
      }
    }
    if (errorObject) {
      stack = errorObject.stack.split('\n')
      lineNumber = stack[1].split(':')[1]
      filepath = stack[1].split(':')[0].split('/')
      file = filepath.slice(-2).join('/')
    }
    self
      .next(function(result) {
        if (label) {
          if (lineNumber) {
            console.log(label, ' line ' + lineNumber, ' of ' + file, result)
          } else {
            console.log(label, '[' + (new Date() - self._state_.timer) + 'ms]', result)
          }
        } else {
          console.log(result)
        }
      })
      .error(function(err) {
        if (errorLabel) {
          if (lineNumber) {
            console.log(errorLabel, ' line ' + lineNumber, ' of ' + file, ':', err)
          } else {
            console.log(errorLabel, err)
          }
        } else {
          console.log(err)
        }
      })

    // pass through
    return self
  }

  error(fn) {
    let self = this,
      argsHaveClass = am.argumentsHaveClass.apply(self, [arguments]),
      applyResultToClass = am.ExtendedPromise._applyResultToClass,
      newContext = {},
      args
    for (var attr in self._state_) {
      newContext[attr] = self._state_[attr]
    }
    newContext.prev = self
    return ExtendedPromise._chain(self, newContext)(function(resolve, reject, result, err) {
      let newResult
      if (err) {
        if (typeof fn === 'function' && !am.isGenerator(fn)) {
          newResult = fn(err)
          if (newResult === undefined) {
            // pass through if nothing returned
            resolve()
          } else {
            resolve(newResult)
          }
        } else if (am.isGenerator(fn)) {
          am(fn(err))
            .next(function(newResult) {
              // pass through if nothing returned
              if (newResult === undefined) {
                resolve()
              } else {
                resolve(newResult)
              }
            })
            .error(reject)
        } else if (argsHaveClass) {
          args = [err]
          if (argsHaveClass.args) {
            // prepend any arguments added in method arguments to resolved value from previous step(s) in chain
            args = argsHaveClass.args.concat([err])
          }
          applyResultToClass(argsHaveClass, args)
            .next(function(newResult) {
              // pass through if nothing returned
              if (newResult === undefined) {
                resolve()
              } else {
                resolve(newResult)
              }
            })
            .error(reject)
        } else {
          reject(err)
        }
      } else {
        resolve(result)
      }
    })
  }
  static _chain(self, context) {
    return function(transform) {
      self._state_.chained = true

      return new am.ExtendedPromise(function(resolve, reject) {
        self
          .then(function(result) {
            try {
              transform(resolve, reject, result, null)
            } catch (e) {
              reject(e)
            }
          })
          .catch(function(err) {
            try {
              transform(resolve, reject, null, err)
            } catch (e) {
              reject(e)
            }
          })
      }, context)
    }
  }
  static _applyResultToClass(argsHaveClass, args) {
    let wrappedNewResult,
      newedClass,
      self = this

    if (argsHaveClass.classFn && argsHaveClass.methodName) {
      // class with specified method (new first)

      try {
        newedClass = new argsHaveClass.classFn()
        if (!newedClass[argsHaveClass.methodName]) {
          wrappedNewResult = am.reject(
            argsHaveClass.methodName + ' is not a methodName of the specified Class'
          )
        } else {
          wrappedNewResult = am(newedClass[argsHaveClass.methodName].apply(newedClass, args))
        }
      } catch (e) {
        wrappedNewResult = am.reject(e)
      }
    } else if (argsHaveClass.classObject && argsHaveClass.methodName) {
      // newed class with specified method
      if (!argsHaveClass.classObject[argsHaveClass.methodName]) {
        wrappedNewResult = am.reject(
          argsHaveClass.methodName + ' is not a methodName of the specified Class'
        )
      } else {
        try {
          wrappedNewResult = am(
            argsHaveClass.classObject[argsHaveClass.methodName].apply(
              argsHaveClass.classObject,
              args
            )
          )
        } catch (e) {
          wrappedNewResult = am.reject(e)
        }
      }
    } else if (argsHaveClass.classFn) {
      // .next(Class)
      // new the class constructor with the arguments provided

      try {
        wrappedNewResult = am(
          new (Function.prototype.bind.apply(argsHaveClass.classFn, [{}].concat(args)))()
        ).next(function(newResult) {
          if (typeof newResult === 'function') {
            return am.fn(newResult)
          } else {
            return newResult
          }
        })
      } catch (e) {
        wrappedNewResult = am.reject(e)
      }
    }
    return wrappedNewResult
  }
  setClass(classReference) {
    let self = this,
      argsHaveClass = am.argumentsHaveClass.apply(self, [arguments])

    if (argsHaveClass.args && argsHaveClass.args.length && argsHaveClass.classFn) {
      // if arguments for class provided then new class with arguments
      self._state_.class = new (Function.prototype.bind.apply(
        argsHaveClass.classFn,
        [self || {}].concat(argsHaveClass.args)
      ))()
    } else if (argsHaveClass.classFn) {
      // set stored class to provided class (newed)
      self._state_.class = new argsHaveClass.classFn()
    } else if (argsHaveClass.classObject) {
      // set stored class to provided class
      self._state_.class = argsHaveClass.classObject
    }
    return self
  }
  clearClass() {
    let self = this
    delete self._state_.class
    return self
  }
  twoPrev(fn) {
    let self = this,
      prev = (self._state_ && self._state_.prev) || null,
      transform,
      newContext = this._state_
    let argsHaveClass = am.argumentsHaveClass.apply(self, [arguments])

    newContext.prev = this
    transform = function(resolve, reject, result, err) {
      let newResult,
        prevExtendedPromises = [self]
      if (prev) {
        prevExtendedPromises.push(prev)
      }

      am
        .all(prevExtendedPromises)
        .next(function(args) {
          if (argsHaveClass) {
            let newResult

            // append any additional arguments passed to threePrev*() to the last 3 results
            if (argsHaveClass.args) {
              args = args.concat(argsHaveClass.args)
            }
            try {
              am.ExtendedPromise._applyResultToClass(argsHaveClass, args)
                .next(function(newResult) {
                  if (newResult === undefined) {
                    newResult = args
                  }
                  resolve(newResult)
                })
                .catch(reject)
            } catch (e) {
              reject(e)
            }
          } else if (am.isGenerator(fn)) {
            // generator - asynchronous step
            am(fn.apply(self, args))
              .next(function(newResult) {
                if (newResult === undefined) {
                  newResult = args
                }
                return am(newResult)
                  .next(resolve)
                  .error(reject)
              })
              .catch(reject)
          } else if (typeof fn === 'function') {
            try {
              newResult = fn.apply(self, args)

              if (newResult === undefined) {
                newResult = args
              }
              am(newResult)
                .next(resolve)
                .error(reject)
            } catch (e) {
              reject(e)
            }
          } else {
            am(args)
              .next(resolve)
              .error(reject)
          }
        })
        .catch(function(err) {
          reject(err)
        })
    }

    return am.ExtendedPromise._chain(self, newContext)(transform)
  }

  threePrev(fn) {
    let self = this,
      prev = (self._state_ && self._state_.prev) || null,
      transform,
      newContext = self._state_
    let argsHaveClass = am.argumentsHaveClass.apply(self, [arguments])

    newContext.prev = this
    transform = function(resolve, reject, result, err) {
      let newResult,
        prevExtendedPromises = [self]
      if (prev) {
        prevExtendedPromises.push(prev)

        // get result from three steps previous in chain
        if (prev._state_ && prev._state_.prev) {
          prevExtendedPromises.push(prev._state_.prev)
        }
      }
      am
        .all(prevExtendedPromises)
        .next(function(args) {
          if (argsHaveClass) {
            let newResult

            // append any additional arguments passed to threePrev*() to the last 3 results
            if (argsHaveClass.args) {
              args = args.concat(argsHaveClass.args)
            }
            try {
              am.ExtendedPromise._applyResultToClass(argsHaveClass, args)
                .next(function(newResult) {
                  if (newResult === undefined) {
                    newResult = args
                  }
                  resolve(newResult)
                })
                .error(reject)
            } catch (e) {
              reject(e)
            }
          } else if (am.isGenerator(fn)) {
            // generator - asynchronous step
            am(fn.apply(self, args))
              .next(function(newResult) {
                if (newResult === undefined) {
                  newResult = args
                }
                return am(newResult)
                  .next(resolve)
                  .error(reject)
              })
              .catch(reject)
          } else if (typeof fn === 'function') {
            try {
              newResult = fn.apply(self, args)
              if (newResult === undefined) {
                newResult = args
              }
              am(newResult)
                .next(resolve)
                .error(reject)
            } catch (e) {
              reject(e)
            }
          } else {
            am(args)
              .next(resolve)
              .error(reject)
          }
        })
        .catch(function(err) {
          reject(err)
        })
    }

    return am.ExtendedPromise._chain(self, newContext)(transform)
  }
}

am = function(initial) {
  let self = this,
    args = []

  for (var i = 1; i < arguments.length; i++) {
    args.push(arguments[i])
  }

  if (initial instanceof ExtendedPromise) {
    //
    //Wrap  ExtendedPromise
    return initial
  }
  if (am.isPromise(initial)) {
    //
    // Wrap Promises
    if (self && self._state_) {
      return new ExtendedPromise(function(resolve, reject) {
        initial.then(resolve).catch(reject)
      }, self._state_)
    } else {
      return new ExtendedPromise(function(resolve, reject) {
        initial.then(resolve).catch(reject)
      })
    }
  }
  if (am.isGenerator(initial) || am.isNextable(initial)) {
    //
    //Wrap generators and iterables
    return am.co.apply(self, [initial].concat(args))
  }
  if (typeof initial === 'function') {
    //
    // Wrap functions with callback
    return am(
      new Promise(function(resolve, reject) {
        // handle callback argument
        args.push(function(err) {
          if (err) {
            reject(err)
          } else {
            let args = []
            for (var i = 1; i < arguments.length; i++) {
              args.push(arguments[i])
            }
            resolve(args.length > 1 ? args : args[0])
          }
        })
        initial.apply(self, args)
      })
    )
  }

  let argsHaveClass = am.argumentsHaveClass.apply(self, [[arguments[0]].concat(args)])

  if (argsHaveClass) {
    //
    // Wrap Class
    let result
    if (argsHaveClass.methodName) {
      if (argsHaveClass.classFn) {
        // raw class and  method name
        try {
          let newedClass = new argsHaveClass.classFn()
          return am(newedClass[argsHaveClass.methodName].apply(self || {}, argsHaveClass.args))
        } catch (e) {
          return am.reject(e)
        }
      } else {
        // newed class and method name
        try {
          return am(
            argsHaveClass.classObject[argsHaveClass.methodName].apply(
              argsHaveClass.classObject,
              argsHaveClass.args
            )
          )
        } catch (e) {
          return am.reject(e)
        }
      }
    } else if (argsHaveClass.classFn) {
      // raw class no method name
      try {
        return am(new argsHaveClass.classFn().apply(argsHaveClass.args))
      } catch (e) {
        return am.reject(e)
      }
    }
  }
  //
  // wrap other
  if (self && self._state_) {
    return am.apply(self, [
      new Promise(function(resolve) {
        resolve(initial)
      })
    ])
  } else {
    return am(
      new Promise(function(resolve) {
        resolve(initial)
      })
    )
  }
}

am.resolve = function(value) {
  if (am.isGenerator(value) || value instanceof ExtendedPromise || am.isPromise(value)) {
    return am(value).next(function(result) {
      return am(
        new Promise(function(resolve) {
          resolve(result)
        })
      )
    })
  } else {
    return am(
      new Promise(function(resolve) {
        resolve(value)
      })
    )
  }
}
am.reject = function(err) {
  if (am.isGenerator(err) || err instanceof ExtendedPromise || am.isPromise(err)) {
    am(err).error(function(err) {
      return am(
        new Promise(function(resolve) {
          resolve(err)
        })
      )
    })
  } else {
    return new ExtendedPromise(function(resolve, reject) {
      reject(err)
    })
  }
}
am.isGenerator = function() {
  return (
    arguments[0] &&
    arguments[0].constructor &&
    arguments[0].constructor.name === 'GeneratorFunction'
  )
}
am.isNextable = function() {
  return arguments[0] && typeof arguments[0] === 'object' && typeof arguments[0].next === 'function'
}
am.isIterable = function() {
  return typeof arguments[0][Symbol.iterator] === 'function'
}
am.isObject = function() {
  return (
    arguments[0] &&
    arguments[0].constructor &&
    arguments[0].constructor.name &&
    arguments[0].constructor.name === 'Object'
  )
}
am.isArray = function() {
  return arguments[0] && Array.isArray(arguments[0])
}
am.isPromise = function(initial) {
  return initial && initial.constructor && initial.constructor.name === 'Promise'
}

am.isClass = initial => {
  return initial.toString().substr(0, 6) === 'class '
}
am.argumentsHaveClass = function(argsIn) {
  let i,
    classFn,
    methodName,
    classObject,
    args = [],
    self = this

  for (i = 0; i < argsIn.length; i++) {
    args.push(argsIn[i])
  }

  if (typeof args[0] === 'string') {
    methodName = args[0]
    args.shift()
  }

  // if am().setClass(classReference) has been called
  // use self._state_.class as reference class when first argument is a string
  if (self && self._state_ && self._state_.class && methodName) {
    if (
      typeof self._state_.class === 'object' &&
      am.isClass(self._state_.class.constructor) &&
      self._state_.class[methodName]
    ) {
      classObject = self._state_.class
    }
    if (
      typeof self._state_.class === 'function' &&
      am.isClass(self._state_.class) &&
      new self._state_.class()[methodName]
    ) {
      classFn = self._state_.class
    }
  }

  // newed Class
  if (typeof args[0] === 'object' && am.isClass(args[0].constructor)) {
    classObject = args[0]
    args.shift()
  }
  // raw class
  if (typeof args[0] === 'function' && am.isClass(args[0])) {
    classFn = args[0]
    args.shift()
  }

  if (
    typeof args[1] === 'object' &&
    am.isClass(args[1].constructor) &&
    methodName &&
    args[1][args[0]]
  ) {
    classObject = args[1]
    args.splice(1, 1)
  }

  if (
    typeof args[1] === 'function' &&
    am.isClass(args[1]) &&
    methodName &&
    args[1].prototype[args[0]]
  ) {
    classFn = args[1]
    args.splice(1, 1)
  }
  if (typeof args[1] === 'string' && typeof args[0] === 'function' && args[0].prototype[args[1]]) {
    methodName = args[1]
    args.splice(1, 1)
  }
  if (typeof args[1] === 'string' && typeof args[0] === 'object' && args[0][args[1]]) {
    methodName = args[1]
    args.splice(1, 1)
  }

  return classObject || classFn ? { classFn, classObject, methodName, args } : false
}
// interpret Generator
am.co = function() {
  let iterable,
    self = this,
    args = []
  for (var i = 1; i < arguments.length; i++) {
    args.push(arguments[i])
  }
  if (am.isGenerator(arguments[0])) {
    iterable = arguments[0].apply(self, args)
  } else if (am.isNextable(arguments[0])) {
    iterable = arguments[0]
  }
  if (!iterable) {
    return am.apply(self, arguments)
  }
  return am(
    new Promise(function(resolve, reject) {
      let iterate = function(next) {
        if (next.done) {
          return resolve(next.value)
        }
        try {
          // iterate down in data structure co-wise
          am
            .all(next.value)
            .next(function(result) {
              iterate(iterable.next(result))
            })
            .error(function(err) {
              reject(err)
            })
        } catch (e) {
          reject(e)
        }
      }

      // kick of the iterable iteration
      iterate(iterable.next())
    })
  )
}

am.race = function(initial) {
  let attr,
    i,
    list = [],
    response = {}
  if (!am.isObject(initial) && !am.isArray(initial)) {
    return am(initial)
  } else if (am.isArray(initial)) {
    for (i = 0; i < initial.length; i++) {
      list.push(am.all(initial[i]))
    }

    return ExtendedPromise.race(list)
  } else {
    return am(
      new Promise(function(resolve, reject) {
        for (attr in initial) {
          ;(function(value, attr) {
            list.push(
              am.all(value).next(function(result) {
                return am([attr, result])
              })
            )
          })(initial[attr], attr)
        }

        ExtendedPromise.race(list)
          .next(function(result) {
            response[result[0]] = result[1]
            resolve(response)
          })
          .error(reject)
      })
    )
  }
}

am.parallel = am.all = function(initial) {
  let attr,
    i,
    list = [],
    response = {}
  if (initial.constructor.name === 'ExtendedPromise') {
    return initial
  } else if (!am.isObject(initial) && !am.isArray(initial)) {
    return am(initial)
  } else if (am.isArray(initial)) {
    for (i = 0; i < initial.length; i++) {
      list.push(am.all(initial[i]))
    }

    return ExtendedPromise.all(list)
  } else {
    return new am.ExtendedPromise(function(resolve, reject) {
      for (attr in initial) {
        ;(function(value, attr) {
          list.push(
            am.all(value).next(function(result) {
              response[attr] = result
            })
          )
        })(initial[attr], attr)
      }

      ExtendedPromise.all(list)
        .next(function() {
          resolve(response)
        })
        .error(reject)
    })
  }
}
// iterate a list of sync and async data object members in sequence
am.forEach = function(initial, tolerant) {
  let keys = [],
    list,
    response,
    iterate = function(self, index) {
      if (index < keys.length) {
        return self
          .next(function(result) {
            if (am.isArray(response)) {
              response.push(result)
            } else {
              response[keys[index]] = result
            }
            if (index < keys.length - 1) {
              return iterate(am(list[keys[++index]], keys[index]), index)
            } else {
              return am.resolve(response)
            }
          })
          .error(function(err) {
            if (!tolerant) {
              return am.reject(err)
            }
            if (index < keys.length - 1) {
              return iterate(am(list[keys[++index]], keys[index]), index)
            } else {
              return am.resolve(response)
            }
          })
      } else {
        return am.resolve(response)
      }
    }
  if (!am.isObject(initial) && !am.isArray(initial)) {
    return am(initial)
  }
  if (am.isObject(initial)) {
    list = {}
    response = {}
    for (var attr in initial) {
      keys.push(attr)
      list[attr] = initial[attr]
    }
  } else {
    list = []
    response = []
    for (var i = 0; i < initial.length; i++) {
      keys.push(i)
      list[i] = initial[i]
    }
  }
  return iterate(am(list[keys[0]], keys[0]), 0)
}

am.filter = function(initial, fn, tolerant, mapFilter) {
  let keys = [],
    argsHaveClass = typeof fn === 'object' && (fn.classFn || fn.objectClass) ? fn : null,
    list,
    response,
    iterate = function(self, index) {
      if (index < keys.length) {
        return self
          .next(function(result) {
            // if the result of the async operation returns a truthy response
            // include original element except if mapFilter include new result
            if (result && am.isArray(response)) {
              // array
              response.push(mapFilter ? result : initial[keys[index]])
            } else if (result) {
              // object
              response[keys[index]] = mapFilter ? result : initial[keys[index]]
            }

            // iterate or return until all elements processed
            if (index < keys.length - 1) {
              return iterate(
                argsHaveClass
                  ? // evaluate arguments appled to class constructor
                    am.ExtendedPromise._applyResultToClass(argsHaveClass, [
                      list[keys[++index]],
                      keys[index]
                    ])
                  : // evaluate arguments applied to function or generator
                    am(fn(list[keys[++index]], keys[index])),
                index
              )
            } else {
              return Promise.resolve(response)
            }
          })
          .error(function(err) {
            // if tolerant specified, on error continue iteration to end
            if (!tolerant) {
              return Promise.reject(err)
            }
            if (index < keys.length - 1) {
              return iterate(
                argsHaveClass
                  ? am.ExtendedPromise._applyResultToClass(argsHaveClass, [
                      list[keys[++index]],
                      keys[index]
                    ])
                  : am(fn(list[keys[++index]], keys[index])),
                index
              )
            } else {
              return am.resolve(response)
            }
          })
      } else {
        return am.resolve(response)
      }
    }

  // if not object or array return promise
  if (!am.isObject(initial) && !am.isArray(initial)) {
    return am(fn(initial)).next(function(newResult) {
      return am(newResult ? (mapFilter ? newResult : initial) : null)
    })
  } else if (am.isObject(initial)) {
    list = {}
    response = {}
    for (var attr in initial) {
      keys.push(attr)
      list[attr] = initial[attr]
    }
  } else {
    list = []
    response = []
    for (var i = 0; i < initial.length; i++) {
      keys.push(i)
      list[i] = initial[i]
    }
  }

  if (keys.length) {
    return iterate(
      argsHaveClass
        ? // evaluate arguments appled to class constructor
          am.ExtendedPromise._applyResultToClass(argsHaveClass, [list[keys[0]], keys[0]])
        : am(fn(list[keys[0]], keys[0])),
      0
    )
  } else {
    return am(initial)
  }
}

// iterate a list of sync and async data object members in sequence
// applying result to each stage
am.waterfall = function(initial) {
  let keys = [],
    self = this,
    list,
    response,
    iterate = function(promise, index) {
      if (index < keys.length) {
        return promise
          .next(function(result) {
            response[keys[index]] = result
            if (index < keys.length - 1) {
              ++index
              if (typeof list[keys[index]] === 'function') {
                // handle array or object of callback functions or generators (apply arguments)
                if (am.isArray(initial)) {
                  return iterate(am.apply(self, [list[keys[index]]].concat(response)), index)
                } else {
                  return iterate(am.apply(self, [list[keys[index]], response]), index)
                }
              } else {
                // handle structure of non functions
                return iterate(am(list[keys[index]]), index)
              }
            } else {
              return ExtendedPromise.resolve(response)
            }
          })
          .error(function(err) {
            return ExtendedPromise.reject(err)
          })
      } else {
        return am.resolve(response)
      }
    }
  if (!am.isObject(initial) && !am.isArray(initial)) {
    return am(initial)
  }
  if (am.isObject(initial)) {
    list = {}
    response = {}
    for (var attr in initial) {
      keys.push(attr)
      list[attr] = initial[attr]
    }
    return iterate(am.apply(self, [list[keys[0]], response]), 0)
  } else {
    list = []
    response = []
    for (var i = 0; i < initial.length; i++) {
      keys.push(i)
      list[i] = initial[i]
    }
    return iterate(am(list[keys[0]]), 0)
  }
}

am.fn = function(fn) {
  let self = this,
    args = []
  for (var i = 1; i < arguments.length; i++) {
    args.push(arguments[i])
  }
  if (typeof fn === 'function') {
    return am(fn.apply(self, args))
  } else {
    return am(fn)
  }
}

am.sfFn = function(initial) {
  let self = this,
    i = 1,
    args = []
  for (i; i < arguments.length; i++) {
    args.push(arguments[i])
  }
  return am(
    new Promise(function(resolve, reject) {
      args.push(resolve)
      args.push(reject)
      initial.apply(self, args)
    })
  )
}

// add one or more extensions to an existing instance
am.extend = function(extensionPackageList) {
  if (!am.isArray(extensionPackageList)) {
    extensionPackageList = [extensionPackageList]
  }
  extensionPackageList.forEach(function(extensionPackage) {
    let amVersion = require(extensionPackage)
    try {
      for (var method in amVersion) {
        if (!am[method]) {
          am[method] = amVersion[method]
        }
      }

      am._extend(amVersion.ExtendedPromise)
    } catch (e) {
      console.log(1397, 'Problem extending am with ', extensionPackage, e)
    }
  })
  return am
}
am._extend = function(extendedPromise) {
  // back extend async methods ExtendedPromise class
  let superMethodNames = am.methodNames

  // export extended promise class
  ExtendedPromise = am.ExtendedPromise = extendedPromise
  am.methodNames = Object.getOwnPropertyNames(Object.getPrototypeOf(am()))
    .slice(1)
    .concat(superMethodNames)

  return am
}
am.methodNames = Object.getOwnPropertyNames(Object.getPrototypeOf(am())).slice(1)
am.ExtendedPromise = ExtendedPromise

module.exports = am
