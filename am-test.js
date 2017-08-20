// Aysnc Methods test cases

'use strict';


let am = require('./am.js'),
  fs = require('fs-extra'),
  timer = +new Date();
let anArray = [2, 3, 6];

// am a function with callback
am(fs.readFile, __dirname + '/am.js')

  .then(function (content) {
    return content.toString().substr(-5);
  }).log('function with callback');

// am an array or object
am(anArray)
  .timeout(1000)
  .next(function* (r) {
    return yield Promise.resolve([r[1], 99]);
  }).log('28. ')

  // check end of chain
  .then(function (result) {
    console.log('32. Generator resolves with ', result, ' after ', (+new Date() - timer) + ' ms');
  }).catch(function (err) {
    console.log(34, 'Generator errors with', err);
  });

let aPromise = new Promise(function (resolve) {
  resolve('this is a result');
});
// am a Promise
am(aPromise)
  .timeout(2000)

  // check end of chain
  .then(function (result) {
    console.log('18. Generator resolves with ', result, ' after ', (+new Date() - timer) + ' ms');
  }).catch(function (err) {
    console.log(20, 'Generator errors with ', err);
  });

// am an am
am(am(anArray))
  .next(function* (r) {

    return yield Promise.resolve([r[1], 99]);
  }).error(function (err) {
    console.log(58, err);
  })

  // check end of chain
  .then(function (result) {
    console.log('61. Generator resolves with ', result, ' after ', (+new Date() - timer) + ' ms');
  }).catch(function (err) {
    console.log(63, 'Generator errors with', err);
  });

// am a generator
am(function* () {
  return yield Promise.resolve(34);
}).log(Error(), '70').then(function (result) {
  console.log(74, result);
}).catch(function (err) {
  console.log(76, 'Generator errors with', err);
});

let sf = function (a, success, fail) {
  if (a < 10) {
    success(a);
  } else {
    fail('too big');
  }
};
// am a success/failure function
sf(14, function (result) {
  console.log(81, 'success', result);
}, function (err) {
  console.log(83, 'fail', err);
});


// test chaining with next
am(Promise.resolve(45))
  .next(function (r) {
    console.log(90, r);
  }).next(function (r) {
    console.log(70, r);
  }).next(function (r) {
    console.log(98, r);
  });

am.sfFn(sf, 1).next(function (r) {
  console.log(r);
});

// check log works immediately
am.sfFn(sf, 1)
  .log('logged');

// am.reject

am.reject({
  a: 3
}).log();


// am. resolve
am.resolve({
  a: 3
}).then(function (err) {
  console.log(120, err);
});


// am.all()

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

am(function (cb) {
  setTimeout(function () {
    cb(6);
  }, 1000);
}).then(function (r) {
  console.log(143, r);
}).catch(function (e) {
  console.log(145, e);
});

am.resolve(function* () {
  return yield 56;
}).log('resolve 159')

am.resolve(Promise.resolve(67)).then(function () {
  console.log(arguments[0]);
});