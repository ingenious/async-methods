### Version 1.0

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


### Version 1.1

#### Extended Promise Extensions enabled
1.  am._extend(ExtendedPromise) method added

2.  am-sample-extend module added as template

#### ES6 Classes with aysnc/await supported

1. methods am.isClass, am.argumentsHaveClass added

2. am(method,class) detects and applies named class and method name 

3. am(initial) detects anonymous class with normal or async methods



#### Testing

1. Test for am.race() (Generators) changed
2. mocha-wepack deprecated in favour of vanilla mocha