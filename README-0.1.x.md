#  AM (async-methods)

>Asynchronous Swiss army-knife for wrapping generators and chaining any mix of asyncronous and synchronous processes 




```

	am([3, 4, 5]).filter(function* (elem, i) {
	
		// yielded async operation
    		return yield Promise.resolve(4 * i > elem);
	
	}).log();
  	
	// 5
  	
```

## Changes in version 0.1.0


[changes.MD](https://github.com/ingenious/async-methods/blob/master/changes.MD)


## How it works

#### 1. Harnessing the flexibity of ES6 generators
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

```
                                                                                                                                
	"async-methods":"^0.1.0"
```

In console

```
                                                         
	> npm install --save async-methods
```
In code

```
                                                         
	let am=require('async-methods');
```
## Wrapping

*Normal entities*

**am([3,4,5])** => Extended Promise that returns an array.

synchronous

```
                                                         
   am([3, 4, 5]).mapFilter(function (value, i) {

     return 2 * value + i;
   
   }).log('array wrapper);

   //  array wrapper [15ms] [ 6, 9, 12 ]​​​​​

```
asynchronous

```
                                                         
   am([33, 4, 555]).wait(200).filter(function* (value) {
   
     return yield am.resolve(4 - value);
   
   }).log('filter asyncronous,');

   // ​​​​​filter asyncronous, [204ms] [ 33,  555 ]​​​​​

```
```
                                                         
   am(4).timeout(200).filter(function* (value) {
   
      return yield am.resolve(4 - value);
   
   }).log('filter asyncronous non-object');

   // filter asyncronous non-object [204ms]  null

```
**am({a:3})** => Extended Promise that returns an object.

```
                                                         
   am({ a: 34, b: 56, c: 78})
   
   .forEach(function (value, attr) {

       console.log(value, attr);// a 34 b 56 c 78

    }).log();

```

**am(iterator)**  => Extended Promise which returns the result of the iterator 

```
                                                         
   am(function*(a,b){
      a+=b;
      return yield a;
    }(45,55))
    .log('iterator');
    
    // iterator 100
```
[Iteration protocols](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Iteration_protocols)

**am(&lt;boolean | string | null&gt;)** => Extended Promise that returns entitity

```
                                                         
   am(true).filter(function*(value){
     return value;
   }).log('other')

// 'other' true
```
                                                         

*Entities with asynchronous returns*

**am(function(&lt;args&gt;, callback){ ... },&lt;args&gt;)** => Extended Promise that returns arguments of the callback and passes any err to a **.error(fn)**  or **.catch(fn)** at end of the chain.

```

                                                         
   am(fs.readFile, __dirname + '/am.js')
  
     .then(function (content) {
     
        return content.toString().substr(-5);
     
     })
     
     .log('function with callback');

    // function with callback '= am';​​​​​
```

**am(generator)**  => returns Extended Promise (in same way as to 'co')

```
                                                         
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

```
                                                         
   am(Promise.resolve([45,67]))
    
      .map(function(item){
    
        return item/10;
    
  }).log('wrap promise')

   // logs
   // wrap promise  [ 4.5, 6.7 ]​​​​​

```

**am.sfFn(function(<args>,successFn, errorFn,&lt;args&gt;)** =>Extended Promise that returns arguments of the success callback and passes and argument of the error function to a **.error(fn)**  or **.catch(fn)** at end of the chain.
**WRAP a success/failure function**
```
                                                         
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
**am(<Extended Promise>)** => identity

## Methods

> In all cases **fn** can be a **generator** or a normal function (for analagous synchronous operation)

*tolerant*  argument allows for the map or filter to complete even if there is an error

*Returning a chainable Extended Promise*


### .map(fn,tolerant)

*fn can be a normal function (synchronous operations) or a generator (asynchronous operations)*

equivalent to <array>.map().  If the previous stage of the chain resolves to an *array* or *object*, ecah element of the array or object is replaced with the returned result of the function or generator

```
                                                         
am(Promise.resolve([45, 67]))
  .map(function (item) {
    return item / 10;
  }).log('map Promise result')

// logs
// map Promise result  [ 4.5, 6.7 ]​​​​​

```

### .filter(fn, tolerant)

*fn can be a normal function (synchronous operations) or a generator (asynchronous operations)*

*Filter can be applied to objects and other entitites as well as arrays

```
                                                         
am(7).filter(function (value) {
  return 7 - value;
}).log();

// logs
// null

```

```
                                                         
am(7).filter(function* (value) {
  return yield(8 - value);
}).log();

// logs
// 7

```
*filter object*

```
                                                         
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


```
                                                         
am([3, 4, 5]).mapFilter(function (value, i) {
  let a= 2 * value + i;
  return a > 6 ? a :false;
}).log('mapfilter');

\\ logs 
\\   mapfilter [ 9, 12 ]​​​​​

```

### .forEach(fn)

*fn can be a normal function (synchronous operations) or a generator (asynchronous operations)*

forEach returns an extended Promise resolving to the initial array or objectx


*synchronous*

```
                                                         
am([34, 56, 78]).forEach(function (value, i) {
  console.log(value, i);
}).log();

// logs
//  34 0
//  56 1 
//  78 2
//  [34, 56, 78]

```


*asynchronous*

```
                                                         
am([34, 56, 78]).forEach(function* (value, i) {
  console.log(yield am.resolve(2 * value),i);
}).log();

// logs
//  68 0
// 112 1
// 156 2


```
*object*

```
                                                         
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

### .timeout(ms)

```
                                                         
    am.waterfall([
      am.resolve(999).timeout(2000),
      am.resolve(8).timeout(1000)
    ])
    .log('waterfall');

    // logs
    //  ​​​​waterfall [2002ms] [ 999, 8 ]​​​​​

```

### .wait(ms) (*identical to timeout*)
```
                                                         
      am.sfFn(sf, 1).wait(3000).log('wait');
      
      // logs
      // ​​​​​wait [3003ms] 1​​​​​
```
### .log(<success label>[,<error label>[,Error()]])

*Adding Error() as last attribute will allow log to add the line number
and filename to log of success values as well as errors

  am.sfFn(sf, 1).wait(3000)
    .log('with line no. ', Error());

​ ​​​​ // logs
  // ​​​​​with line no.   line 12  of async-methods/test-4.js 1​​​​​

### .error(fn)

Similar to <Promise>.catch() but by default it is 'pass-through' ie if nothing is returned - the next stage in the chain will receive the same result or error
passed to error(fn).  fn can also be a normal function or a generator allowing
a further chain of asyncronous operations.

If the function or generator returns something other than undefined or an
error occurs that result or error will be passed to the enxt stage of the chain.

```
                                                         
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


```
                                                         
### .promise() 
Converts an Extended Promise to a normal promise (with methods catch and then)
```
                                                         
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

Identical to **<Promise>.then() but returns an Extended Promise.
If want **fn** to be a generator use **.next()**

### .catch(fn)

Identical to **<Promise>.catch() but returns a chainable Extended Promise.
If want **fn** to be a generator use **.error()**

## Extensions 

>All extension methods return a chainable Extended Promise

*async module replacement*

#### am.waterfall([&lt;am-able>,&lt;am-able>,..])

```
                                                         
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

```
                                                         
   am.parallel([Promise.resolve(45), Promise.resolve(67)])
   
   .log('parallel');

   // logs
   // ​​​​​parallel [ 45, 67 ]​​​​​

```

#### am.forEach(array,fn) 
where fn is either a function that accepts a callback, or a generator
```
                                                         
   am.forEach([3, 4, 5], function (value, cb) {
     cb(null, 2 * value);
   }).log('sync forEach test result');

   

   am.forEach([3, 4, 5], function* (value) {
     return yield Promise.resolve(2 * value);
   }).log('async forEach test result'); 

```


*Promise method equivalents*

These methods have same functionality as their Promise equivalents but return a chainable Extended Promise rather than a normal Promise

#### am.resolve(value)

```
                                                         
   am.resolve(Promise.resolve(67))

     .then(function () {
        console.log(arguments[0]);
    });

    // logs
    // 67

```
#### am.reject(err)

```
                                                         
   am.reject({message:'no result'})
   
   .catch(function(err){

     console.log(err);

   })
   // logs
   // ​​​​​{ message: 'no result' }​​​​​

```


#### am.all([&lt;am-wrappable>,&lt;am-wrappable>,..])

*am.all()* can wrap an object as well as an array and the elements of the array or object don't have to be Promises they can be anyhting that **am** wraps 
```
                                                         
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
```
                                                         
   am.race({
   
     a: Promise.resolve(56),
     b: 45
   
   }).log('race')

// logs
// race 45

```

## Tests

There are 130 automated functional tests

```
    $  npm test

```



