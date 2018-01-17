# async-methods (am)

## Changes in version 0.2.x


[changes.MD](https://github.com/ingenious/async-methods/blob/master/changes.MD)


##  README for version 0.1.x

[README-0.1.x.md](https://github.com/ingenious/async-methods/blob/master/README-0.1.x.md)

## Version 0.2.0 has two big additional features:

### 1. ES6 Async/Await now supported

As well as ***generators with yield***, async-methods now support ***named and anonymous classes***.  


Normal functions, generators and classes can be used interchangeably in

- **next()**, 
- **forEach()**, 
- **map()**, 
- ***mapFilter()*** and 
- ***filter()*** methods

as well as in an initial wrap eg  ***am(method,class)***  or ***am(class)***

####  Anonymous classes

```javascript
                                                                                      
     am(56)
        .next('test', class {
            async test(value) {
              return await Promise.resolve(89 + (value || 0))
            }
          })
        .log()    //  145
  
```
### 2. async-methods Extensions

You can now roll-your-own Extended Promise, adding more methods or changing functionality of exiting methods!
See ***am-sample-ext.js*** and check out this Mongo extension:  [am-mongo](https://github.com/ingenious/am-mongo)



## How it works

#### 1. Harnessing the flexibity of ES6 generators with yield and async methods with await 
**am** is a function that can wrap  generators, promises, arrays, objects and other entities, always returning an Extended Promise.  The Extended Promise has extra set of methods which allow asynchronous operations to be intuitively chained.  

#### 2. Mix sync and async operations
Most methods accept either a generator which can host a sequence of asyncronous operations using **yield** or a normal function which will have same function but operate synchronously.

In this way syncronous operations of mapping, filtering etc can be combined with asynchronous mapping and filtering operations.

#### 3. **am()** includes all the functionality of **co()**

ES6 generators and yield statements are interpreted similarly

- as in co, yield arguments can be generators, promisesand functions with a single callback 
- with am they be any entity except a functions with no callback (unless wrapped with **am.fn()**.

- errors from any stage within the generator are returned to a **.catch()** or **.error()** at the end of the chain.

#### 4.  Replaces some common async module methods 
- **.parallel(), .waterfall()** can be replaced with simpler ES6 patterns

 
## Installation

[npm](https://www.npmjs.com/package/async-methods)

See also  [npm](https://www.npmjs.com/package/api-responder)

In package.json

```javascript
                                                                                      
                                                                                                                             
	"async-methods":"^1.2.1"
	
```

In console

```
                                                                              
	$ npm install async-methods -P
  
```

In code

```javascript
                                                                                      
	let am=require('async-methods');
  
```
## Wrapping

*Normal entities*

**am([3,4,5])** => Extended Promise that returns an array.

synchronous

```javascript
                                                                                      
   am([3, 4, 5]).mapFilter(function (value, i) {

     return 2 * value + i;
   
   }).log('array wrapper');

   //  array wrapper [15ms] [ 6, 9, 12 ]​​​​​
  
```

asynchronous


```javascript
                                                                                      
   am([33, 4, 555]).wait(200).filter(function* (value) {
   
     return yield am.resolve(4 - value);
   
   }).log('filter asyncronous,');

   // ​​​​​filter asyncronous, [204ms] [ 33,  555 ]​​​​​
  
```
#### Wrapping non-object

```javascript
                                                                                      
am(4).timeout(200).filter(function* (value) {
   
      return yield am.resolve(4 - value);
   
   }).log('filter asyncronous non-object');

   // filter asyncronous non-object [204ms]  null
  
```

**am({a:3})** => Extended Promise that returns an object.

```javascript
                                                                                      
   am({ a: 34, b: 56, c: 78})
   
   .forEach(function (value, attr) {

       console.log(value, attr);// a 34 b 56 c 78

    }).log();
  
```

**am(iterator)**  => Extended Promise which returns the result of the iterator 

```javascript
                                                                                      
   am(function*(a,b){
      a+=b;
      return yield a;
    }(45,55))
    .log('iterator');
    
    // iterator 100
    
```

[Iteration protocols](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Iteration_protocols)


**am(&lt;boolean | string | null&gt;)** => Extended Promise that returns entitity


```javascript
                                                                                      
   am(true).filter(function*(value){
     return value;
   }).log('other')

// 'other' true
  
```
                                                         

*Entities with asynchronous returns*

**am(function(&lt;args&gt;, callback){ ... },&lt;args&gt;)** => Extended Promise that returns arguments of the callback and passes any err to a **.error(fn)**  or **.catch(fn)** at end of the chain.

```javascript
                                                                                      
   am(fs.readFile, __dirname + '/am.js')
  
     .then(function (content) {
     
        return content.toString().substr(-5);
     
     })
     
     .log('function with callback');

    // function with callback '= am';​​​​​
  
```


**am(generator)**  => returns Extended Promise (in same way as to 'co')

```javascript
                                                                                      
   am(function* () {
     
      return yield {
     
        b: Promise.resolve('bb'),
        a: {
           b: Promise.resolve('bb'),
           a: {
              b: Promise.resolve('bb'),
              c: Promise.resolve('cc')
             }
            }
        };
    
    }).log();

  // logs: 
  // yield object with async attributes { b: 'bb', a: { b: 'bb', a: { b: 'bb', c: 'cc' } } }​​​​​
  
```

**am(&lt;Promise&gt;)**  => returns chainable Extended Promise

```javascript
                                                                                      
   am(Promise.resolve([45,67]))
    
      .map(function(item){
    
        return item/10;
    
  }).log('wrap promise')

   // logs
   // wrap promise  [ 4.5, 6.7 ]​​​​​
  
```

**am.sfFn(function(<args>,successFn, errorFn,&lt;args&gt;)** 

returns Extended Promise that returns arguments of the success callback to **next()** or **then()** and passes the argument of the error function to a **.error(fn)**  or **.catch(fn)** at end of the chain.

**WRAP a success/failure function**

```javascript
                                                                                      
let sf = function (a, success, fail) {
    if (a < 10) {
        success(a);
    } else {
        fail('too big');
    }
};

am.sfFn(sf, 14).log('sfFn','err');

//logs

// err 'too big'

am.sfFn(sf, 1).next(function (r) {
  console.log(r);
});
// logs
// 1
  
```

**am(&lt;Extended Promise&gt;)** => identity

## Methods

> In all cases **fn** can be a **generator** or a normal function (for analagous synchronous operation)  A class can be used using syntax .next(methodName,class).  `this gives access to ***async/await***

*tolerant*  argument allows for the map or filter to complete even if there is an error

*Returning a chainable Extended Promise*

### .map(fn,tolerant)

*fn can be a normal function (synchronous operations) or a generator (asynchronous operations)*

equivalent to <array>.map().  If the previous stage of the chain resolves to an *array* or *object*, ecah element of the array or object is replaced with the returned result of the function or generator

#### Synchronous

```javascript
                                                                                      
am(Promise.resolve([45, 67]))
  .map(function (item) {
    return item / 10;
  }).log('map Promise result')

// logs
// map Promise result  [ 4.5, 6.7 ]​​​​​
  
```

####  Anonymous class with async/await

```javascript
                                                                                      
     am([4, 5, 6])
        .map(
          'asyncMap',
          class {
            async asyncMap(value) {
              return await Promise.resolve(2 * value)
            }
          }
        )
        .map(
          'syncMap',
          class {
            syncMap(value) {
              return 3 * value
            }
          }
        )
        .log()   //  [24, 30, 36]
  
```

### .filter(fn, tolerant)

*fn can be a normal function (synchronous operations) or a generator (asynchronous operations)*

*Filter can be applied to objects and other entitites as well as arrays

#### Synchronous

```javascript
                                                                                      
am(7).filter(function (value) {
  return 7 - value;
}).log();

// logs
// null
  
```

####  Generator/yield

```javascript
                                                                                      
am(7).filter(function* (value) {
  return yield(8 - value);
}).log();

// logs
// 7
  
```

####  Async/await

```javascript
                                                                                      
     am({ a: 4, b: 5, c: 6 })
        .filter(
          'asyncMap',
          class {
            async asyncMap(value, attr) {
              return await Promise.resolve(value < 5 ? false : true)
            }
          }
        )
        .filter(
          'syncMap',
          class {
            syncMap(value, attr) {
              return value === 6 ? false : 2 * value
            }
          }
        )
        .log()    /// {b:5}
  
```

#### filter object

```javascript
                                                                                      
am({
    a: 27,
    b: 78
}).filter(function* (value, attr) {

    let a = yield Promise.resolve(value);
    return a > 50;
}).log('object filter');

// logs
// ​​​​​object filter  { b: 78 }​​​​​
  
```


### .mapFilter(fn, tolerant)

Combines a map followed by a fiter using values returned from the map
If the mapping function for an element returns false, then the element is excluded from the result

*fn can be a normal function (synchronous operations) or a generator (asynchronous operations)*


####  synchronous

```javascript
                                                                                      
     am([3, 4, 5])
       .mapFilter(function (value, i) {
         let a= 2 * value + i;
         return a > 6 ? a :false;
       })
       .log('mapfilter');         \\   mapfilter [ 9, 12 ]​​​​​
  
```

####  Asynchronous using Anonymous class

```javascript
                                                                                      
    am([4, 5, 6])
        .mapFilter('asyncMap', class {
            async asyncMap(value) {
              return value < 5 ? false : await Promise.resolve(2 * value)
            }
          })
        .mapFilter('syncMap', class {
            syncMap(value) {
              return value === 10 ? false : 2 * value
            }
          }).log()  // [24]
  
```

### .forEach(fn)

*fn can be a normal function (synchronous operations) or a generator (asynchronous operations)*

forEach returns an extended Promise resolving to the initial array or objectx

#### synchronous

```javascript
                                                                                      
am([34, 56, 78]).forEach(function (value, i) {
  console.log(value, i);
}).log();

// logs
//  34 0
//  56 1 
//  78 2
//  [34, 56, 78]
  
```

####generator/yield

```javascript
                                                                                      
am([34, 56, 78]).forEach(function* (value, i) {
  console.log(yield am.resolve(2 * value),i);
}).log();

// logs
//  68 0
// 112 1
// 156 2
  
```

#### Class with async/await

```javascript
                                                                                      
    let test = []
      am(66)
        .forEach('asyncMap', class {
            async asyncMap(value, i) {
              test.push(await Promise.resolve(value))
            }
          }
        )
        .forEach('syncMap',class {
            syncMap(value, i) {
              test.push(2 * value)
            }
          })
        .next(function(){
                
            console.log(test)  // [66,132]
        })
  
```

#### Object applied to .forEach 

```javascript
                                                                                      
am({
  a: 34,
  b: 56,
  c: 78
}).forEach(function* (value, attr) {
  console.log(yield am.resolve(3 * value), yield am.resolve(attr));
}).log('object async');

// logs
// ​​​​​102 'a'​​​​​, 168 'b'​​​​​, 234 'c'​​​​​ 
//  ​​​​​object async  { a: 34, b: 56, c: 78 }​​​​​
  
```

### .next(fn)

*fn can be a normal function (synchronous operations) or a generator (asynchronous operations)*

#### Anonymous class

```javascript
                                                                                      
     am(56)
        .next('test', class {
            async test(value) {
              return await Promise.resolve(89 + (value || 0))
            }
          })
        .log()    //  145
  
```

#### Named class

```javascript
                                                                                      
      let sample = class {
        async test(value) {
          return await Promise.resolve(89 + (value || 0))
        }
      }
      let ep = am(56)
        .next('test', sample)
        .log()   //145
  
```

####  Named class with arguments for constructor and method

```javascript
                                                                                      
    let sample = class {
        constructor(type) {
          this.type = type
        }
        async test(value) {
          return await Promise.resolve(89 + (this.type || 0) + (value || 0))
        }
      }
      let ep = am(56)
        .next('test', new sample(45))
        .next(r => {
          
          console.log(r)        // 190  (45 + 89 + 56)
          done()
        })
  
```

### .timeout(ms)

```javascript
                                                                                      
    am.waterfall([
      am.resolve(999).timeout(2000),
      am.resolve(8).timeout(1000)
    ])
    .log('waterfall');

    // logs
    //  ​​​​waterfall [2002ms] [ 999, 8 ]​​​​​
  
```

### .wait(ms) (*identical to timeout*)

```javascript
                                                                                      
      am.sfFn(sf, 1).wait(3000).log('wait');
      
      // logs
      // ​​​​​wait [3003ms] 1​​​​​
      

```

### .log(&lt;success label&gt;[,&lt;error label&gt;'[,Error()]])

*Adding Error() as last attribute will allow log to add the line number
and filename to log of success values as well as errors

```javascript
                                                                                      
  am.sfFn(sf, 1).wait(3000)
    .log('with line no. ', Error());

​ ​​​​ // logs
  // ​​​​​with line no.   line 12  of async-methods/test-4.js 1​​​​​
  
```

### .error(fn)

Similar to <Promise>.catch() but by default it is 'pass-through' ie if nothing is returned - the next stage in the chain will receive the same result or error
passed to error(fn).  fn can also be a normal function or a generator allowing
a further chain of asyncronous operations.

If the function or generator returns something other than undefined or an
error occurs that result or error will be passed to the enxt stage of the chain.

```javascript
                                                                                      
   am.waterfall({
      a: am.reject(88),
      b: function (result, cb) {
        result.f = 567;
        cb(null, 444 + result.a);
    },
      c: function (result, cb) {
      cb(null, 444 + result.a + result.b);
     }
   }).error(function (err) {
     console.log(701, err);
     return am.reject(new Error('no good'));
  }).log('waterfall object', 'waterfall err');

  // logs
  // ​​​​​waterfall err [Error: no good]​​​​​


```javascript
                                                                                      
### .promise() 

Converts an Extended Promise to a normal promise (with methods catch and then)

```javascript
                                                                                      
   am([2, 3, 4]).next(function () {}).log()
      .promise()
      .then(function (result) {
          console.log('Promise resolves with', result);
      }).catch(function (err) {
          console.log(err);
      });
   //logs
   // Promise resolves with [2,3,4]
   
```

### .then(fn)

Similar to **<Promise>.then() but returns an Extended Promise.

If want **fn** to be a generator use **.next()**

### .catch(fn)

Identical to **<Promise>.catch()** but returns a chainable Extended Promise.

If want **fn** to be a generator use **.error()**

## Static methods

>All static methods return a chainable Extended Promise

*async module replacement*

#### am.waterfall([&lt;am-able>,&lt;am-able>,..])

```javascript
                                                                                      
am.waterfall({
  a: am.reject(88),
  b: function (result, cb) {
    result.f = 567;
    cb(null, 444 + result.a);
  },
  c: function (result, cb) {
    cb(null, 444 + result.a + result.b);
  }
}).error(function (err) {
  console.log(701, err);
  return am.reject(new Error('no gogod'));
}).log('waterfall object', 'waterfall err');


```

#### am.parallel([&lt;am-able>,&lt;am-able>,..])

```javascript
                                                                                      
   am.parallel([Promise.resolve(45), Promise.resolve(67)])
   
   .log('parallel');

   // logs
   // ​​​​​parallel [ 45, 67 ]​​​​​


```

#### am.forEach(array,fn) 
where fn is either a function that accepts a callback, or a generator. Anonymous and named claes can also be used to access ***async/await***

```javascript
                                                                                      
   am.forEach([3, 4, 5], function (value, cb) {
     cb(null, 2 * value);
   }).log('sync forEach test result');

   am.forEach([3, 4, 5], function* (value) {
     return yield Promise.resolve(2 * value);
   }).log('async forEach test result'); 


```

### Promise method equivalents

These methods have same functionality as their Promise equivalents but return a chainable Extended Promise rather than a normal Promise

#### am.resolve(value)

```javascript
                                                                                      
   am.resolve(Promise.resolve(67))

     .then(function () {
        console.log(arguments[0]);
    });

    // logs
    // 67


```

#### am.reject(err)

```javascript
                                                                                      
   am.reject({message:'no result'})
   
   .catch(function(err){

     console.log(err);

   })
   // logs
   // ​​​​​{ message: 'no result' }​​​​​


```

#### am.all([&lt;am-wrappable>,&lt;am-wrappable>,..])

*am.all()* can wrap an object as well as an array and the elements of the array or object don't have to be Promises they can be anyhting that **am** wraps 

```javascript
                                                                                      
     am.all([
        4,
        Promise.reject(56),
        function (cb) {
           setTimeout(function () {
              cb(null, 5);
         }, 4000);
        },
     function (cb) {
       setTimeout(function () {
         cb(null, 6);
       }, 1000);
     },
     function (cb) {
       setTimeout(function () {
         cb(null, 90);
       }, 100);
     }
   ]).then(function (r) {
     console.log(r);
   }).catch(function (r) {
     console.log(r);
   });

// logs
//  56


```

#### am.race([&lt;am-wrappable&gt;,&lt;am-wrappable&gt;,..])

*am.race()* can wrap an object as well as an array and the elements of the array or object don't have to be Promises they can be anyhting that **am** wraps

```javascript
                                                                                      
  am.race({
   
     a: Promise.resolve(56),
     b: 45
   
   }).log('race')

// logs
// race 45


```


##  Utility methods

-  am.isPromise(entity)
-  am.isGenerator(entity)
-  am.isNextable(entity) 
-  am.isIterable(entity) 
-  am.isObject(entity)
-  am.isArray(entity)
-  am.isClass(entity)

### am.argumentsHaveClass(args)

```javascript
                                                                                      
                                                                            
      let test, tester = function() {
        return am.argumentsHaveClass(arguments)
      }

      test = tester([234, 567])
      console.log(test)   // false
      
      test = tester('test', class {
          test(arg1, arg2) {
            return arg1 * arg2
          }},4,5)
      console.log(test)  
      /* 
      {  classFn: [Function],
            classObject: undefined,
            methodName: 'test',
            args: [ 4, 5 ]
         }
      */


```

###  am._extend(ExtendedPromise)
####  For use in creating an extension

See **am-sample-ext.js** for more explanation


```javascript
                                                                                      
      let asyncMethods=require('async-methods'),
      extendedAm = asyncMethods._extend(new ExtendedPromise)
      
```

## Tests

There are 169 automated unit and functional tests

```
                                                                              
    $  npm test
    
```

#### Test extension template only

```
                                                                              
    $  npm run test-extend
    
```

