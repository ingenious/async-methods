# Changes to package by version

## version 0.2.15

1. **am.extend(extensionPackageList)**

async-methods can niow be extended progressively using **am.extend()** static mmthod.  Some new standard extensions are due for release soon, but applicastion developers can create their own and reference them by a filepath as well as by an npm module name.

```javascript
                                                                
    let am = require('am-mongo')

    am.extend(['../../am-axios.js', '../../am-cron.js'])

    // as well as additional am.xxx() static methods
    // am with now be extended with am-mongo, am-axios and am-cron methods available in the chain

```

This would have the same effect:

```javascript
                                                                
    let am = require('async-methods')

    am.extend(['am-mongo',../../am-axios.js', '../../am-cron.js'])

    // am with now be extended with am-mongo, am-axios and am-cron methods available in the chain
    // as well as additional am.xxx() static methods

```

2. ** Additonal arguments for class methods) When wrapping a class and specifying a method name, arguments to be passed to the method can be added can be added as arguments of the wrappimg am().  The same is now true for anonymous and named classes used as arguments to  

### next(methodName,class,...), error(methodName,class,...), 

  Additional arguments added to **next(methodName,class,...)** are **prepended** to the resolved result of previous step and appled as arguments to the method.  Thiis si useful if you don'tt want the result to be used by the method but wish to apply other arguments.

### twoPrev(methodName,class,...), threePrev(methodName,class,...)

  Additional arguments added to **twoPrev(methodName,class,...)** are **appended** to the resolved result of previous two steps and appled as arguments to the method.  The main purpose of twoPrev is to pass two results to a method.  If additional arguments are required they can be added in this way.

  Additional arguments added to **threePrev(methodName,class,...)** are **appended** to the resolved result of previous three steps and appled as arguments to the method.  The main purpose of threePrev is to pass three results to a method.  If additional arguments are required they can be added in this way.

3. Added tests for above feature

### Version 0.2.5

#### Changes to functionality

1. added .twoPrev(<generator|function|class>)

passes two arguments - last result and previous result in chain

returns Extended Promise resolving to an array of two latest resolved values in chain

2. added .threePrev(<generator|function|class>)

passes three arguments - last result, previous result and previous result in chain

returns Extended Promise resolving to an array of three latest resolved values in chain

#### Testing

3.  added tests for .twoPrev() and .threePrev()


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

3. Methods am.isClass(), am.argumentsHaveClass() utitlity added

4. am(method,class) detects and applies detects anonymous class with normal or async methods

5. am(initial) detects anonymous or named class and executes the constructor with any arguments



#### Testing

6. Test for am.race() (Generators) changed
7. mocha-wepack deprecated in favour of vanilla mocha
8. Tests added for am.isClass(), am.argumentsHaveClass()
9. Tests added for sample extension
10. Tests added for use of named and anonymous classes in next(), forEach(), map(),  mapFilter() and filter()


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

11. Removed ';' from statement ends

12. Internally, .next() and .error() used instead of .then() and .catch()

13. AM class renamed to ExtendedPromise


