/**
 * 正则
 * replace
 * insertBefore
 */

import {
  isUndef,
  isDef,
  isWindow,
  inArray,
  isUndefined,
  isNull,
  noop
} from "./tool";

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

// 从左向右对每个数组元素调用给定函数，并把返回值累积起来，返回这个累加值，Base使用
// - arr: 需要遍历的数组.
// - fn: 在每个数组元素上执行的函数.
// - initialValue: 对象类型，初次执行 fn 时的第一个参数值，如果不指定则为第一个元素值，后续从第二个元素开始遍历
//
S.reduce = (arr, callback, initialValue) => {
  let len = arr.length;
  if (typeof callback !== "function") {
    throw new Error("callback is not function!");
  }
  if (len === 0 && callback) {
    throw new TypeError("arguments invalid");
  }

  let k = 0;
  let accumulator;
  if (initialValue) {
    accumulator = initialValue;
  } else {
    do {
      if (k in arr) {
        accumulator = arr[k++];
        break;
      }
      k += 1;
      if (k >= len) {
        throw new TypeError();
      }
    } while (true);
  }

  while (k < len) {
    if (k in arr) {
      accumulator = callback.call(undefined, accumulator, arr[k], k, arr);
    }
    k++;
  }
  return accumulator;
};

S.substitute = (str, o, regexp) => {
  if (typeof str !== "string" || !o) {
    return str;
  }

  return str.replace(regexp || /\\?\{([^{}]+)\}/g, (match, name) => {
    // console.log(match, name);
    if (match.charAt(0) === "\\") {
      return match.slice(1);
    }
    return o[name] === undefined ? "" : o[name];
  });
};

S.merge = (...rest) => {
  return mix.apply(null, [{}].concat(rest));
};

// 让函数对象 r 继承函数对象 s
// - r: 将要继承的子类函数
// - supplier: 继承自的父类函数
// - px: 需要添加/覆盖的原型成员
// - sx: 需要添加/覆盖的静态成员.
S.extend = (receiver, supplier, protoPros, staticProps) => {
  let supplierProto = supplier.prototype;
  supplierProto.constructor = supplier;

  let receiverProto = Object.create(supplierProto);
  receiverProto.constructor = receiver;
  receiver.prototype = S.mix(receiverProto, receiver.prototype);
  receiver.superclass = supplierProto;

  if (protoPros) {
    S.mix(receiverProto, protoPros);
  }
  if (staticProps) {
    S.mix(receiver, staticProps);
  }
  return receiver;
};

S.unique = array => {
  return arrayProto.filter.call(array, (item, index) => {
    return array.indexOf(item) - index === 0;
  });
};

S.startsWidth = (str, prefix) => {
  return str.lastIndexOf(prefix, 0) === 0;
};

S.endsWith = (str, suffix) => {
  let ind = str.length - suffix.length;
  return ind >= 0 && str.indexOf(suffix, ind) === ind;
};

S.inArray = (item, arr) => {
  return S.indexOf(item, arr) > -1;
};

let guid = 0;
S.guid = pre => {
  return (pre || "") + guid++;
};

S.ready = fn => {
  if (/complete|loaded|interactive/.test(doc.readyState) && doc.body) {
    fn(S);
  } else {
    doc.addEventListener(
      "DOMContentLoaded",
      () => {
        fn(S);
      },
      false
    );
  }
  return this;
};

function bindFn(r, fn, obj) {
  function FNOP() {}
  let slice = [].slice;
  let args = slice.call(arguments, 3);
  let bound = () => {
    let inArgs = slice.call(arguments);
    return fn.apply(
      this instanceof FNOP ? this : obj || this,
      r ? inArgs.concat(args) : args.concat(inArgs)
    );
  };
  FNOP.prototype = fn.prototype;
  bound.prototype = new FNOP();
  return bound;
}

S.mix(S, {
  noop,
  // **S.bind (fn , context)**
  //
  // 创建一个新函数，该函数可以在固定的上下文以及传递部分固定参数放在用户参数前面给原函数并执行
  // - fn: 需要固定上下文以及固定部分参数的函数
  // - context: 执行 fn 时的 this 值. 如果新函数用于构造器则该参数无用.
  bind: bindFn(0, bindFn, null, 0),
  rBind: bindFn(0, bindFn, null, 1)
});

