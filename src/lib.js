
const fibonacci = (n) => {
  if (n < 1) throw new Error('参数有误')
  if (n === 1 || n === 2) return 1
  return fibonacci(n - 1) + fibonacci(n - 2)
}

export const memory = (fn) => {
  let obj = {}
  return (n) => {
    if (!obj[n]) obj[n] = fn(n)
    return obj(n)
  }
}

export const run = (generatorFunc) => {
  let it = generatorFunc()
  let val = it.next()
  return new Promise((resolve, reject) => {
    const next = (result) => {
      if (result.done) {
        resolve(result.value)
      }
      result.value = Promise.resolve(result.value)
      result.value
        .then(res => {
          let result = it.next(res)
          next(result)
        }).catch(err => {
          reject(err)
        })
    }
    next(val)
  })
}

/**
 * function *func() {
 *  let res = yield api(data)
 *  let res2 = yield api(data2)
 *  let res3 = yield api(data3)
 * }
 * run(func)
 */


/**
 * 
 * @param {*} func 
 * @param {*} time 
 * @param {*} option 
 * 
 * leading 为是否在进入时立即执行一次， trailing 为是否在事件触发结束后额外再触发一次，
 * 原理是利用定时器，如果在规定时间内再次触发事件会将上次的定时器清除，
 * 即不会执行函数并重新设置一个新的定时器，直到超过规定时间自动触发定时器中的函数
 */
export const debounce = (
  func,
  time = 17,
  option = { leading: true, trailing: true, context: null }
) => {
  let timer
  const _debounce = (...args) => {
    if (timer) clearTimeout(timer)
    if (option.leading && !timer) {
      timer = setTimeout(null, time)
      func.apply(option.context, args)
    } else if (option.trailing) {
      timer = setTimeout(() => {
        func.apply(option.context, args)
        timer = null
      }, time)
    }
  }
  _debounce.cancel = () => {
    clearTimeout(timer)
    timer = null
  }
  return _debounce
}


export const throttle = (
  func,
  time = 17,
  option = { leading: true, trailing: false, context: null }
) => {
  let previous = new Date(0).getTime(),
    timer;
  const _throttle = (...args) => {
    let now = new Date().getTime()
    if (!option.leading) {
      if (timer) return
      timer = setTimeout(() => {
        timer = null
        func.apply(option.context, args)
      }, time)
    } else if (now - previous > time) {
      func.apply(option.context, args)
      previous = now
    } else if (option.trailing) {
      clearTimeout(timer)
      timer = setTimeout(() => {
        func.apply(option.context, args)
      }, time)
    }
  }
  _throttle.cancel = () => {
    previous = 0
    clearTimeout(timer)
    timer = null
  }
  return _throttle
}


let imgList = [...document.querySelectorAll('img')], num = imgList.length

let lazyLoad = (() => {
  let count = 0
  return () => {
    let deleteIndexList = []
    imgList.map((img, index) => {
      let rect = img.getBoundingClientRect()
      if (rect.top < window.innerHeight) {
        img.src = img.dataset.src
        deleteIndexList[deleteIndexList.length] = index
        count++
        if (count - num === 0) {
          document.removeEventListener('scroll', lazyLoad)
        }
      }
    })
    imgList = imgList.filter((_, index) => !deleteIndexList.includes(index))
  }
})();


/**
 * intersectionObserver 的实现方式，实例化一个 IntersectionObserver ，并使其观察所有 img 标签

当 img 标签进入可视区域时会执行实例化时的回调，同时给回调传入一个 entries 参数，保存着实例观察的所有元素的一些状态，
比如每个元素的边界信息，当前元素对应的 DOM 节点，当前元素进入可视区域的比率，
每当一个元素进入可视区域，将真正的图片赋值给当前 img 标签，同时解除对其的观察
 */
let lazyLoad2 = () => {
  let observer = new IntersectionObserver(entries => {
    entries.map(entry => {
      if (entry.intersectionRatio > 0) {
        entry.target.src = entry.target.dataset.src
        observer.unobserve(entry.target)
      }
    })
    imgList.map(img => { observer.observe(img) })
  })
}

export const proxy = (obj) => {
  return new Proxy(obj, {
    get(target, key) {
      if (key.startsWith('_')) {
        throw new Error('private key')
      }
      return Reflect.get(target, key)
    },
    ownKeys(target) {
      return Reflect.ownKeys(target).filter(key => !key.startsWith('_'))
    }
  })
}


export const errorCaptured = async (asyncFunc) => {
  try {
    let res = await asyncFunc()
    return [null, res]
  } catch (e) {
    return [e, null]
  }
}
// let [error, res] = await errorCaptured(asyncFunc)


export class EventEmitter {
  constructor() {
    this.subs = {}
  }
  on(event, cb) {
    (this.subs[event] || (this.subs[event] = [])).push(cb)
  }
  trigger(event, ...args) {
    this.subs[event] && this.subs[event].map(cb => {
      cb(...args)
    })
  }
  once(event, onceCb) {
    const cb = (...args) => {
      onceCb(...args)
      this.off(event, onceCb)
    }
    this.on(event, cb)
  }
  off(event, offCb) {
    if (this.subs[event]) {
      let index = this.subs[event].findIndex(cb => cb === offCb)
      this.subs[event].splice(index, 1)
      if (!this.subs[event].length) delete this.subs[event]
    }
  }
}


export const deepCopy = (source) => {
  let target = Array.isArray(source) ? [] : {}
  for (var k in source) {
    if (typeof source[k] === 'object') {
      target[k] = deepCopy(source[k])
    } else {
      target[k] = source[k]
    }
  }
  return target
}


export const toArray = (list, start = 0) => {
  let i = list.length - start
  const ret = new Array(i)
  while (i--) {
    ret[i] = list[i + start]
  }
  return ret
}

export const sTime = function (func, times = 1000000) {
  var startTime = window.performance.now(); //此函数精度较高
  for (var i = 0; i < times; i++) {
    func();
  }
  var endTime = window.performance.now();
  var gapTime = endTime - startTime;
  console.log('一共耗时:' + gapTime + 'ms');
  return gapTime;
};

export const sTime2 = (func, times = 1000000, name = 'ts-test') => {
  console.time(name);
  for (i = 0; i < times; i++) {
    func()
  };
  console.timeEnd(name);
};




var cache = {};
var start = '(?:^|\\s)';
var end = '(?:\\s|$)';

function lookupClass (className) {
  var cached = cache[className];
  if (cached) {
    cached.lastIndex = 0;
  } else {
    cache[className] = cached = new RegExp(start + className + end, 'g');
  }
  return cached;
}

function addClass (el, className) {
  var current = el.className;
  if (!current.length) {
    el.className = className;
  } else if (!lookupClass(className).test(current)) {
    el.className += ' ' + className;
  }
}

function rmClass (el, className) {
  el.className = el.className.replace(lookupClass(className), ' ').trim();
}
    
    // module.exports = {
    //   add: addClass,
    //   rm: rmClass
    // };