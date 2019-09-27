var
  ArrayProto = Array.prototype,
  push = ArrayProto.push,
  slice = ArrayProto.slice;

var
  ObjProto = Object.prototype,
  hasOwnProperty = ObjProto.hasOwnProperty;

export const toString = ObjProto.toString;

export const T = () => true
export const F = () => false

export const arrayRepeat = (len = 0, item = []) => (new Array(len)).fill(item)
export const NOOP = () => { }
export const NULL = () => null
export const EMPTY_OBJECT = {}
export const PURE_EMPTY_OBJECT = Object.create(null)

function throwError(str = '') {
  throw new Error(str);
}

function property(key) {
  return function (obj) {
    return obj == null ? void 0 : obj[key];
  }
}

function existy(value) {
  return value != null;
}

function not(func = NOOP) {
  return function () {
    return !func.apply(null, slice.call(arguments));
  }
}

// curry 通俗来讲: 只传递给函数一部分参数来调用它，让它返回一个新函数去处理剩下的参数
export const _curry1 = (fn = NOOP) => {
  return function f1(a) {
    if (arguments.length) {
      return fn.apply(this, arguments)
    } else {
      return f1
    }
  }
}

export const _curry2 = (fn = NOOP) => {
  return function f2(a, b) {
    switch (arguments.length) {
      case 0:
        return f2;
      case 1:
        if (!a) {
          return f2;
        } else {
          return _curry1(function (_b) { return fn(a, _b) })
        }
      default:
        if (!a && !b) {
          return f2
        } else if (!a) {
          return _curry1(function (_a) { return fn(_a, b) })
        } else if (!b) {
          _curry1(function (_b) { return fn(a, _b) })
        } else {
          return fn(a, b)
        }
    }
  }
}

/**
 *      type({}); //=> "Object"
 *      type(1); //=> "Number"
 *      type(false); //=> "Boolean"
 *      type('s'); //=> "String"
 *      type(null); //=> "Null"
 *      type([]); //=> "Array"
 *      type(/[A-z]/); //=> "RegExp"
 *      type(() => {}); //=> "Function"
 *      type(undefined); //=> "Undefined"
 */

export const type = _curry1(function type(val) {
  return val === null ? 'Null' : (val === undefined ? 'Undefined' : toString.call(val).slice(8, -1))
});

export const _keys = typeof Object.keys === 'function'
  ? _curry1(function keys(obj) {
    return Object(obj) !== obj ? [] : Object.keys(obj);
  })
  : () => { }

export const _toArray = (...args) => ([]).slice.apply(args)

export const _filter = (cb = NOOP, arr = []) => {
  let a = [], arrLen = arr.length, i = arrLen
  while (i > 0) {
    if (cb(arr[arrLen - i], arrLen - i, arr)) {
      a[a.length] = arr[arrLen - i]
    }
    --i
  }
  return a
}

export const _for = (cb = NOOP, arr = []) => {
  let a = [], arrLen = arr.length, i = arrLen
  while (i > 0) {
    a[a.length] = cb(arr[arrLen - i], arrLen - i, arr)
    --i
  }
  return a
}

export const _some = (cb = NOOP, arr = []) => {
  let arrLen = arr.length, i = arrLen
  while (i > 0) {
    if (cb(arr[arrLen - i], arrLen - i, arr)) {
      return true
    }
    --i
  }
  return false
}

export const _every = (cb = NOOP, arr = []) => {
  let arrLen = arr.length, i = arrLen
  while (i > 0) {
    if (!cb(arr[arrLen - i], arrLen - i, arr)) {
      return false
    }
    --i
  }
  return true
}

let types = {}
_for(function (name) {
  types['is' + name] = function (obj) {
    return toString.call(obj) === '[object ' + name + ']';
  };
}, ['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error', 'Array'])


export var add = _curry2(function add(a, b) {
  return Number(a) + Number(b);
});

export var find = _curry2(function find(fn, list) {
  var len = list.length, i = 0
  while (i < len) {
    if (fn(list[i])) {
      return list[i]
    }
    i++
  }
})

export var findIndex = _curry2(function findIndex(fn, list) {
  var len = list.length, i = 0
  while (i < len) {
    if (fn(list[i])) {
      return i
    }
    i++
  }
  return -1
})

export var findLast = _curry2(function findLast(fn, list) {
  var i = list.length - 1
  while (i >= 0) {
    if (fn(list[i])) {
      return list[i]
    }
    i--
  }
})

export var findLastIndex = _curry2(function findLastIndex(fn, list) {
  var i = list.length - 1
  while (i >= 0) {
    if (fn(list[i])) {
      return i
    }
    i--
  }
  return -1
})


function _arity(fn) {
  return function () { return fn.apply(this, arguments); };
}


export var once = _curry1(function once(fn) {
  var called = false, result;
  return _arity(function () {
    if (called) {
      return result;
    }
    called = true;
    result = fn.apply(this, arguments);
    return result;
  });
})

export default {
  _filter, _some, _every, T, F, _keys, ...types,
  add,
  find, findIndex, findLast, findLastIndex,
  once
}