// -----------------------------------------------------------
// script/css load across browser

let webkit = +navigator.userAgent.replace(
  /.*Web[kK]it[\/]{0,1}(\d+)\..*/,
  "$1"
);
let isOldWebKit = !webkit || webkit < 536;

let cssTimer = 0,
  monitors = {},
  monitorLen = 0;

function startCssTimer() {
  if (!cssTimer) {
    cssPoll();
  }
}

function isCssLoaded(node, url) {
  let sheet = node.sheet,
    loaded;

  if (isOldWebKit) {
    /* http://www.w3.org/TR/Dom-Level-2-Style/stylesheets.html */
    if (sheet) {
      loaded = 1;
    }
  } else if (sheet) {
    try {
      let cssRules = sheet.cssRules;
      if (cssRules) {
        loaded = 1;
      }
    } catch (ex) {
      /* http://www.w3.org/TR/dom/#dom-domexception-code */
      if (ex.name === "NS_ERROR_DOM_SECURITY_ERR") {
        /* for old firefox */
        loaded = 1;
      }
    }
  }
  return loaded;
}

function cssPoll() {
  for (let url in monitors) {
    let callbackObj = monitors[url],
      node = callbackObj.node;

    if (isCssLoaded(node, url)) {
      if (callbackObj.callback) {
        callbackObj.callback.call(node);
      }
      delete monitors[url];
      monitorLen--;
    }
  }
  cssTimer = monitorLen ? setTimeout(cssPoll, 30) : 0;
}

function pollCss(node, callback) {
  let href = node.href;
  let arr;
  arr = monitors[href] = {};
  arr.node = node;
  arr.callback = callback;
  monitorLen++;
  startCssTimer();
}

// getScript support for css and js callback after load

let jsCssCallbacks = {};
let headNode = doc.getElementsByTagName("head")[0] || doc.documentElement;

/**
 * Load a javascript/css file from the server using a GET HTTP request,
 * then execute it.
 *
 * for example:
 *      @example
 *      getScript(url, success, charset);
 *      // or
 *      getScript(url, {
 *          charset: string
 *          success: fn,
 *          error: fn,
 *          timeout: number
 *      });
 *
 * Note 404/500 status in ie<9 will trigger success callback.
 * If you want a jsonp operation, please use {@link KISSY.IO} instead.
 *
 * @param {String} url resource's url
 * @param {Function|Object} [success] success callback or config
 * @param {Function} [success.success] success callback
 * @param {Function} [success.error] error callback
 * @param {Number} [success.timeout] timeout (s)
 * @param {String} [success.charset] charset of current resource
 * @param {String} [charset] charset of current resource
 * @return {HTMLElement} script/style node
 * @member KISSY
 */
// **S.getScript(url,cuccess,charset)**
//
// 通过一个get请求的方式加载一个js或css文件，加载完成后执行它
// 调用样例
// ```
// S.getScript(url, success, charset);
// // or
// S.getScript(url, {
//     charset: string
//     success: fn,
//     error: fn,
//     timeout: number
// });

let getScript = (url, success, charset) => {
  let config = success,
    css = 0,
    error,
    timeout,
    attrs,
    callback,
    timer;

  if (S.endsWith(url.toLowerCase(), ".css")) {
    css = 1;
  }

  if (S.isObject(config)) {
    success = config.success;
    error = config.error;
    timeout = config.timeout;
    charset = config.charset;
    attrs = config.attrs;
  }

  callbacks = jsCssCallbacks[url] = jsCssCallbacks[url] || [];
  callbacks.push([success, error]);

  if (callbacks.length > 1) {
    return callbacks.node;
  }

  let node = doc.createElement(css ? "link" : "script");
  let clearTimer = () => {
    if (timer) {
      clearTimeout(timer);
      timer = undefined;
    }
  };

  if (attrs) {
    S.each(attrs, (v, n) => {
      node.setAttribute(n, v);
    });
  }

  if (charset) {
    node.charset = charset;
  }

  if (css) {
    node.href = url;
    node.rel = "stylesheet";
  } else {
    node.src = url;
    node.async = true;
  }

  callbacks.node = node;

  let end = error => {
    let index = error;
    let fn;
    clearTimer();
    S.each(jsCssCallbacks[url], callback => {
      if ((fn = callback[index])) {
        fn.call(node);
      }
      delete jsCssCallbacks[url];
    });
  };

  let useNative = "onload" in node;
  let forceCssPoll = S.Config.forceCssPoll || isOldWebKit;

  if (css && forceCssPoll && useNative) {
    useNative = false;
  }

  function onload() {
    let readyState = node.readyState;
    if (!readyState || readyState === "loaded" || readyState === "complete") {
      node.onreadystatechange = node.onload = null;
      end(0);
    }
  }

  if (useNative) {
    node.onload = onload;
    node.onerror = () => {
      node.onerror = null;
      end(1);
    };
  } else if (css) {
    pollCss(node, () => {
      end(0);
    });
  } else {
    node.onreadystatechange = onload;
  }

  if (timeout) {
    timer = setTimeout(() => {
      end(1);
    }, timeout * 1000);
  }

  if (css) {
    headNode.appendChild(node);
  } else {
    headNode.insertBefore(node, headNode.firstChild);
  }

  return node;
};

