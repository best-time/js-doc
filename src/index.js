import { run, debounce, throttle, memory, proxy, EventEmitter, deepCopy } from './lib'
import { version } from '../package.json';
// console.log('version ' + version);
// export default function () {
//   console.log('version ' + version);
// }

import store from './util/store'
import $ from './util/dm'
// import swipe from './util/swipe'
import swipe from './util/nSwipe'

export { default as tool } from './internal/_tool';
export { default as isArray } from './internal/_isArray'
export { default as isInteger } from './internal/_isInteger'
export { run, debounce, throttle, memory, proxy, EventEmitter, deepCopy };

export {store, $, swipe}

// export { default as type } from './type';

import S from "./Y/core1"
export { S }

/**
 Bad:

function emailClients(clients) {
  clients.forEach(client => {
    const clientRecord = database.lookup(client);
    if (clientRecord.isActive()) {
      email(client);
    }
  });
}
Good:

function emailActiveClients(clients) {
  clients.filter(isActiveClient).forEach(email);
}

function isActiveClient(client) {
  const clientRecord = database.lookup(client);
  return clientRecord.isActive();
}
 */

function compose(...fns) {
  return function (x) {
    return fns.reduceRight(function (arg, fn) {
      return fn(arg);
    }, x)
  }
}


function adapter(response, info) {
  return Object.keys(info).reduce((res, key) => {
    res[key] = response[info[key]]
    return res
  }, {})
}

/**
 adapter({nickname: 1, counts: 2}, {
      name: 'nickname',
      score: 'counts'
    })
 */


function adapter2(response, info) {
  return Object.keys(info).reduce((res, key) => {
    let keyArr = info[key].split('.'),
      len = keyArr.length
    if(len > 1) {
      let i = -1, tmp = null
      while(++i < len) {
        tmp = tmp ? tmp[keyArr[i]] : response[keyArr[i]]
        if(!tmp) break;
      }
      res[key] = tmp
    } else {
      res[key] = response[info[key]]
    }
    return res
  }, {})
}


/**
 adapter({nickname: {a: []}, counts: 2}, {
      name: 'nickname.a',
      score: 'counts'
    })
 */





 // 让配置写在一个可视化配置平台上
// const cgiMAp = {
//   '/a': {
//     name: 'nickname',
//     score: 'counts'
//   },
//   // ...
// }
function reqGenerator(cfg) {
  return Object.keys(cfg).reduce((res, key) => {
    res[key.slice(1)] = () => request(key).then(r => adapter(r, cfg[key]))
    return res
  }, {})
}
// request('/config').then(res => {
//   const reqs = reqGenerator(res.cgiMAp)
//   reqs.a()
// })

function slice (arr, i) {
  return Array.prototype.slice.call(arr, i)
}

function delay (fn, ms, ctx) {
  var args = slice(arguments, 3)
  return setTimeout(function delayer () {
    fn.apply(ctx || null, args)
  }, ms)
}
const deferMs = 1

function defer (fn, ctx) {
  const args = slice(arguments, 2)
  const params = [ fn, deferMs, ctx ].concat(args)
  return delay.apply(null, params)
}

function delayed () {
  var args = slice(arguments)
  return function delayeder () {
    return delay.apply(null, args.concat(slice(arguments)))
  }
}



export {adapter, delay, defer, delayed}
