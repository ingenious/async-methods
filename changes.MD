### Version 0.2.5

#### Changes to functionality

1. added .twoPrev(<generator|function|class>)

passes two arguments - last result and previous result in chain

returns Extended Promise resolving to an array of two latest resolved values in chain

2. added .threePrev(<generator|function|class>)

passes three arguments - last result, previous result and previous result in chain

returns Extended Promise resolving to an array of three latest resolved values in chain

#### Testing

1.  added tests for .twoPrev() and .threePrev()


### Version 0.2.4

#### Changes to functionality

1.  made class methods invokeable with a context (used in api-responder to pass state)

  eg 
  ```
               am.ExtendedPromise._applyResultToClass
                .apply(context, [argsHaveClass])
                .then(result => {
                  resolve(result)
                })
                .catch(reject)
```


### Version 0.2.0

#### Extended Promise Extensions enabled
1.  am._extend(ExtendedPromise) method added

2.  am-sample-extend.js module added as template

#### ES6 Classes with aysnc/await supported

1. Methods am.isClass(), am.argumentsHaveClass() utitlity added

2. am(method,class) detects and applies detects anonymous class with normal or async methods

3. am(initial) detects anonymous or named class and executes the constructor with any arguments



#### Testing

1. Test for am.race() (Generators) changed
2. mocha-wepack deprecated in favour of vanilla mocha
3. Tests added for am.isClass(), am.argumentsHaveClass()
4. Tests added for sample extension
5. Tests added for use of named and anonymous classes in next(), forEach(), map(),  mapFilter() and filter()


### Version 0.1.0

#### Changes to functionality

1. Changed behaviour of tolerant in map() to push passing items rather than assign to original index (same behaviour as  .mapFilter() )

2. Added ExtendedPromise property to am for testing of type

3. Changed behaviour of error() to a) mirror .catch when non function given as argument and b) when nothing returned from function (resolves to undefined)

4. Changed behaviour of next() to mirror .then() when non function given as argument - resolves to original value.


#### Fixes

5. Fixed second argument in .forEach and .filter (affects map, mapFilter) - i or attr values correctly passed

6. Corrected error in .forEach() documentation (resolved array is same as initial array)

7. Fixed issue with next() whereby an error in source Extended Promise was not passed through 

8. Fix for wrapping generator - any additional arguments now passed to generator function

#### Tests

9. Added test suite using mocha and webpack-mocha

10. Removed old tests

#### Re-factor

11.  Removed ';' from statement ends

12.  Internally, .next() and .error() used instead of .then() and .catch()

13.  AM class renamed to ExtendedPromise


