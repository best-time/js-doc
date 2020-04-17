/**
 * charAt
 * charCodeAt
 * concat
 * indexOf
 * lastIndexOf
 * localeCompare
 * match
 * replace
 * search
 * slice
 * split
 * substr
 * substring
 * toLocaleUpperCase
 * toLocaleLowerCase
 * toLowerCase
 * toUpperCase
 * toString  ⭐️ toString 支持一个参数, 转为对应的进制的数值
 * valueOf
 *  ------------------
 * es 6
 * includes
 * startsWith
 * endsWith
 * repeat
 * padStart
 * padEnd
 * trimStart  别名 trimLeft
 * trimEnd    别名 trimRight
 * matchAll
 * -fromCodePoint
 * -raw
 * -codePointAt
 * -normalize
 */

 // 字符串遍历
 // 这个遍历器最大的优点是可以识别大于0xFFFF的码点
 for (let codePoint of 'foo') {
  console.log(codePoint)
}
// "f"
// "o"
// "o"


// 模版字符串中调用函数
function fn() {
  return "Hello World";
}

`foo ${fn()} bar`

// 标签模版

alert`hello`
// 等同于
alert(['hello'])


let a = 5;
let b = 10;

tag`Hello ${ a + b } world ${ a * b }`;
// 等同于
tag(['Hello ', ' world ', ''], 15, 50);

// 函数tag依次会接收到多个参数。

function tag(stringArr, value1, value2){
  // ...
}

// 等同于

function tag(stringArr, ...values){
  // ...
}