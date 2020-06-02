const toStr = Object.prototype.toString;
const unDef = void 0;
const isArray = p =>
  Array.isArray ? Array.isArray(p) : toStr.call(p) === "[object Array]";
const isString = s => typeof s === "string";
// const isFunction = p => toStr.call(p) === "[object Function]";
const isFunction = v => ['[object Function]', '[object GeneratorFunction]', '[object AsyncFunction]', '[object Promise]'].includes(Object.prototype.toString.call(v));

const NOOP = function() {};

const serialize = data => JSON.stringify(data);
const unserialize = data => (data == null ? data : JSON.parse(data));

export const extend = (orig, target, deep = true) => {
  orig = orig || {};
  for (let i in target) {
    if (deep === true && target.hasOwnProperty(i)) {
      if (typeof target[i] === "object") {
        if (!orig[i]) {
          orig[i] = isArray(target[i]) ? [] : {};
        }
        extend(orig[i], target[i]);
      } else {
        orig[i] = target[i];
      }
    } else orig[i] = target[i];
  }
  return orig;
};

export const tips = {
  methods: {
    tips(title = "", option) {
      if (!title) return;
      const baseOption = {
        onOk: NOOP,
        onCancel: NOOP,
        type: "confirm"
      };
      option = Object.assign(baseOption, option);
      this.$Modal[option.type]({
        title,
        ...option
      });
    }
  }
};

/** adapter demo
     let response = { nickname: { a: { b: { c: ["c"] } } }, counts: 2 };
      let res = adapter(response, {
        name: "nickname.a.b.c",
        score: "counts"
      });
    */
const adapter = (response, info) => {
  return Object.keys(info).reduce((res, key) => {
    let keyArr = isString(info[key]) ? info[key].split(".") : [],
      len = keyArr.length;
    if (len > 1) {
      let i = -1,
        tmp = null;
      while (++i < len) {
        tmp = tmp ? tmp[keyArr[i]] : response[keyArr[i]];
        if (!tmp) break;
      }
      res[key] = tmp;
    } else {
      res[key] = isString(info[key]) ? response[info[key]] : unDef;
    }
    return res;
  }, {});
};

/**
 *
  var obj = { 'a': [{ 'b': { 'c': 3 } }] };

var result =deepGet(obj, 'a[0].b.c');
console.log(result);
// => 3

result=deepGet(obj, ['a', '0', 'b', 'c']);
console.log(result);
// => 3

result=deepGet(obj, 'a.b.c', 'default');
console.log(result);
// => 'default'
 */
// 获取对象值
function deepGet(object, path, defaultValue) {
  return (
    (!Array.isArray(path)
      ? path
          .replace(/\[/g, ".")
          .replace(/\]/g, "")
          .split(".")
      : path
    ).reduce((o, k) => (o || {})[k], object) || defaultValue
  );
}

// ================================================================

class ErrorResult extends Error {
  constructor(data) {
    super();
    this.code = data.code;
    this.message = data.msg;
  }
}

