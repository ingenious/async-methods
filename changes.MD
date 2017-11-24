### Version 0.4

1.  Changed behaviour of tolerant in map() to push passing items rather than assign to original index (same behaviour as  .mapFilter() )

2.  Fixed second argument in .forEach and .filter (affects map, mapFilter) - i or attr values correctly passed

3.  Added test suite using webpack-mocha

4.  Removed ';' from statement ends

5.  Corrected error in .forEach() documentation (resolved array is same as initial array)

6.  Added ExtendedPromise property to am for testing of type

7.  Fixed issue with next whereby an error in source Extended Promise was not passed through 

8. Changed behaviour of error() to a) mirror .catch when non function given as argument and b) when nothing returned from function (resolves to undefined)

9. Changed behaviour of next() to mirror .then() when non function given as argument - resolves to original value.

10.  Internally, .next() and .error() used instead of .then() and .catch()

11.  AM class renamed to ExtendedPromise

12. fix for wrapping generator - additional arguments now passed to generator function