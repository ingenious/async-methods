'use strict';


let // co = require('co'),
  am = require('./am.js');



// fs = require('fs-extra'),
// co = require('co'),
// timer = +new Date();
let anArray = [2, 3, 6],
  anObject = {
    a: 2,
    b: 3,
    c: 6
  };
am(5).forEach(function* (elem) {

  // async
  return yield Promise.resolve(elem + 2);
}).log();

am(anObject).forEach(function* (elem) {

  // async
  //return 
  yield Promise.resolve(elem + 2);
}).forEach(function (elem, attr) {

  // sync
  return elem.toString() + attr;
}).log(Error());


am(anArray).forEach(function* (elem, i) {

  // async
  return yield Promise.resolve(elem + 2 * i);
}).forEach(function (elem, i) {

  // sync
  return elem + i;
}).log();

// iterator as argument
(function () {
  am(arguments).wait(2000).log();
})(3, 4);

am(true).forEach(function (value) {
  return value ? 44 : 777;

}).log();

// filter async

am([3, 4, 5])
  .filter(function* (elem, i) {
    return yield Promise.resolve(4 * i > elem);
  }).log();


am.forEach([3, 4, 5], function (value, cb) {
  cb(null, 2 * value);
}).log('sync forEach test result');

// ​​​​​forEach test result (3ms)  [ 6, 8, 10 ]​​​​​

am.forEach([3, 4, 5], function* (value) {
  return yield Promise.resolve(2 * value);
}).log('async forEach test result');