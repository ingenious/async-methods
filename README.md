# async-methods (am)

> * Aids developer productivity by producing async processes within applications that are robust and with clear logic 
>
> * Eliminates indenting from complex async handlers making them easier to read and maintain
>
> * Supports **async functions /await**, **generators /yield** and **ES6 classes** for async operations
>
> * Extensible.  can add additional *Extended Promise* methods
>
> * am.js is one file with no dependencies, 235 unit and functional tests covering all use cases

Gitter now available for questions/support/suggestions on **async-methods** [gitter](https://gitter.im/ingenio-us-npm-packages/Lobby)

## Changes in version 1.0.0

Additional support added for async functions.  They can now be wrapped in same way as generators eg am(async function( .. ){ .. }) or am (async ( .. )=>{ .. })

async keyword can now be used in .next(fn), .error(fn), .mapFilter(fn), .map(fn), .filter(fn), .forEach(fn), .twoPrev(fn) and .threePrev(fn).  The await keyword can be used similarly to yield

Arrays and objects of async functions can be used in am.waterfall(), am.all(), am.parallel(), am.forEach()


##  README for version 0.1.x

[README-0.1.x.md](https://github.com/ingenious/async-methods/blob/master/README-0.1.x.md)

##  README for version 0.2.x

[README-0.2.0.md](https://github.com/ingenious/async-methods/blob/master/README-0.2.0.md)


## How it works

### Wrapping

am() can be used to wrap various types of entities such as generators, classes, promises, functions-with-callback etc. to generate an *Extended Promise*.  Every *Extended Promise* has the same set of chainable methods available to manipulate the resolved and/or rejected values
	
   *Chainable methods*

   - [**next**(&lt;fn | async fn | generator | (methodName,class)&gt;)](#next)
   - [**error**(&lt;fn | async fn | generator | (methodName,class)&gt;)](#error)
   - [**forEach**(&lt;fn | async fn | generator | (methodName,class)&gt;)](#foreach)
   - [**map**(&lt;fn | async fn | generator | (methodName,class)&gt;)](#map)
   - [**mapFilter**(&lt;fn | async fn | generator | (methodName,class)&gt;)](#mapfilter)
   - [**filter**(&lt;fn | async fn| generator | (methodName,class)&gt;)](#filter)
   - [**twoPrev**(&lt;fn | async fn | generator | (methodName,class)&gt;)](#twoprev)
   - [**threePrev**(&lt;fn | async fn | generator | (methodName,class)&gt;)](#threeprev)
   - [**prev**()](#prev)

   More: [.log()](#log), [.wait()](#wait), [.timeout()](#timeout), [.promise()](#promise) 

*Wrapping options*

   a. [am(&lt;**promise**&gt;)](#wrap-promises)  creates *ExtendedPromise* resolving to resolved value of input Promise or rejecting to rejected value of input Promise

   b. [am(&lt;**async function**&gt;)](#wrap-async-function)  creates *ExtendedPromise* resolving to returned value of async function or rejecting to any error occuring during the function.  Optional argunents can be added which are applied to the function when invoked. 

   
   c. [am(&lt;**generator**&gt;)](#wrap-generator)  creates *ExtendedPromise* resolving to returned value of input generator after any yield statements are resolved.  Any thrown errors values are rejected.  Optional argunents can be added which are applied to the generator when invoked. 
 
   d. [am(&lt;**function with callback argument**&gt;)](#wrap-function-with-callback)  creates *ExtendedPromise* resolving to returned value of callback or rejecting to error value in callback
    
   e. [am(**methodName**, &lt;**Class**&gt;)](#wrap-es6-class-with-methods) creates *ExtendedPromise* resolving to returned value of async method, generator method, or synchronous method, in anonymous or named class. Any thrown errors values are rejected to end of chain.   Optional argunents can be added which are applied to the function before the callback when invoked. 
   
   f. [am(**methodName**, new &lt;Class&gt;(arg))](#wrap-newed-class)  creates *ExtendedPromise* resolving to returned value of async method, generator method, or synchronous method, in new'ed anonymous or named class.  Any thrown errors values are rejected to end of chain
   
   g. [am(&lt;**Iterator**&gt;)](#wrap-iterator)  creates *ExtendedPromise* resolving to returned value of iterator (eg executed generator)
   
   h. [am(&lt;**boolean | number | string | array | object**&gt;)](#wrap-entities)  creates *ExtendedPromise* resolving to entity  
   
   i. [am.fn(&lt;**function without callback**&gt;,**args...**)](#wrap-no-callback-function)  creates *ExtendedPromise* resolving to returned value of function with args applied.  Any thrown errors values in function are rejected to end of chain
   
   j. [am.sfn(&lt;**function with success/fail callbacks**&gt;,args..)](#wrap-function-with-success-fail-callbacks)  creates *ExtendedPromise* resolving to returned value of success callback or rejecting to returned value of fail callback when provided arguments applied.

   k. [am(&lt;**Extended Promise**&gt;)](#wrap-extendedpromise)  creates identity
   
   l. [am.resolve(&lt;**entity**&gt;)](#wrap-resolve)  creates *Extended Promise* resolving to entity 
   
   m. [am.reject(&lt;**entity**&gt;)](#wrap-reject)  creates *Extended Promise* rejecting to entity 

More:    [am.all(&lt;**array or object of promises or generators**&gt;)](#wrap-all), [am.race(&lt;**array or object of functions-with-callback, promises or generators**&gt;)](#wrap-race), [am.forEach(&lt;**array or object of functions-with-callback, promises or generators**&gt;)](#wrap-foreach), [am.parallel(&lt;**array or object of functions-with-callback, promises or generators**&gt;)](#wrap-parallel), [am.waterfall(&lt;**array or object of functions-with-callback, promises or generators**&gt;)](#wrap-waterfall)

## Installation

[async-methods on npm](https://www.npmjs.com/package/async-methods)

See also  [api-responder on npm](https://www.npmjs.com/package/api-responder) [am-methods on npm](https://www.npmjs.com/package/am-methods)

In package.json

```javascript
                                                                                                                                                                                                   
	"async-methods":"^1.0.1"
	
```

In console

```
                                                                              
	$ npm install async-methods -P
  
```

In code

```javascript
                                                                                      
	let am=require('async-methods');
  
```

## Node versions and support for async/await

**async/await** is only available from version 7.6 of node.js.  If you are using an earlier version you will not be able to use the async/await features of **async-methods**.  **async-methods** will still work for wrapping generators and classes with normal functions and generator functions in versions earlier than 7.6.

Generators have been supported in nmodejs since at lease version 4.8.7

## Handling Promise rejections

NodeJS requires all rejections in a Promise chain to be handled or an exception is thrown.
When creating chains with **am** and *ExtendedPromise* methods always have an 

```javascript
	  .error(err=>{
	
	  }) 
``` 
or 

```javascript
	  .catch(err=>{
	
	  })  
```
	  
at the end of the chain (see examples below).  That way errors will be trapped and not cause exceptions
	
## Wrapping

### Wrap async function

#### am(async fn)  

Creates *ExtendedPromise* 


```javascript
                                                                                      
    
     am(async function(arg) {
       return await Promise.resolve({ a: 23864-arg })
     },4) // any extra arguments are applied to function
    .then(r => {
      console.log(r) //  { a: 23860 })
   
    })
    .error(err => {
       //handle error at end of chain
       console.log(err)
   
      })
    
  
```

### Wrap ES6 Class with methods

#### am( methodName , class { methodName { ... }}, args ...)

```javascript
                                                                                      
     am(56)
        .next('test', class {
            async test(value) {
              return await Promise.resolve(89 + (value || 0))
            }
          })
        
        .log()    //  145
        
        .error(err => {
			// handle errors at end of *ExtendedPromise* chain
          
        })
  
```

```javascript
                                                                
                                                                
let ep =  am(
        'test',
        class {
          async test() {
            return await Promise.reject({ e: 567 })
          }
        }
      )
        .next(r => {
        
        // Extended Promise rejects
          
        })
        .error(err => {
           console.log(err) // { e: 567 }
          
        })
    
``` 

### Wrap Newed Class

#### am(methodName, new class <name> {methodName (){}}(),args..)
                                                                                                                                
```javascript

    let ep = am(
        'test',
        new class {
          async test(value) {
            return await Promise.resolve(56 + (value || 0))
          }
        }(),
        54
      ).next(r => { 
      
        console.log(r) // 110
      }).error(err=>{
      
      		// handle errors at end of chain
      
      })

```

### Wrap Entities

#### am([3,4,5]) 

Create *ExtendedPromise* that returns an array.



```javascript
                                                                                      
   am([3, 4, 5]).mapFilter(function (value, i) {

     return 2 * value + i
   
   })
   .log('array wrapper') //  array wrapper [15ms] [ 6, 9, 12 ]​​​​​
   .error(err=>{
      		// handle errors at end of chain  
    
    })

```


```javascript
                                                                                      
   am([33, 4, 555])
   
   .wait(200)
   
   .filter(function* (value) {
   
     return yield am.resolve(4 - value);
   
   })
   
   .log('filter asyncronous,')  // ​​​​​filter asyncronous, [204ms] [ 33,  555 ]​​​​​
   
   .error(err=>{
      
      		// handle errors at end of chain
      
      })
  
```



##### Evaluate arrays and objects of async functions (or other types of asynchronous oeprations)

If the async function returns an array or object of async functions, Promises, functions with callback, generators thay are evaluated in the resolved response

```javascript
                                                                                      
   am(async function () {
      return {
        b: async function(){ return 'bb'},
        a: {
           b: async function(){ return 'bb'},
           a: {
              b: async function(){ return 'bb'},
              c: async function(){ return 'cc'},
             }
            }
        };
    })
    .log()   // { b: 'bb', a: { b: 'bb', a: { b: 'bb', c: 'cc' } } }​​​​​  
    .error(err=>{
      		// handle errors at end of chain
      
     })

  
  
```

### Wrap generator

#### am(generator)  

Creates *ExtendedPromise* (in same way as to 'co')

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
    
    })
    
    .log()
    
    // logs: 
    // yield object with async attributes { b: 'bb', a: { b: 'bb', a: { b: 'bb', c: 'cc' } } }​​​​​  
    
    .error(err=>{
      
      		// handle errors at end of chain
      
     })

  
  
```

#### Wrapping non-object

```javascript
                                                                                      
   am(4)
   .timeout(200)
   .filter(function* (value) {
   
      return yield am.resolve(4 - value);
   
   })
   
   .log('filter asyncronous non-object')  // filter asyncronous non-object [204ms]  null
   
   .error(err=>{
      
      		// handle errors at end of chain
      
      })
  
```

#### am({a:3}) 

Creates= *ExtendedPromise* that returns an object.

```javascript
                                                                                      
   am({ a: 34, b: 56, c: 78})
   
   .forEach(function (value, attr) {

       console.log(value, attr);// a 34 b 56 c 78

    })
    .error(err=>{
      
      		// handle errors at end of chain
      
    })
  
```

#### am(&lt;boolean | string | null&gt;)

Creates *ExtendedPromise* that returns entitity


```javascript
                                                                                      
   am(true).filter(function*(value){
     return value;
   })
   
   .log('other')  // 'other' true
   
   .error(err=>{
      
      		// handle errors at end of chain
      
   })
  
```


### Wrap Iterator

#### am(iterator)  

Creates *ExtendedPromise* which returns the result of the iterator 

```javascript
                                                                                      
   am(function*(a,b){
      a+=b;
      return yield a;
    }(45,55))
    
    .log('iterator')  // iterator 100
    
    .error(err=>{
      
      		// handle errors at end of chain
      
      })

```

### Wrap Function-with-callback

#### am(function(&lt;args&gt;, callback){ ... },&lt;args&gt;)

Creates *ExtendedPromise* that returns arguments of the callback and passes any err to a **.error(fn)**  or **.catch(fn)** at end of the chain.

```javascript
                                                                                      
   am(fs.readFile, __dirname + '/am.js')
  
     .then(function (content) {
     
        return content.toString().substr(-5);
     
     })
     
     .log('function with callback');   // function with callback '= am';​​​​​
     
     .error(err=>{
      
      		// handle errors at end of chain
      
      })
  
```

### Wrap Promises

#### am(&lt;Promise&gt;)

Creates *ExtendedPromise*

```javascript
                                                                                      
   am(Promise.resolve([45,67]))
    
      .map(function(item){
    
        return item/10;
    
   })
   .log('wrap promise')

   // logs
   // wrap promise  [ 4.5, 6.7 ]​​​​​
   
   .error(err=>{
      
      		// handle errors at end of chain
      
    })
  
```

### Wrap Function with Success-Fail callbacks

#### am.sfFn(function(<args>,successFn, errorFn,&lt;args&gt;)

returns Extended Promise that returns arguments of the success callback to **next()** or **then()** and passes the argument of the error function to a **.error(fn)**  or **.catch(fn)** at end of the chain.


```javascript
                                                                                      
  let sf = function (a, success, fail) {
    if (a < 10) {
        success(a);
    } else {
        fail('too big');
    }
  }
 

  am.sfFn(sf, 14)
   
   .log('sfFn','err')   // err 'too big'
   
   .error(err=>{      
      		// handle errors at end of chain
      
   })

  am.sfFn(sf, 1)
  .next(function (r) {
  
     console.log(r) // 1
  })
  .error(err=>{      
      		// handle errors at end of chain
      
  })
  
```

### Wrap No-callback Function

#### am.fn(fn [, args...])

Creates *ExtendedPromise* resolving to result of a function without a callback argument when the arguments provided are applied.  If error thrown in execution of function error value is rejected to end of chain

In some ways it is a convenience method as could also use am(fn(args..)), that is execute the function first begote wrapping
its main benefit is that it provides error trapping within the function

```javascript
                                                                          
     let noCallback=(a, b) => {
        return a + b
      },
     ep = am.fn(noCallback,345,678)
         .next(r => {
            console.log(r) // 1023
       
         })
         .error(err=>{      
      		// handle errors at end of chain
      
         })

```

Wrapping a non-async function with no callback provides arror hadling within an ExtendedPromise chain

```javascript
                                                                          
     let noCallback=(a, b) => {
       throw 'Something wrong'
        return a + b
      },
     ep = am.fn(noCallback,345,678)
         .next(r => {
            console.log(r) // no log
       
         })
         .error(err=>{      
          // handle errors at end of chain
          console.log(err) // Something wrong
      
         })

```

### Wrap *ExtendedPromise*

#### am(&lt;Extended Promise&gt;) 

Creates identity (input *ExtendedPromise*)

## Methods

> In all cases **fn** can be a **generator** or a normal function (for analagous synchronous operation)  An ES6 Class (anon or nameed) can be used using syntax .next(methodName,class).  This gives access to ***async/await***

An optional *tolerant* argument can be used with .map() or .filter() or with .mapFilter() to ensure completion even if there is an error


### map

#### .map(fn,tolerant)

*fn can be a normal function (synchronous operations) or a async funtion or generator ot class (asynchronous operations)*

equivalent to <array>.map().  If the previous stage of the chain resolves to an *array* or *object*, each element of the array or object is replaced with the returned result of the function or generator

#### map with function (synchronous step)

```javascript
                                                                                      
am(Promise.resolve([45, 67]))
  .map(function (item) {
    return item / 10;
  })
  
  .log('map Promise result') // map Promise result  [ 4.5, 6.7 ]​​​​​
  
  .error(err=>{      
      		// handle errors at end of chain
      
  })
  
```
####  map with async function and await

```javascript
                                                                                      
am([4, 5, 6])
  .map(async function(value) {
    return await Promise.resolve(2 * value)
  })
  .map(function(value) {
    return 3 * value
  })
  .log() //  [24, 30, 36]

  .error(err => {
    // handle errors at end of chain
  })
  
```
####  map with anonymous class and async/await

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
        
        .error(err=>{      
      		// handle errors at end of chain
         })
  
```

### filter

#### .filter(fn, tolerant)

*fn can be a normal function (synchronous operations) or an async function or generator (asynchronous operations)   An ES6 Class (anon or named) can be used using syntax .filter(methodName,class).*

*Filter can be applied to objects and other entitites as well as arrays

#### filter with function (synchronous step)

```javascript
                                                                                      
  am(7).filter(function (value) {
    return 7 - value;
  })
  .log() // null
  .error(err=>{      
     // handle errors at end of chain
      
  })
  
```

####  filter with async function & await

```javascript
                                                                                      
am(7)
  .filter(async function(value) {
    return await (8 - value)
  })
  .log() // 7

  .error(err => {
    // handle errors at end of chain
  })
  
```

####  filter with generator/yield

```javascript
                                                                                      
  am(7).filter(function* (value) {
     return yield(8 - value);
  })
  
  .log() // 7
  
  .error(err=>{      
      		// handle errors at end of chain
      
  })
  
```

####  fiter with class

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
        
        .log()    // {b:5}
        
        .error(err=>{      
      		// handle errors at end of chain
      
        })
  
```

#### filter with object input

```javascript
                                                                                      
  am({
      a: 27,
      b: 78
  }).filter(function* (value, attr) {

    let a = yield Promise.resolve(value);
    return a > 50;
  })
  
  .log() //   { b: 78 }​​​​​
  
  .error(err=>{      
  		// handle errors at end of chain
      
  })
  
```

### mapFilter

#### .mapFilter(fn, tolerant)

Combines a map followed by a fiter using values returned from the map
If the mapping function for an element returns false, then the element is excluded from the result

*fn can be a normal function (synchronous operations) or an async function or generator (asynchronous operations).  An ES6 Class (anon or named) can be used using syntax .mapFilter(methodName,class).*


####  mapFilter with function (synchronous step)

```javascript
                                                                                      
     am([3, 4, 5])
       .mapFilter(function (value, i) {
         let a= 2 * value + i;
         return a > 6 ? a :false;
       })
       
       .log()     //   [ 9, 12 ]​​​​​
       
       .error(err=>{      
      		// handle errors at end of chain
      
       })
  
```

####  mapFilter with async function and await

```javascript
                                                                                      
am([4, 5, 6])
  .mapFilter(async function(value) {
    return value < 5 ? false : await Promise.resolve(2 * value)
  })
  .mapFilter(function(value) {
    return value === 10 ? false : 2 * value
  })
  .log() // [24]

  .error(err => {
    // handle errors at end of chain
  })
  
```

####  mapFilter with anonymous class

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
          })
        .log()  // [24]
        
         .error(err=>{      
      		// handle errors at end of chain
      
         })
  
```

### forEach

#### .forEach(fn)

*fn can be a normal function (synchronous operations) or an async function or generator (asynchronous operations). An ES6 Class (anon or named) can be used using syntax .forEach(methodName,class).*

forEach returns an extended Promise resolving to the initial array or object

#### forEach with function (synchronous step)

```javascript
                                                                                      
    am([34, 56, 78]).forEach(function (value, i) {
           console.log(value, i);
    })
    
    .log()  // 34 0, 56 1, 78 2, [34, 56, 78]
    
    .error(err=>{      
      		// handle errors at end of chain
      
    })
  
```

#### forEach with async function / await (asynchronous steps)

```javascript
                                                                                      
  am([34, 56, 78])
  .forEach(async function(value, i) {
    console.log(await am.resolve(2 * value), i)
     // logs: 68 0, 112 1, 156 2
  })
  .error(err => {
    // handle errors at end of chain
  })
```
  
#### forEach with generator/yield (asynchronous steps)

```javascript
                                                                                      
  am([34, 56, 78]).forEach(function* (value, i) {
     console.log(yield am.resolve(2 * value),i);
     // 68 0, 112 1, 156 2
  })
  
  
  
  .error(err=>{      
      // handle errors at end of chain
      
  })
  
```

#### forEach with class and async method / await

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
        
        .error(err=>{      
      		// handle errors at end of chain
      
       })
  
```

#### forEach with Object input

```javascript
                                                                                      
   am({
     a: 34,
     b: 56,
     c: 78
   })
   
   .forEach(function* (value, attr) {
        console.log(yield am.resolve(3 * value), yield am.resolve(attr));
		 // ​​​​​102 'a'​​​​​, 168 'b'​​​​​, 234 'c'​​​​​ 

   })
   
   .log() // { a: 34, b: 56, c: 78 }​​​​​
   
   .error(err=>{      
      		// handle errors at end of chain
      
       })
   
  
```
### next

#### .next(fn)

*fn can be a normal function (synchronous operations) or an async function or generator (asynchronous operations).  An ES6 Class (anon or named) can be used using syntax .next(methodName,class).*

#### next with async function and await

```javascript
                                                                                      
    am(56)
  .next(async value => {
    return await Promise.resolve(89 + (value || 0))
  })

  .log() //  145

  .error(err => {
    // handle errors at end of chain
  })
  
```
#### next with generator and yield

```javascript
                                                                                      
am(46)
  .next(function*(value) {
    return yield Promise.resolve(89 + (value || 0))
  })

  .log() //  135

  .error(err => {
    // handle errors at end of chain
  })

  
```

#### next with anonymous class

```javascript
                                                                                      
     am(56)
        .next('test', class {
            async test(value) {
              return await Promise.resolve(89 + (value || 0))
            }
          })
        
        .log()    //  145
        
        .error(err=>{      
      		// handle errors at end of chain
      
       })
  
```

#### next with named class

```javascript
                                                                                      
      let sample = class {
        async test(value) {
          return await Promise.resolve(89 + (value || 0))
        }
      }
      let ep = am(56)
        
        .next('test', sample)
        
        .log()   //145
        
        .error(err=>{      
      		// handle errors at end of chain
      
       })
  
```

#### next with newed Class

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
          
        })
        
        .error(err=>{      
      		// handle errors at end of chain
      
        })
  
```

### prev

#### .prev()

  returns *ExtendedPromise* resolving or rejecting per previous step in chain
  
The *ExtendedPromise* object keeps a reference to all previous states of the 
specific chain.  prev() uses this to allow the application logic to reverse the chain to previous states 

#### prev() after map()

```javascript
                                                                                      
                                                                                      
    let ep = am(function*() {
          yield Promise.resolve()
          return { a: 238 }
        })
        .map(function(value, attr) {
          return value * 2
        })
    
        .prev()
        
        .next(r => {
          console.log(r) // { a: 238 })
          
        })
        .error(err => {
          // handle errrors at end of chain
        })


```
#### prev() used twice


```javascript
                                                                                      
    let ep = am(function*() {
        yield Promise.resolve()
        return { a: 238, b: 56 }
      })
        .map(function(value, attr) {
          return value * 2
        })
        .filter(function(value, attr) {
          return attr === 'a' ? true : false
        })
        .prev()
        .prev()
        .next(r => {
          console.log(r) // { a: 238, b: 56 })
          
        })
        .error(err => {
          	// handle errors at end of chain
        })


```

#### prev() after map() and wait()

```javascript
                                                                                      
      let ep = am(function*() {
          yield Promise.resolve()
          return { a: 238, b: 56 }
        })
        .map(function(value, attr) {
          return value * 2
        })
        .wait(200)

        .prev()

        .next(r => {
          console.log(r) // { a: 238, b: 56 })
          
        })
        .error(err => {
          
        })

```


#### prev() after error()

```javascript
                                                                                      
 let ep = am.reject({ error: 89 })
 		  .error(()=> {
           return { b: 789 }
        })
      
        .prev()
        .error(r => {
          console.log(r) // { error: 89 })
          
        })

```    

### twoPrev

#### .twoPrev(fn)

*fn can be a normal function (synchronous operations) or an async function or a generator (asynchronous operations).  An ES6 Class (anon or named) can be used using syntax .twoPrev(methodName,class).*

#### twoPrev with function (synchronous step)

```
      let ep = am([5, 6, 7])
        .next(function(item) {
          return { a: 2 }
        })
        .next(function(item) {
          return { b: 3 }
        })
        .twoPrev((lastResult, previousResult) => {
        
        console.log(lastResult, previousResult)
          // { b: 3 } { a: 2 }

          
        })
        .error(err => {
          
        })

```
#### twoPrev with async function and await

```javascript
                                                                   
am(56)
  .next(function(item) {
    return { a: 2 }
  })
  .twoPrev(async function(value, previous) {
    console.log(value, previous) // { a: 2 } 56
    return await Promise.resolve(89 + (previous || 0))
  })
  .next(r => {
    console.log(r) //  145
  })
  .error(err => {
    // handle errors
  })                                                                       
    
  
```

#### twoPrev with anonymous class

```javascript
                                                                   
      let ep = am(56)
        .next(function(item) {
          return { a: 2 }
        })
        .twoPrev(
          'test',
          class {
            async test(value, previous) {
              console.log(value,previous) // { a: 2 } 56
              return await Promise.resolve(89 + (previous || 0))
            }
          }
        )
        .next(r => {
          console.log(r) //  145
          
        })
        .error(err => {
          // handle errors
        })                                                                          
    
  
```

#### twoPrev with named class

Illustrates **Asyncronous steps in ES6 Class** pattern

```javascript

   let ep,
        sample = class {
        
        	// async method
          async test(value) {
            return await Promise.resolve(89 + (value || 0))
          }
          
          // generator method
          *result(result, previous) {
           console.log(result, previous) // 145, 56
            
          }
        }
      ep = am(56)
      
        // adds result to chain
        .next('test', sample)  
        
        // result and previous passed to result method
        .twoPrev('result', sample)         
        
        .error(err => {
        	// handle errors  
        
        })
                                                                                      
       
```
#### twoPrev with generator


```javascript
                                                              
let ep = am([5, 6, 7])

		// add result to chain
        .next(function*(item) {
          return yield { second: 897 }
        })
        .twoPrev(function*(result, prev) {
          console.log(result, prev)  //{ second: 897 }  [5, 6, 7]
        })
      
        .next(result => {
          console.log(result) // [{ second: 897 }, [5, 6, 7]]
          
        })
        .error(err => {
          // handle errors
          
        })

```


#### twoPrev with newed Class

```javascript

   let ep, 
   sample = class {
 
       constructor(type) {
          this.type = type
       }
       
       async test(value) {
         return await Promise.resolve(89 + (this.type || 0) + (value || 0))
       }
       
       *result(r, p) {
         console.log(r, p) //  190, 56
       }
   },
 
   newed = new sample(45)

      ep = am(56)
        .next('test', newed)
        .twoPrev('result', newed)
        .next(result => {
          console.log(result)  // [190, 56]
          
        })
        .error(err => {
          // handle errors
          
        })
         
```


### threePrev

#### .threePrev(fn)

*fn can be a normal function (synchronous operations) or a generator (asynchronous operations).  An ES6 Class (anon or named) can be used using syntax .twoPrev(methodName,class).*

#### threePrev with function

```
      let ep = am([5, 6, 7])
        .next(function(item) {
          return { a: 2 }
        })
        .next(function(item) {
          return { b: 3 }
        })
        .threePrev((lastResult, previousResult, previous) => {
        
           console.log(lastResult, previousResult, previous)
           // { b: 3 } { a: 2 } [5,6,7]
        })
        
        .error(err => {
        	// hanlde errors at end of chain  
        })

```
#### threePrev with async function and await

```javascript
                                                                   
let ep = am(56)
  .next(function(item) {
    return { b: 3 }
  })
  .next(function(item) {
    return { a: 2 }
  })
  .threePrev(async function(value, previous, first) {
    console.log(value, previous, first) // { a: 2 } {b:3}  56
    return await Promise.resolve(89 + (first || 0))
  })
  .next(r => {
    console.log(r) //  145
  })
  .error(err => {
    // handle errors
  })

  
```



#### threePrev with anonymous class

```javascript
                                                                   
      let ep = am(56)
        .next(function(item) {
          return { b: 3 }
        })
        .next(function(item) {
          return { a: 2 }
        })
        .threePrev(
          'test',
          class {
            async test(value, previous, first) {
              console.log(value,previous) // { a: 2 } {b:3}  56
              return await Promise.resolve(89 + (first || 0))
            }
          }
        )
        .next(r => {
          console.log(r) //  145
          
        })
        .error(err => {
          // handle errors
        })                                                                          
    
  
```

#### threePrev with named class

Illustrates **Asyncronous steps in ES6 Class** pattern

```javascript

   let ep,
        sample = class {
        
        	// async method
          async test(value) {
            return await Promise.resolve(89 + (value || 0))
          }
          
          // generator method
          *result(result, previous, first) {
           console.log(result, previous, first) // 188, 99, 56
            
          }
        }
      ep = am(56)
      
      	  // add result to chain
        .next(r=>{
      		return 99;
        })
      
        // adds result to chain using named class
        .next('test', sample)  
        
        // result and previous passed to result method
        .threePrev('result', sample)         
        
        .error(err => {
        	// handle errors  
        
        })
        
    
                                                                                      
       
```
#### threePrev with generator


```javascript
                                                              
let ep = am([5, 6, 7])

		// add result to chain
        .next(r=>{
      		return 99;
        })

		// add result to chain
        .next(function*(item) {
          return yield { second: 897 }
        })
        .threePrev(function*(result, prev, first) {
          console.log(result, prev, first)  // { second: 897 } 99 [5, 6, 7]
        })
      
        .next(result => {
          console.log(result) // [{ second: 897 }, 99, [5, 6, 7]]
          
        })
        .error(err => {
          // handle errors
          
        })

```


#### threePrev with newed Class

```javascript

 let ep, 
 sample = class {
 
       constructor(type) {
          this.type = type
       }
       async test(value) {
         return await Promise.resolve(89 + (this.type || 0) + (value || 0))
       }
       
       *result(r, p, f) {
         console.log(r, p, f ) //  233, 99, 56
       }
 },
 
 newed = new sample(45)

      ep = am(56)
        
        // add results to chain
        .next(()=>{
      		return 99;
        })
        .next('test', newed)
        
        // invoke method with 3 previous resolved values
        .threePrev('result', newed)
        .next(result => {
          console.log(result)  // [233, 99, 56]
          
        })
        .error(err => {
          // handle errors
          
        })
            
```

### timeout

#### .timeout(ms)

```javascript
                                                                                      
    am.waterfall([
      am.resolve(999).timeout(2000),
      am.resolve(8).timeout(1000)
    ])
    
    .log() // [2002ms] [ 999, 8 ]​​​​​
    
    .error(err=>{      
      		// handle errors at end of chain
      
     })
  
```

### wait

*alias of .timeout()*

#### .wait(ms)

```javascript
                                                                                      
      am.sfFn(sf, 1).wait(3000)
      
      .log('wait')  // ​​​​​wait [3003ms] 1​​​​​
      
      .error(err=>{      
      		// handle errors at end of chain
      
       })

```
### log

#### .log(&lt;success label&gt;[,&lt;error label&gt;'[,Error()]])

*Adding* **Error()** *as last attribute will allow log to add the line number
and filename to log of success values as well as errors*

```javascript
                                                                                      
  am.sfFn(sf, 1).wait(3000)
    
    .log('with line no. ', Error());
    // ​​​​​with line no.   line 12  of async-methods/test-4.js 1​​​​​
  
    .error(err=>{      
      		// handle errors at end of chain
      
    })

```

### error

#### .error(fn)

Similar to <Promise>.catch() but by default it is 'pass-through' ie if nothing is returned - the next stage in the chain will receive the same result or error that was passed to error(fn).  

*fn can also be a normal function or an async function or  generator allowing a further chain of asyncronous operations.  An ES6 Class (anon or named) can be used using syntax .error(methodName,class).*

If the function or generator returns something other than undefined or an error occurs, that returned value or error will be passed to the next stage of the chain.



```javascript
                                                                                      
  am
  .waterfall({
    a: am.reject(88),
    b: function(result, cb) {
      result.f = 567
      cb(null, 444 + result.a)
    },
    c: function(result, cb) {
      cb(null, 444 + result.a + result.b)
    }
  })
  .error(function(err) {
    return am.reject(new Error('no good'))
  })

  .log('waterfall object', 'waterfall err') //logs:   ​​​​​waterfall err [Error: no good]​​​​​

  .error(err => {
    // handle errors at end of chain
  })



```

### promise
                                                                                  
#### .promise()

Converts an Extended Promise to a normal promise (with methods catch and then)


```javascript
                                                                                      
   am([2, 3, 4]).next(function () {}).log()
      
      .promise()
      
      // chain is now native promise
      .then(function (result) {
      
          console.log('Promise resolves with', result);
          // Promise resolves with [2,3,4]
          
      }).error(function (err) {
          
          // handle errors with catch() not error()
          console.log(err);
      });
   //logs
   
   
```
### then

#### .then(fn)

Similar to **<Promise>.then() but returns an Extended Promise.

Included a its an inherited method of Promise.  **.then()** does not conduct internal proerties of the chain
to the next stage So for example can't use twoPrev() after .then()


### catch

#### .catch(fn)

Identical to **<Promise>.catch()** but returns a chainable *ExtendedPromise*.

Included a its an inherited method of Promise.  **.catch()** does not conduct internal proerties of the chain
to the next stage So for example can't use twoPrev() after .catch() as previous resolved values from previous steps are lost
If used should be at end of chain.


#### Additional Arguments passed to class methods 

When wrapping a class and specifying a method name, arguments to be passed to the method can be added can be added as arguments of the wrappimg am().  The same is true for anonymous and named classes used as arguments to  

#### next(methodName,class,...) and error(methodName, class, ...)

  Additional arguments added to **next(methodName,class,...)** are **prepended** to the resolved result of previous step and appled as arguments to the method.  Thiis si useful if you don'tt want the result to be used by the method but wish to apply other arguments.

#### twoPrev(methodName,class,...), threePrev(methodName, class, ...)

  Additional arguments added to **twoPrev(methodName, class, ...)** are **appended** to the resolved result of previous two steps and appled as arguments to the method.  The main purpose of twoPrev is to pass two results to a method.  If additional arguments are required they can be added in this way.

  Additional arguments added to **threePrev(methodName, class, ...)** are **appended** to the resolved result of previous three steps and appled as arguments to the method.  The main purpose of threePrev is to pass three results to a method.  If additional arguments are required they can be added in this way.


### setClass

#### setClass (classReference,args..)

setClass() allows a reference class to be set for a sequence of steps using class methods in a promise chain


```javascript
                                                                                
  let testClass = class {
      constructor(aa) {
        this.aa = aa || 456
      }
      test24(arg) {
        return this.aa + 1 || 457
      }
      test44() {
        return 44
      }
      mapValues(value) {
        return 2 * value
      }
    }

      let chain = am([123, 456])
        .setClass(testClass, 456)
        .map('mapValues')
        .next(r => {
         console.log(r) // [246, 912])
        })
        .next('test24')
        .next(r => {
         console.log(r) // 457
        })
        .next('test44')
        .next(r => {
          console.log(r) // 44
        })
        .error(err => {
          console.log( err)
        })   
    })

```


### clearClass

#### clearClass ()

clearClass() clears a reference class for subsequent steps in a chain


```javascript
                                                                                                     
        .setClass(testClass, 456)

        .map('mapValues')
        .next(r => {
         console.log(r) // [246, 912])
        })
        .clearClass()

        // as there is no reference class 'test24' is treated as a string not a methodName
        // a string as an argument returns previous resolved result (like <promise>.then(<string>))
        .next('test24')
        .next(r => {
          console.log(r) // [246, 912])
        })
        .error(err => {
          console.log(err)
        
        })
```


<hr/>

## Static methods

>All static methods return a chainable Extended Promise

### Wrap waterfall

#### am.waterfall([&lt;am-able&gt;,&lt;am-able&gt;,..])

am.waterfall takes an array of async functions, generators, functions with callbacks and promises and resolves in turn

The previous resolved values in the sequence are applied as arguments to any async functions, generators or functions with callback

am.waterfall can also evaluate an object of async functions.  In this case a cumulative object of resolved values so far in the sequence is passed to each async function, generator or function with callback as first argument

#### am.waterfall with object of async functions

```javascript
                                                                  
    let ep = am.waterfall([
        async function() {
          return yield 23864
        },
        async function(first) {
          return yield 563728
        },
        async function(first, second) {
          return yield first + second
        }
      ])
    
      .next(r => {
         
         console.log(r)  // [23864, 563728, 587592]
            
      })
      
      .error(err => {
            
      })


#### am.waterfall with array of generators

```javascript
                                                                  
    let ep = am.waterfall([
        function*() {
          return yield 23864
        },
        function*(first) {
          return yield 563728
        },
        function*(first, second) {
          return yield first + second
        }
      ])
    
      .next(r => {
         
         console.log(r)  // [23864, 563728, 587592]
            
      })
      
      .error(err => {
            
      })

```
#### am.waterfall with array of functions with callbacks (caolan/async replacement)

```javascript

let ep = am.waterfall([
        function(cb) {
          cb(null, 23864)
        },
        function(first, cb) {
          cb(null, 563728)
        },
        function(first, second, cb) {
          cb(null, first + second)
        }
      ])
      
      .next(r => {
            console.log(r) // [23864, 563728, 587592]
      })
          
     .error(err => {
     	// handle errors at end of chain
     
     })
          

```

#### am.waterfall with object of async functions (cumulative result object passed to each stage)

```javascript
                                                                             
 let ep = am.waterfall({first:
        function*() {
          return yield 23864
        },
       second: function*(cumulative) {
          return yield 563728
        },
       third: function*(cumulative) {
        
          return yield cumulative.first + cumulative.second
        }
    })
    
      .next(r => {
         
         console.log(r)  // ​​​​​{ first: 23864, second: 563728, third: 587592 }​​​​​
            
      })
      
      .error(err => {
            
      })

#### am.waterfall with object of functions with callbacks and handling of stage errors

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
  })
  
  .error(function (err) {
    console.log(err) // 88
    return am.reject(new Error('no good'));
  })
  
  .log('waterfall object', 'waterfall err') // ​​​​​waterfall err [Error: no good]​​​​​
  
  .catch(err=>{
  
  	console.log(err) // [Error: no good]
  })
  

```

### Wrap parallel

#### am.parallel([&lt;am-able&gt;,&lt;am-able&gt;, ..])

```javascript
                                                                                      
   am.parallel([Promise.resolve(45), Promise.resolve(67)])
   
   .log('parallel')  //  ​​​​​parallel [ 45, 67 ]​​​​​
   
   .error(err=>{      
      		// handle errors at end of chain
      
    })
   
   


```
#### Wrap forEach

#### am.forEach(array) 

Executes an array or object of async functions, generators, functions with callbacks or promises and returns a corresponding
array or object of resolved values

The index of the array position or attribute of the object position is applied to the first argument of any async function, generator or function with callback

```javascript
                                                                                      
  am
  .forEach([
    Promise.resolve(3),
    
    function(i, cb) {
      cb(null, 4)
    },
    
    async i => {
      
      return await 3+i
    },
    
    function*(i) {

      return yield 2*i
    }
  ])

  .log() // ​​​​​[ 3, 4, 5 ]​​​​​

  .error(err => {
    // handle errors at end of chain
  })


```
#### am.forEach() with object

```javascript
am
  .forEach({
    promise: Promise.resolve(3),

    callback: function(attr, cb) {
      cb(null, 4)
    },
    
    asyncFn: async attr => {
      return await 5
    },
    
    generator: function*(attr) {
      return yield 6
    }
  })

  .log() // ​​​​​​​​​​{ promise: 3, callback: 4, asyncFn: 5, generator: 6 }​​​​​

  .error(err => {
    // handle errors at end of chain
  })


```

### Promise method equivalents

These methods have same functionality as their Promise equivalents but return a chainable Extended Promise rather than a normal Promise

### Wrap resolve

#### am.resolve(value)

```javascript
                                                                                      
   am.resolve(Promise.resolve(67))

    .then(function () {
        console.log(arguments[0]) // 67
    })
    
    .error(err=>{      
      		// handle errors at end of chain
      
    })

```

### Wrap reject

#### am.reject(err)

```javascript
                                                                                      
   am.reject({message:'no result'})
   
   .error(function(err){

     console.log(err) // ​​​​​{ message: 'no result' }​​​​​

   })
      

```
### Wrap all

#### am.all([&lt;am-wrappable>,&lt;am-wrappable>,..])

*am.all()* can wrap an object as well as an array. The elements of the array or object can be async methods, generators, promises or functions with callbacks.  Unlike am.forEach(), no index or attribute name is applied to functions


```javascript
                                                      
 am.all({
    a: async function() {
      return await 23864
    },
    b: async function() {
      return await 563728
    }
  })
  .next(r => {
    console.log(r) // { a: 23864, b: 563728 })
  })
  .catch(err => {
    console.log(err)
  })


```


#### am.all with array of functions with callbacks and handling of rejection in stage

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
   ])
   
   .next(function (r) {
     // rejected Promise means the array rejects
     
   })
   
   .error(function (err) {
     console.log(err) // 56
   });




```
### Wrap race

#### am.race([&lt;am-wrappable&gt;,&lt;am-wrappable&gt;,..])

*am.race()* can wrap an object as well as an array and the elements of the array or object don't have to be Promises they can be anyhting that **am** wraps

```javascript
                                                                                      
  am.race({
   
     a: Promise.resolve(56),
     b: 45
   
   })
   
   .log('race')   // race 45
   
   .error(err=>{      
      		// handle errors at end of chain
      
    })
   


```


##  Utility methods

-  am.isPromise(entity)
-  am.isGenerator(entity)
-  am.isNextable(entity) 
-  am.isIterable(entity) 
-  am.isObject(entity)
-  am.isArray(entity)
-  am.isClass(entity)
-  am.isAsyncFunction(entity)

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

###  async-methods Extensions

Developerts can roll-their-own Extended Promise, adding more methods or changing functionality of exiting methods!
See ***am-sample-ext.js*** and check out this Mongo extension:  [am-mongo](https://github.com/ingenious/am-mongo)

In application code, **async-methods (am)** can be extended progressively using **am.extend()** static mmthod.  Some new standard extensions are due for release soon, but applicastion developers can create their own and reference them by a filepath as well as by an npm module name.

```javascript
                                                                
    let am = require('am-mongo')
    
    am.extend(['../../am-axios.js', '../../am-cron.js'])

    // as well as additional am.xxx() static methods
    // am with now be extended with am-mongo, am-axios and am-cron methods available in the chain

```

This would have the same effect:

```javascript
                                                                
    let am = require('async-methods')
    
    am.extend(['am-mongo','../../am-axios.js', '../../am-cron.js'])

    // am with now be extended with am-mongo, am-axios and am-cron methods available in the chain
    // as well as any additional am.xxx() static methods

```

A single extension can be specified also


```javascript
                                                                
    let am = require('async-methods')
    
    am.extend('am-mongo')

    // am with now be extended with am-mongo, methods available in the chain
    // as well as additional am.xxx() static methods

```


###  am._extend(ExtendedPromise)
####  For use internally in creating an extension

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

