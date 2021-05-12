/**
 * pop
 * push
 * shift
 * unshift
 * slice
 * sort
 * revert
 * splice
 * concat
 * join
 * indexOf
 * lastIndexOf
 * forEach
 * map
 * filter
 * some
 * every
 * reduce
 * reduceRight
 * -------------------
 * es 6
 * Array.from
 * Array.of
 * copyWithin
 * find() 和 findIndex()
 * fill()
 * entries()，keys() 和 values()
 * includes()
 * flat()，flatMap()
 */

Array.of(3, 11, 8) // [3,11,8]
Array.of(3) // [3]
Array.of(3).length // 1


[1, 2, 3, 4, 5].copyWithin(0, 3)
// [4, 5, 3, 4, 5]
// 上面代码表示将从 3 号位直到数组结束的成员（4 和 5），复制到从 0 号位开始的位置，结果覆盖了原来的 1 和 2。



for (let index of ['a', 'b'].keys()) {
  console.log(index);
}
// 0
// 1

for (let elem of ['a', 'b'].values()) {
  console.log(elem);
}
// 'a'
// 'b'

for (let [index, elem] of ['a', 'b'].entries()) {
  console.log(index, elem);
}
// 0 "a"
// 1 "b"


// 相当于 [[2, 4], [3, 6], [4, 8]].flat()
[2, 3, 4].flatMap((x) => [x, x * 2])
// [2, 4, 3, 6, 4, 8]




const contains = (arr, criteria) => arr.some(v => criteria(v));
// contains([10, 20, 30], v => v > 25 )  === true
// contains([10, 20, 30], v => v > 100 || v < 15 )  === true
// contains([10, 20, 30], v => v > 100 )  === false

// 子集
const isSubset = (a, b) => (new Set(b)).size === (new Set(b.concat(a))).size;
// isSubset([1,2], [1,2,3,4]) === true
// isSubset([1,2,5], [1,2,3,4]) === false
// isSubset([6], [1,2,3,4]) === false


// `arr` is an array
const clone = arr => arr.slice(0);

// Or
const clone = arr => [...arr];

// Or
const clone = arr => Array.from(arr);

// Or
const clone = arr => arr.map(x => x);

// Or
const clone = arr => JSON.parse(JSON.stringify(arr));

// Or
const clone = arr => arr.concat([]);




const toObject = (arr, identifier) => arr.reduce((a, b) => ({ ...a, [b[identifier]]: b }), {});

/*
toObject(
    [
        { id: '1', name: 'Alpha', gender: 'Male' },
        { id: '2', name: 'Bravo', gender: 'Male' },
        { id: '3', name: 'Charlie', gender: 'Female' },
    ],
    'id'
)
returns
{
    '1': { id: '1', name: 'Alpha', gender: 'Male' },
    '2': { id: '2', name: 'Bravo', gender: 'Male' },
    '3': { id: '3', name: 'Charlie', gender: 'Female' },
}
*/



const toNumbers = arr => arr.map(Number);

// Or
const toNumbers = arr => arr.map(x => +x);

// toNumbers(['2', '3', '4']) returns [2, 3, 4]




const range = (min, max) => [...Array(max - min + 1).keys()].map(i => i + min);

// Or
const range = (min, max) => Array(max - min + 1).fill(0).map((_, i) => min + i);

// Or
const range = (min, max) => Array.from({ length: max - min + 1 }, (_, i) => min + i);

// range(5, 10) === [5, 6, 7, 8, 9, 10]




const flat = arr => [].concat.apply([], arr.map(a => Array.isArray(a) ? flat(a) : a));
// Or
const flat = arr => arr.reduce((a, b) => Array.isArray(b) ? [...a, ...flat(b)] : [...a, b], []);

// Or
// See the browser compatibility at https://caniuse.com/#feat=array-flat
const flat = arr => arr.flat();

// flat(['cat', ['lion', 'tiger']]) returns ['cat', 'lion', 'tiger']



const average = arr => arr.reduce((a, b) => a + b, 0) / arr.length;

const sum = arr => arr.reduce((a, b) => a + b, 0);



const unique = arr => [...new Set(arr)];

// Or
const unique = arr => arr.filter((el, i, array) => array.indexOf(el) === i);

// Or
const unique = arr => arr.reduce((acc, el) => acc.includes(el) ? acc : [...acc, el], []);




const partition = (arr, criteria) => arr.reduce((acc, i) => (acc[criteria(i) ? 0 : 1].push(i), acc), [[], []]);

// Example
// partition([1, 2, 3, 4, 5], n => n % 2);     // returns [[2, 4], [1, 3, 5]]


const removeFalsy = arr => arr.filter(Boolean);

// removeFalsy([0, 'a string', '', NaN, true, 5, undefined, 'another string', false])
// returns ['a string', true, 5, 'another string']


const chunk = (arr, size) => arr.reduce((acc, e, i) => (i % size ? acc[acc.length - 1].push(e) : acc.push([e]), acc), []);

// Example
chunk([1, 2, 3, 4, 5, 6, 7, 8], 3);     // returns [[1, 2, 3], [4, 5, 6], [7, 8]]
chunk([1, 2, 3, 4, 5, 6, 7, 8], 4);     // returns [[1, 2, 3, 4], [5, 6, 7, 8]]


// 数组扁平化
// 先看lodash中的flatten
// _.flatten([1, [2, [3, [4]], 5]])
// 得到结果为  [1, 2, [3, [4]], 5]

// vue中
function simpleNormalizeChildren (children) {
  for (var i = 0; i < children.length; i++) {
    if (Array.isArray(children[i])) {
      return Array.prototype.concat.apply([], children)
    }
  }
  return children
}

// es6中 等价于
function simpleNormalizeChildren (children) {
   return [].concat(...children)
}



 // 重写push等方法，然后再把原型指回原方法
 var ARRAY_METHOD = [ 'push', 'pop', 'shift', 'unshift', 'reverse',  'sort', 'splice' ];
 var array_methods = Object.create(Array.prototype);
 ARRAY_METHOD.forEach(method => {
   array_methods[method] = function () {
     // 拦截方法
     console.log('调用的是拦截的 ' + method + ' 方法，进行依赖收集');
     return Array.prototype[method].apply(this, arguments);
   }
 });