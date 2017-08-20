'use strict';

let am = require('./am.js');

let sf = function (a, success, fail) {
    if (a < 10) {
        success(a);
    } else {
        fail('too big');
    }
};



//am.sfFn(sf, 14).log('sfFn', 'err', Error());


am.sfFn(sf, 1).wait(3000)

    .log('with line no. ', Error());

am([2, 3, 4]).next(function () {}).log()
    .promise()
    .then(function (result) {
        console.log('Promise resolves with', result);
    }).catch(function (err) {
        console.log(err);
    });

am({
    a: 27,
    b: 78
}).filter(function* (value /*, attr*/ ) {

    let a = yield Promise.resolve(value);
    return a > 50;
}).log('object filter');

// logs
// ​​​​​object filter  { b: 78 }​​​​​

console.log(am(456).then(function (value) {
    return am(2 * value);


}));

Promise.resolve(34).then(function (result) {

    return 2 * result;

}).then(function (nextResult) {
    console.log(nextResult);
});

am(456).then(function* (value) {

    console.log(value);
    return yield 2 * value;

}).then(function (nextValue) {
    console.log(nextValue);
});