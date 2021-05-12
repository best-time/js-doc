const hexToRgb = hex => hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i, (_, r, g, b) => `#${r}${r}${g}${g}${b}${b}`).substring(1).match(/.{2}/g).map(x => parseInt(x, 16));

// hexToRgb('#00ffff') === [0, 255, 255]
// hexToRgb('#0ff') === [0, 255, 255]


const rgbToHex = (red, green, blue) => `#${((1 << 24) + (red << 16) + (green << 8) + blue).toString(16).slice(1)}`;

// Or
const rgbToHex = (red, green, blue) => `#${[red, green, blue].map(v => v.toString(16).padStart(2, '0')).join('')}`;

// rgbToHex(0, 255, 255) === '#00ffff'

const randomColor = () => `#${Math.random().toString(16).slice(2, 8).padEnd(6, '0')}`;


const getParam = (url, param) => new URLSearchParams(new URL(url).search).get(param);

// getParam('http://domain.com?message=hello', 'message') === 'hello'


const run = promises => promises.reduce((p, c) => p.then(rp => c.then(rc => [...rp, rc])), Promise.resolve([]));

/*
run(promises).then((results) => {
    // results is an array of promise results in the same order
});
*/

const wait = async (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));



const isFunction = v => ['[object Function]', '[object GeneratorFunction]', '[object AsyncFunction]', '[object Promise]'].includes(Object.prototype.toString.call(v));

// Example
isFunction(function() {});          // true
isFunction(function*() {});         // true
isFunction(async function() {});    // true


// ⭐️⭐️⭐️⭐️⭐️⭐️⭐️
const compose = (...fns) => x => fns.reduceRight((y, f) => f(y), x);

// Example
const lowercase = str => str.toLowerCase();
const capitalize = str => `${str.charAt(0).toUpperCase()}${str.slice(1)}`;
const reverse = str => str.split('').reverse().join('');

const fn = compose(reverse, capitalize, lowercase);

// We will execute `lowercase`, `capitalize` and `reverse` in order
fn('Hello World') === 'dlrow olleH';



const curry = (fn, ...args) => fn.length <= args.length ? fn(...args) : curry.bind(null, fn, ...args);

// Example
const sum = (a, b, c) => a + b + c;
curry(sum)(1)(2)(3);    // 6
curry(sum)(1, 2, 3);    // 6
curry(sum, 1)(2, 3);    // 6
curry(sum, 1)(2)(3);    // 6
curry(sum, 1, 2)(3);    // 6
curry(sum, 1, 2, 3);    // 6






const linear = t => t;

const easeInQuad = t => t * t;
const easeOutQuad = t => t * (2-t);
const easeInOutQuad = t => t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

const easeInCubic = t => t * t * t;
const easeOutCubic = t => (--t) * t * t + 1;
const easeInOutCubic = t => t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;

const easeInQuart = t => t * t * t * t;
const easeOutQuart = t => 1 - (--t) * t * t * t;
const easeInOutQuart = t => t < .5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t;

const easeInQuint = t => t * t * t * t * t;
const easeOutQuint = t => 1 + (--t) * t * t * t * t;
const easeInOutQuint = t => t < .5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t;

const easeInSine = t => 1 + Math.sin(Math.PI / 2 * t - Math.PI / 2);
const easeOutSine = t => Math.sin(Math.PI / 2 * t);
const easeInOutSine = t => (1 + Math.sin(Math.PI * t - Math.PI / 2)) / 2;

const easeInElastic = t => (.04 - .04 / t) * Math.sin(25 * t) + 1;
const easeOutElastic = t => .04 * t / (--t) * Math.sin(25 * t);
const easeInOutElastic = t => (t -= .5) < 0 ? (.02 + .01 / t) * Math.sin(50 * t) : (.02 - .01 / t) * Math.sin(50 * t) + 1;


// 假设有一个被业务广泛使用的函数，我们是否能够在既不更改调用它的业务代码，
// 也不更改该函数源码的前提下，在其执行前后注入一段我们自定义的逻辑呢
function withHookAfter (originalFn, hookFn) {
    return function () {
      var output = originalFn.apply(this, arguments)
      hookFn.apply(this, arguments)
      return output
    }
  }


  function makeMap (str, expectsLowerCase) {
    // 构建闭包集合map
    var map = Object.create(null);
    var list = str.split(',');
    for (var i = 0; i < list.length; i++) {
      map[list[i]] = true;
    }
    return expectsLowerCase
      ? function (val) { return map[val.toLowerCase()]; }
      : function (val) { return map[val]; }
}
// 利用闭包，每次判断是否是内置标签只需调用isHTMLTag
var isHTMLTag = makeMap('html,body,base,head,link,meta,style,title')
console.log('res', isHTMLTag('body')) // true





  // 继承方法
  function inheritPrototype(Son, Father) {
    var prototype = Object.create(Father.prototype)
    prototype.constructor = Son
    // 把Father.prototype赋值给 Son.prototype
    Son.prototype = prototype
  }
  function Father(name) {
    this.name = name
    this.arr = [1,2,3]
  }
  Father.prototype.getName = function() {
    console.log(this.name)
  }

  function Son(name, age) {
    Father.call(this, name)
    this.age = age
  }
  inheritPrototype(Son, Father)
  Son.prototype.getAge = function() {
    console.log(this.age)
  }


 //  浅拷贝
  function looseEqual (a, b) {
    if (a === b) {
      return true
    }
    var isObjectA = isObject(a);
    var isObjectB = isObject(b);
    if (isObjectA && isObjectB) {
      try {
        var isArrayA = Array.isArray(a);
        var isArrayB = Array.isArray(b);
        if (isArrayA && isArrayB) {
          return a.length === b.length && a.every(function (e, i) {
            return looseEqual(e, b[i])
          })
        } else if (!isArrayA && !isArrayB) {
          var keysA = Object.keys(a);
          var keysB = Object.keys(b);
          return keysA.length === keysB.length && keysA.every(function (key) {
            return looseEqual(a[key], b[key])
          })
        } else {
          /* istanbul ignore next */
          return false
        }
      } catch (e) {
        /* istanbul ignore next */
        return false
      }
    } else if (!isObjectA && !isObjectB) {
      return String(a) === String(b)
    } else {
      return false
    }
  }
  function isObject (obj) {
    return obj !== null && typeof obj === 'object'
  }


  function almostEqual(numOne, numTwo) {
    return Math.abs( numOne - numTwo ) < Number.EPSILON;
  }
  console.log(almostEqual(0.1 + 0.2, 0.3));