mix(S, {
  getScript
});

let fns = {},
  config = {
    fns
  };

S.Config = config;

// config(configJSON) //⇒ void
// config(name,value) //⇒ void，name：参数名，value：参数值
// config(name) //⇒ data，返回参数名的值
S.config = (configName, configValue) => {};

S.config("mini", true);

// -----------------------------------------------------------

// -----------------------------------------------------------
let modules = {};
let isString = S.isString;
let isFunction = S.isFunction;

let RE_DIRNAME = /[^?#]*\//;
let RE_DOT = /\/\.\//g;
let RE_DOUBLE_DOT = /\/[^/]+\/\.\.\//;
let RE_DOUBLE_SLASH = /([^:/])\/\//g;

function parseDirName(name) {
  let mat = name.match(RE_DIRNAME);
  return name ? mat[0] : name + "/";
}

function parseRelativeName(name, refName) {
  if (refName && /^[\.\/]/.test(name)) {
    name = parseDirName(refName) + name;
    /* /a/b/./c/./d ==> /a/b/c/d */
    name = name.replace(RE_DOT, "/");

    /* a/b/c/../../d  ==>  a/b/../d  ==>  a/d */
    while (name.match(RE_DOUBLE_DOT)) {
      name = name.replace(RE_DOUBLE_DOT, "/");
    }

    /* a//b/c  ==>  a/b/c  */
    name = name.replace(RE_DOUBLE_SLASH, "$1/");
  }
  return name;
}

function parseModuleName(name, refName) {
  if (name.charAt(name.length - 1) === "/") {
    name += "index";
  } else if (/.js$/.test(name)) {
    name = name.slice(0, -3);
  }

  return parseRelativeName(name, refName);
}

function execFnWithModules(fn, modNames, refName) {
  var args = S.map(modNames || [], function(modName) {
    return S.require(modName, refName);
  });
  return isFunction(fn) ? fn.apply(S, [S].concat(args)) : undefined;
}

function execFnWithCJS(fn) {
  return isFunction(fn) ? fn.apply(S, [S, S.require]) : undefined;
}

// **S.add(name,fn,[cfg])**
//
// KISSY 添加模块/逻辑片段的函数，`config`为配置对象，包括`config.requires`，给出当前模块的依赖模块。模块返回一个对象，通过引用它的时候来调用到。
// - name (string) – 模块名。可选。
// - fn (function) – 模块定义函数
// - config (object) – 模块的一些格外属性, 是JSON对象，包含属性：
// - requires (Array) – 模块的一些依赖
//
// KISSY MINI 中的`S.add()`只有基本功能，只支持上面三个参数，在[mini.js](../build/mini.js)中，包含完整的 KMD 规范的实现的 loader，可以参照[KISSY 1.4 Loader的文档](http://docs.kissyui.com/1.4/docs/html/guideline/loader.html)
//
// KISSY.add 的传统用法（1.x 及后续版本继续兼容这种写法，但已不推荐此写法）：
// ```
// // package/a.js
// KISSY.add('a',function(S){
//	 return ObjA;
// },{
// 	 // 当前逻辑依赖一个包内的文件b和一个模块base
// 	 requires:['b','base']
// });
// ```
//
// `add()`方法亦支持简单的 CommonJS 规范，强烈推荐这种用法，用法参照 [DEMO](../example/modules-loader/index.html)。
//
// ```
// S.add(function(S,require,exports, module){
//		var A = require('./a');
//		var B = require('./b');
//		module.exports = {
//			/*需要返回的数据*/
//		};
// });
// ```
S.add = (name, factory, config) => {
  if (isString(name)) {
    name = parseModuleName(name);
    modules[name] = {
      factory,
      requires: config && config.requires
    };
  }
  return S;
};

// **S.require(name,[refName])**
//
// 如果模块已经载入，则可以通过`S.require()`方法来调用这个模块，通常如果use()的模块过多，回调参数需要和模块列表一一对应，最简单的办法就是使用`S.require()`方法，注意，`S.require()`方法是同步执行，只有在模块已经注册完成的情况下，执行这个方法来 attache 这个模块
//
// 比如这段代码：
// ```
// // use 的模块太多，用肉眼来对应模块名称？
// S.use('a,b,c,d,e,f,g',function(S,A,B,C,D,E,F,G){
//     // Your code...
// });
//
// // 可以简写为这样
// S.use('a,b,c,d,e,f,g',function(S){
//     var A = S.require('a');
//     var B = S.require('b');
//     var C = S.require('c');
//     // Your code...
// });
// ```
//
// 再比如我添加了一个模块，希望立即执行这个模块
// ```
// S.add('my-mod',function(S,require,exports,module){
//		alert('hello world');
// });
// S.require('my-mod');// 将会弹出 hello world
// ```

S.requires = (name, refName) => {
  let mod;
  if (isString(name)) {
    name = parseModuleName(name, refName);
    mod = modules[name];
    if (mod) {
      if (!mod.exports) {
        mod.exports = isFunction(mod.factory)
          ? mod.requires
            ? execFnWithModules(mod.factory, mod.require, name)
            : execFnWithCJS(mod.factory)
          : mod.factory;
      }
    }
    return mod.exports;
  }
};

// **S.use(names, callback)**
//
// 载入并运行模块,和add一起使用，详细用法参照[KISSY模块规范](http://docs.kissyui.com/1.4/docs/html/kmd.html)（KMD），fn 类型是functio。参数说明：
// - modNames (String) – 以逗号（,）分割的模块名称,例如 `S.use("custommod,custommod2")`
// - callback (function|Object) – 当 modNames 中所有模块载入并执行完毕后执行的函数或者对象描述
//
// 当callback类型为Object时，可传入两个属性：
//
// 1. success (function) : 当 modNames 中所有模块加载完毕后执行的函数
// 2. error (function) : 当前 use 失败时调用的函数，参数为失败的模块对象
//
// 需要注意，`S.use()`方法永远异步来 attach 模块，因此和`S.require()`的区别主要在于
// - S.use 异步 attach 模块
// - S.require 同步 attach 模块
//
// 比如这段代码就会有问题
// ```
// S.add('my-mod',function(S){
//		window._my_mod = 1;
// });
// S.use('my-mod');
// alert(window._my_mod);//这时弹出undefined
// ```
//
// 修改正确时则为：
// ```
// S.add('my-mod',function(S){
//		window._my_mod = 1;
// });
// S.use('my-mod');
// setTimeout(function(){
// 		alert(window._my_mod);//这时弹出1
// },200);
// ```
//
// 显然这段代码有冗余（setTimeout），这种逻辑的正确用法应该用`S.require`
// ```
// S.add('my-mod',function(S){
//		window._my_mod = 1;
// });
// S.require('my-mod');
// alert(window._my_mod);//这时弹出1
// ```
//

S.use = (names, success) => {
  if (S.isObject(success)) {
    success = success.success;
  }

  if (isString(names)) {
    names = names.replace(/\s+/g, "").split(",");
  }
  execFnWithModules(success, names);
  return S;
};

// **S.log(msg,[cat,type])**
//
// 输出调试信息
// - msg : 试信息
// - cat : 调试信息类别. 可以取 info, warn, error, dir, time 等 console 对象的方法名, 默认为 log.
// - src : 调试代码所在的源信息

S.log = (msg, cat, type) => {
  let logger = console;
  cat = cat && logger[cat] ? cat : "log";
  logger[cat](type ? type + ": " + msg : msg);
};

S.error = msg => {
  if(S.config('debug')) {
    throw msg instanceof Error ? msg : new Error(msg)
  }
}

win.KISSY = S

// -----------------------------------------------------------

export default S;