const firstWordToUpper = str => {
  if (!isStr(str)) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const isFunc = isFunction;

export const storeGet = k => {
  return unserialize(localStorage.getItem(k + ""));
};
export const storeSet = (k, v) => {
  localStorage.setItem(k + "", serialize(v));
};

const baseFilterFalse = v => {
  if (isArray(v)) {
    return v.filter(Boolean);
  }
  return v;
};

const getVInArray = (v, pathArray = [], defu = null) => {
  if (!pathArray.length) return defu;
  let tmp = baseFilterFalse(pathArray);
  if (tmp.length - 1 === 0) return v[tmp[0]] || defu;
  let nowV = v;
  while (tmp.length) {
    let nowK = tmp.shift();
    nowV = nowV[nowK];
    let isContinue = isDef(nowV) && typeof nowV === "object";
    if (!isContinue) {
      return nowV || defu;
    }
  }
  return nowV || defu;
};

const dataValue = (d) => {
  var f;
  try {
    return d === null || d === undefined
      ? undefined
      : d === 'true'
      ? true
      : d === 'false'
      ? false
      : d === 'null'
      ? null
      : (f = parseFloat(d)) == d
      ? f
      : d;
  } catch (e) {}
  return undefined;
}

// [ ] 符号替换为空 ''
const strReg = /(\[+|\]+)/gi;

/**
 *
example:

    let m = { a: [{ name: "aa" }] };
    let m1 = {
      a: [{ name: [1, 2, 3, 4] }, [{ age: 11 }, { age: 22 }, { age: 3333 }]]
    };
    let path1 = ["a", "1", "name"];
    let path2 = ["a", "0", "name"];

    let path3 = "a[0].name.[3]";
    let path5 = "a[0].name.3";
    let path4 = "a[1][2].age";

    // const res3 = this.toV(m, path3)
    // const res3 = this.toV(m1, path3)
    // const res4 = this.toV(m1, path4)
    // const res5 = this.toV(m1, path5)

    // this.log(res3, '3333')
    // this.log(res4, '4444')
    // this.log(res5, '555')

    this.log(this.toV(m, path1), "111");
    this.log(this.toV(m, path2), "222");


 *
 * @param {*} v   object
 * @param {*} path string | Array   ('a[0].b[1].c' | ['a', '0', 'c'])
 * @param {*} defu 默认值
 */
const toV = (v, path, defu = null) => {
  if (isStr(path)) {
    let tmp = path.split("."),
      pathArr = [];
    tmp.forEach(it => {
      if (it.indexOf("[") > -1) {
        let ar = it.split("[");
        ar = ar.map(im => im.replace(strReg, ""));
        pathArr = [...pathArr, ...ar];
      } else {
        pathArr.push(it);
      }
    });
    return getVInArray(v, pathArr, defu);
  } else if (isArray(path)) {
    return getVInArray(v, path, defu);
  }
  return defu;
};

/*
const lowercase = str => str.toLowerCase();
const capitalize = str => `${str.charAt(0).toUpperCase()}${str.slice(1)}`;
const reverse = str => str.split('').reverse().join('');

const fn = compose(lowercase, capitalize, reverse);

fn('Hello World') === 'dlrow olleH';
*/
const compose = (...fns) => {
  return x => fns.reduce((y, f) => f(y), x);
};

/*
const sum = (a, b, c) => a + b + c;
curry(sum)(1)(2)(3);    // 6
curry(sum)(1, 2, 3);    // 6
curry(sum, 1)(2, 3);    // 6
curry(sum, 1)(2)(3);    // 6
curry(sum, 1, 2)(3);    // 6
curry(sum, 1, 2, 3);    // 6
*/
const curry = (fn, ...args) => {
  if(fn.length <= args.length ) {
    return fn(...args)
  }
  return curry.bind(null, fn, ...args)
}

//-----------------------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------------

export const tool = {
  methods: {
    // adapter,
    falsy(key) {
      if (isArray(key)) {
        key.forEach(k => {
          this[k] = false;
        });
      } else {
        this[key] = false;
      }
      return this;
    },
    truy(key) {
      if (isArray(key)) {
        key.forEach(k => {
          this[k] = true;
        });
      } else {
        this[key] = true;
      }
      return this;
    },
    toResult(p) {
      return p
        .then(v => {
          if (!v.data.success) return Promise.reject(new ErrorResult(v.data));
          return Promise.resolve([null, v.data.data]);
        })
        .catch(e => Promise.resolve([e, null]));
    },
    deepCopy(dist, target) {
      return extend(dist, target, true);
    },
    copy(dist, target) {
      return extend(dist, target, false);
    },
    toV: deepGet,
    compose,
    log(...rest) {
      if (process.env.NODE_ENV === "development") console.log(...rest);
    }
  }
};

export default {
  methods: {
    handleReset(formRef) {
      if (
        this.$refs[formRef] &&
        typeof this.$refs[formRef].resetFields === "function"
      ) {
        this.$refs[formRef].resetFields();
      }
    }
  }
};

const sync = {
  * syncMode(funcName, params) {
    yield new Promise((resolve, reject) => {
      funcName(params)
        .then(v => {
          if (!v.data.success) {
            reject(new ErrorResult(v.data));
          } else {
            resolve([null, v.data.data]);
          }
        })
        .catch(err => {
          resolve(err, null);
        });
    });
  },
  poll(fName, p, cb) {
    let generator = this.syncMode(fName, p);
    let step = generator.next();
    step.value.then(res => {
      typeof cb === "function" && cb(res);
    });
  }
  /*
  this.poll(
    queryOrderStatusService,
    { orderCode: this.orderCode },
    this.submitOrderCb
  );
  */
}


// ---------------------------------------------------------------------------------
// -------------------------------- Array ------------------------------------------
// ----------------------------------------------------------------------------------

const removeFalsy = arr => arr.filter(Boolean);
const average = arr => arr.reduce((a, b) => a + b, 0) / arr.length;

const sum = arr => arr.reduce((a, b) => a + b, 0);

const toNumbers = arr => arr.map(Number);

// Or
const toNumbers = arr => arr.map(x => +x);

// toNumbers(['2', '3', '4']) returns [2, 3, 4]


const flat = arr => [].concat.apply([], arr.map(a => Array.isArray(a) ? flat(a) : a));
// Or
const flat = arr => arr.reduce((a, b) => Array.isArray(b) ? [...a, ...flat(b)] : [...a, b], []);

// Or
// See the browser compatibility at https://caniuse.com/#feat=array-flat
const flat = arr => arr.flat();

// flat(['cat', ['lion', 'tiger']]) returns ['cat', 'lion', 'tiger']


// ---------------------------------------------------------------------------------
// -------------------------------- Object ------------------------------------------
// ----------------------------------------------------------------------------------

const omit = (obj, keys) => Object.keys(obj).filter(k => !keys.includes(k)).reduce((res, k) => Object.assign(res, {[k]: obj[k]}), {});

// Example
// omit({a: '1', b: '2', c: '3'}, ['a', 'b']);     // returns { c: '3' }



const pick = (obj, keys) => Object.keys(obj).filter(k => keys.includes(k)).reduce((res, k) => Object.assign(res, {[k]: obj[k]}), {});

// Example
// pick({ a: '1', b: '2', c: '3' }, ['a', 'b']);   // returns { a: '1', b: '2' }




// ---------------------------------------------------------------------------------
// -------------------------------- Date ------------------------------------------
// ----------------------------------------------------------------------------------


const formatYmd = date => date.toISOString().slice(0, 10);
// formatYmd(new Date()) returns `2020-05-06`


const extract = date => date.toISOString().split(/[^0-9]/).slice(0, -1);

