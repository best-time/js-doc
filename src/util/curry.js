// https://github.com/dominictarr/curry

var slice = Array.prototype.slice;
var toArray = function(a){ return slice.call(a) }
var tail = function(a){ return slice.call(a, 1) }

// fn, [value] -> fn
//-- create a curried function, incorporating any number of
//-- pre-existing arguments (e.g. if you're further currying a function).
var createFn = function(fn, args, totalArity){
    var remainingArity = totalArity - args.length;

    switch (remainingArity) {
        case 0: return function(){ return processInvocation(fn, concatArgs(args, arguments), totalArity) };
        case 1: return function(a){ return processInvocation(fn, concatArgs(args, arguments), totalArity) };
        case 2: return function(a,b){ return processInvocation(fn, concatArgs(args, arguments), totalArity) };
        case 3: return function(a,b,c){ return processInvocation(fn, concatArgs(args, arguments), totalArity) };
        case 4: return function(a,b,c,d){ return processInvocation(fn, concatArgs(args, arguments), totalArity) };
        case 5: return function(a,b,c,d,e){ return processInvocation(fn, concatArgs(args, arguments), totalArity) };
        case 6: return function(a,b,c,d,e,f){ return processInvocation(fn, concatArgs(args, arguments), totalArity) };
        case 7: return function(a,b,c,d,e,f,g){ return processInvocation(fn, concatArgs(args, arguments), totalArity) };
        case 8: return function(a,b,c,d,e,f,g,h){ return processInvocation(fn, concatArgs(args, arguments), totalArity) };
        case 9: return function(a,b,c,d,e,f,g,h,i){ return processInvocation(fn, concatArgs(args, arguments), totalArity) };
        case 10: return function(a,b,c,d,e,f,g,h,i,j){ return processInvocation(fn, concatArgs(args, arguments), totalArity) };
        default: return createEvalFn(fn, args, remainingArity);
    }
}

// [value], arguments -> [value]
//-- concat new arguments onto old arguments array
var concatArgs = function(args1, args2){
    return args1.concat(toArray(args2));
}

// fn, [value], int -> fn
//-- create a function of the correct arity by the use of eval,
//-- so that curry can handle functions of any arity
var createEvalFn = function(fn, args, arity){
    var argList = makeArgList(arity);

    //-- hack for IE's faulty eval parsing -- http://stackoverflow.com/a/6807726
    var fnStr = 'false||' +
                'function(' + argList + '){ return processInvocation(fn, concatArgs(args, arguments)); }';
    return eval(fnStr);
}

var makeArgList = function(len){
    var a = [];
    for ( var i = 0; i < len; i += 1 ) a.push('a' + i.toString());
    return a.join(',');
}

var trimArrLength = function(arr, length){
    if ( arr.length > length ) return arr.slice(0, length);
    else return arr;
}

// fn, [value] -> value
//-- handle a function being invoked.
//-- if the arg list is long enough, the function will be called
//-- otherwise, a new curried version is created.
var processInvocation = function(fn, argsArr, totalArity){
    argsArr = trimArrLength(argsArr, totalArity);

    if ( argsArr.length === totalArity ) return fn.apply(null, argsArr);
    return createFn(fn, argsArr, totalArity);
}

// fn -> fn
//-- curries a function! <3
var curry = function(fn){
    return createFn(fn, [], fn.length);
}

// num, fn -> fn
//-- curries a function to a certain arity! <33
curry.to = curry(function(arity, fn){
    return createFn(fn, [], arity);
});

// num, fn -> fn
//-- adapts a function in the context-first style
//-- to a curried version. <3333
curry.adaptTo = curry(function(num, fn){
    return curry.to(num, function(context){
        var args = tail(arguments).concat(context);
        return fn.apply(this, args);
    });
})

// fn -> fn
//-- adapts a function in the context-first style to
//-- a curried version. <333
curry.adapt = function(fn){
    return curry.adaptTo(fn.length, fn)
}


module.exports = curry;



// ------------------------------ demo --------------------
var add = curry(function(a, b){ return a + b });

//-- it can be called like normal:
add(1, 2) //= 3

//-- or, if you miss off any arguments,
//-- a new funtion that expects all (or some) of
//-- the remaining arguments will be created:
var add1 = add(1);
add1(2) //= 3;

//-- curry knows how many arguments a function should take
//-- by the number of parameters in the parameter list

//-- in this case, a function and two arrays is expected
//-- (fn, a, b).  zipWith will combine two arrays using a function:
var zipWith = curry(function(fn, a, b){
    return a.map(function(val, i){ return fn(val, b[i]) });
});

//-- if there are still more arguments required, a curried function
//-- will always return a new curried function:
var zipAdd = zipWith(add);
var zipAddWith123 = zipAdd([1, 2, 3]);

//-- both functions are usable as you'd expect at any time:
zipAdd([1, 2, 3], [1, 2, 3]); //= [2, 4, 6]
zipAddWith123([5, 6, 7]); //= [6, 8, 10]

//-- the number of arguments a function is expected to provide
//-- can be discovered by the .length property
zipWith.length; //= 3
zipAdd.length; //= 2
zipAddWith123.length; //= 1




// to
var sum = function(){
	var nums = [].slice.call(arguments);
	return nums.reduce(function(a, b){ return a + b });
}

var sum3 = curry.to(3, sum);
var sum4 = curry.to(4, sum);

sum3(1, 2)(3) //= 6
sum4(1)(2)(3, 4) //= 10



// adapt
// var delve = require('delve');
// var delveC = curry.adapt(delve);

// var getDataFromResponse = delveC('response.body.data');
// getDataFromResponse({ response: { body: { data: { x: 2 }} } }); //= { x: 2 }

// adaptTo
var _ = require('lodash');
var map = curry.adaptTo(2, _.map);
var mapInc = map(function(a){ return a + 1 })

mapInc([1, 2, 3]) //= [2, 3, 4]