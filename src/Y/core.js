import { isUndef, isDef, isWindow, inArray, isUndefined, isNull } from "./tool";

let arrayProto = Array.prototype;
let class2type = {};
let doc = document;
let win = window;

let S = {
  Env: {
    host: win
  }
};

[
  "Boolean",
  "Number",
  "String",
  "Function",
  "Array",
  "Date",
  "RegExp",
  "Object",
  "Error"
].forEach(name => {
  let name2lc = name.toLowerCase();

  class2type["[object " + name + "]"] = name2lc;

  S["is" + name] = function(obj) {
    return S.type(obj) === name2lc;
  };
});

S.type = function(obj) {
  return isUndef(obj)
    ? String(obj)
    : class2type[{}.toString.call(obj)] || "object";
};

S.isPlainObject = obj => {
  return (
    S.isObject(obj) &&
    !isWindow(obj) &&
    Object.getPrototypeOf(obj) == Object.prototype
  );
};

S.map = (els, cb) => {
  let val;
  let key;
  let ret = [];
  if (S.isObject(els)) {
    arrayProto.forEach.call(els, (el, index) => {
      val = cb(el, index);
      if (val !== null) {
        ret.push(val);
      }
    });
  } else {
    for (key in els) {
      val = cb(els[key], key);
      if (val !== null) {
        ret.push(val);
      }
    }
  }
  return ret.length > 0 ? arrayProto.concat.apply([], ret) : ret;
};

S.each = (obj, iterator, context) => {
  if (!obj) return obj;

  if (obj.forEach === arrayProto.forEach) {
    obj.forEach(iterator, context);
  } else {
    let len;
    let i;
    if (S.isArray(obj)) {
      for (i = 0, len = obj.length; i < len; i++) {
        if (iterator.call(context, obj[i], i, obj) === false) {
          return;
        }
      }
    } else {
      let keys = Object.keys(obj);
      for (i = 0, len = keys.length; i < len; i++) {
        if (iterator.call(context, obj[keys[i]], keys[i], obj) === false) {
          return;
        }
      }
    }
  }
  return obj;
};

function mix(obj, ...rest) {
  let k;
  S.each(rest, source => {
    if (source) {
      for (let prop in source) {
        if ((k = source[prop]) !== undefined) {
          obj[prop] = k;
        }
      }
    }
  });
  return obj;
}

S.mix = mix;

S.makeArray = o => {
  if (isUndef(o)) return [];
  if (S.isArray(o)) return o;

  let lengthType = typeof o.length;
  let oType = typeof o;

  if (lengthType !== "number" || o.alert || oType === "string") {
    return [o];
  }
  let ret = [];
  for (let i = 0, l = o.length; i < l; i++) {
    ret[i] = o[i];
  }
  return ret;
};

// 类的扩充，将 `s1` 的 `prototype` 属性的成员复制到 `r.prototype` 上。`Base` 使用。
// - r: 将要扩充的函数
// - s1: 扩充来源函数或对象. 非函数对象时复制的就是 s 的成员.
// - wl: 属性来源对象的属性白名单, 仅在名单中的属性进行复制.
S.augment = (r, o, wl) => {
  if (o instanceof Function) {
    S.mix(r.prototype, o.prototype);
  }
  if (o instanceof Object) {
    S.mix(r.prototype, o);
  }
  if (wl instanceof Object) {
    S.mix(r.prototype, wl);
  }
  return r;
};

S.filter = (arr, fn, context) => {
  return Array.prototype.filter.call(arr, fn, context || win);
};

// 创建一个 普通对象 或数组的深拷贝, 并且返回新对象，Base 使用。
// - input: 待深拷贝的对象或数组.
// - filter: 过滤函数, 返回 false 不拷贝该元素. 传入参数为:
// 	1. 待克隆值为数组, 参数同 `S.filter()`, 上下文对象为全局 `window`
// 	2. 待克隆值为普通对象, 参数为对象的每个键, 每个键对应的值, 当前对象, 上下文对象为当前对象.
S.clone = (input, filter) => {
  let destination = input;

  if (!input) return destination;

  let constructor = input.constructor;
  if (inArray(constructor, [Boolean, String, Number, Date, RegExp])) {
    destination = input.valueOf();
  } else if (S.isArray(input)) {
    destination = filter ? S.filter(input, filter) : input.concat();
  } else if (S.isPlainObject(input)) {
    destination = {};
  }

  if (S.isArray(input)) {
    for (let i = 0; i < destination.length; i++) {
      destination[i] = S.clone(destination[i], filter);
    }
  } else if (S.isPlainObject(input)) {
    for (let k in input) {
      if (!filter || filter.call(input, input[k], k, input) !== false) {
        destination[k] = S.clone(input[k], filter);
      }
    }
  }

  return destination;
};

S.ucFirst = s => {
  s += "";
  return s.charAt(0).toLowerCase() + s.slice(1);
};

S.trim = s => {
  return isUndef(s) ? "" : String.prototype.trim.call(s);
};

S.now = Date.now;

S.indexOf = (item, arr) => {
  return Array.prototype.indexOf.call(arr, item);
};

S.reduce = (arr, callback, initialValue) => {};

S.substitute =   (str, o, regexp) => {

}

S.merge = (...rest) => {
  return mix.apply(null, [{}].concat(rest))
}

  // 让函数对象 r 继承函数对象 s
  // - r: 将要继承的子类函数
  // - supplier: 继承自的父类函数
  // - px: 需要添加/覆盖的原型成员
  // - sx: 需要添加/覆盖的静态成员.
  S.extend = (receiver, supplier, protoPros, staticProps) => {}


S.unique = (array) => {
  return arrayProto.filter.call(array, (item, index) => {
    return array.indexOf(item) - index === 0
  })
}

S.startsWidth = (str, prefix) => {
  return str.lastIndexOf(prefix, 0) === 0
}

S.endsWith = (str, suffix) => {
  let ind = str.length - suffix.length
  return ind >= 0 && str.indexOf(suffix, ind) === ind
}

S.inArray = (item, arr) => {
  return S.indexOf(item, arr) > -1;
};

export default S;
