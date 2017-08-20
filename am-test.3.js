'use strict';

// .if(fn,fn) or .if(fn).next() .elseif(fn,fn) or .elseif(fn).next() .else(fn) or .else().next()  .while(fn,fn) or .while(fn).next()
// .do(fn) .. until(fn)  .interval(fn,n)  or interval(n)
// .extend()  .clone()  .repeat(fn,n)  .pickBy()
// .toJSON  .toObject .toString()?
// sync attribute : true|false?

let am = require('./am.js');



//==========================================================

//  Tests

//==========================================================

// console.log(am.isNextable([4, 5]));

//==========================================================

am.waterfall(
  [am.resolve(999).timeout(2000),
    am.resolve(8).timeout(1000)
  ]).log('waterfall');

am(function* () {
  return yield am(4);
}).log(483);

am([3, 4, 5]).mapFilter(function (value, i) {
  return 2 * value + i;
}).log(799);

am([3, 4, 5]).mapFilter(function (value, i) {
  let a = 2 * value + i;
  return a > 6 ? a : false;
}).log('mapfilter');

am([3, 4, 5]).map(function (value, i) {
  return 2 * value + i;
}).log(804);

am([3, 4, 5]).map(function* (value, i) {
  return yield am.resolve(3 * value + i);
}).log(820);

am.filter([34, 56], function* (value) {
  if (value === 34) {
    return yield true;
  } else {
    return yield Promise.reject(true);
  }
}, true).log('750 ok', '750 error');

am([34, 56, 78]).forEach(function (value, i) {
  console.log(value, i);
}).log();

am({
  a: 34,
  b: 56,
  c: 78
}).forEach(function (value, i) {
  console.log(value, i);
}).log();

am([34, 56, 78]).forEach(function* (value, i) {
  console.log(yield am.resolve(2 * value), i);
}).log();

am({
  a: 34,
  b: 56,
  c: 78
}).forEach(function* (value, attr) {
  console.log(73, yield am.resolve(3 * value), yield am.resolve(attr));
}).log('object async');

am(7).forEach(function* (value, i) {
  console.log(yield value, i);
}).log('non object');

am([3, 4, 5]).filter(function* (value) {
  return yield(4 - value);
}).log('filter syncronous, 799');

am([33, 4, 555]).timeout(200).filter(function* (value) {
  return yield am.resolve(4 - value);
}).log('filter asyncronous, 807');

am(4).timeout(200).filter(function* (value) {
  return yield am.resolve(4 - value);
}).log('filter asyncronous non-object');


am(7).filter(function (value) {
  return 7 - value;
}).log(810);

am(7).filter(function* (value) {
  return yield(8 - value);
}).log(813);

am.waterfall([7, function (a, cb) {
  cb(null, 444 + a);
}, function (a, b, cb) {

  cb(null, 777 + a + b);
}]).log('waterfall');

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

am.resolve(89).timeout(2000).log('timeout');
am.race([am.resolve(999).timeout(2000), am.resolve(8).timeout(1000)]).log('race');

am.race(56).log('solo 56');

am.resolve(45).next(function (r) {
  console.log(this._state_);
  console.log(r);
  return 455;
}).next(function (r) {

  this._state_.prev.then(function (result) {
    console.log(result);
  });
  console.log(this._state_);
  console.log(r);

}).log('test');

am(function* () {
  return yield [
    Promise.resolve(90), [Promise.resolve(100), [Promise.resolve(100), Promise.resolve(190)]]
  ];
}).log('co ');

am([4, 5]).log('wrap array');

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
}).log('yield object with async attributes');

am(function* () {
  return yield [
    Promise.resolve(90), Promise.resolve(190)
  ];
}).filter(function* (number) {
  return yield Promise.resolve(number < 100);
}).log('async filter');

// wrap a callback function
am(function (a, cb) {
  cb(null, a * 2);
}, 4).log();

am.resolve({
  a: 4
}).log('resolve');

am.reject(6).log('', 'Error:');
am.parallel([Promise.resolve(45), Promise.resolve(67)]).log('parallel');

am.all([Promise.resolve(89), Promise.resolve(8), [3, 4, Promise.resolve(43)]]).log();
am.all({
  a: 4,
  c: [Promise.resolve(89), Promise.resolve(8), [3, 4, Promise.resolve(43)]]
}).log();

am(function (cb) {
  cb(null, 4);
}).log('callback');

am.all(function (cb) {
  cb(null, 4);
}).log(559);

am.waterfall([function (cb) {
  cb(null, 4);
}, function (a, cb) {

  cb(null, 6 + a);
}, function (a, b, cb) {

  cb(null, 4 + b);
}, function (a, b, c, cb) {

  cb(null, 6 + a + b + c);
}]).log('560');

am.waterfall({
  aa: function (res, cb) {
    res.f = 67;
    cb(null, 4);
  },
  bb: function (res, cb) {
    cb(null, 6 + res.aa);
  },
  cc: function (res, cb) {
    cb(null, 4 + res.bb + res.aa);
  },
  dd: function (res, cb) {
    cb(null, 6);
  }
}).log(585);

am(function* (a, b) {


  a += b;
  return yield a;
}(45, 55)).log('iterator');
// iterator 100

// https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Iteration_protocols



am([2, 34].entries()).log('iterator II');

// iterator II undefined


am(true).filter(function* (value) {
  return yield value;
}).log('other');

// 'other' true


am(Promise.resolve([45, 67]))
  .map(function (item) {
    return item / 10;
  }).log('wrap promise');

// logs
// wrap promise  [ 4.5, 6.7 ]​​​​​

am.race({
  a: Promise.resolve(56),
  b: 45
}).log('race');

Promise.race([Promise.resolve(56), Promise.resolve(45)]).then(function (result) {
  console.log(result);
});