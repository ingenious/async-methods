### Version 0.4

1.  Changed behaviour of tolerant in map() to push passing items rather than assign to original index (same behaviour as  .mapFilter() )

2.  Fixed second argument in .forEach and .filter (affects map, mapFilter) - i or attr values correctly passed

3.  Added test suite using webpack-mocha

4.  Removed ';' from statement ends

5.  Corrected error in .forEach() documentation (resolved array is same as initial array)

6.  Addded ExtendedPromise property for testing of type

7.  Fixed issue with next whereby an error in source Extended Promise was not passed through 