//
parseInt 第二个参数是一个2到36之间的整数值，用于指定转换中采用的基数。如果省略该参数或其值为0，则数字将以10为基础来解析

//
使用的 32 位系统，为了性能考虑使用低位存储了变量的类型信息：

000：对象
1：整数
010：浮点数
100：字符串
110：布尔

有 2 个值比较特殊：
undefined：用 -2^{30} （−2^30）表示。
null：对应机器码的 NULL指针，一般是全零。
null就出了一个 bug。根据 type tags 信息，低位是 000，因此 null被判断成了一个对象
而javascript 中会把二进制前三位都为0的判断为object类型，而null的二进制表示全都是0，自然前三位也是0，所以执行typeof时会返回 ‘object’。

//
[ [3,2,1].reduce(Math.pow), [].reduce(Math.pow) ] // an error

如果数组为空并且没有提供initialValue， 会抛出TypeError 。
如果数组仅有一个元素（无论位置如何）并且没有提供initialValue，
或者有提供initialValue但是数组为空，那么此唯一值将被返回并且callback不会被执行。

//
var ary = [0,1,2];
ary[10] = 10;
ary.filter(function(x) {
  return x === undefined;
});
output: []

filter 为数组中的每个元素调用一次 callback 函数，并利用所有使得 callback 返回 true 或 等价于 true 的值 的元素创建一个新数组。
callback 只会在已经赋值的索引上被调用，对于那些已经被删除或者从未被赋值的索引不会被调用。
那些没有通过 callback 测试的元素会被跳过，不会被包含在新数组中。

//
Array.prototype 是个数组

//
[0] == true  // false
规范指出，== 相等中，如果有一个操作数是布尔类型，会先把他转成数字，所以比较变成了 [0] == 1；
同时规范指出如果其他类型和数字比较，会尝试把这个类型转成数字再进行宽松比较，
而对象（数组也是对象）会先调用它的 toString() 方法，此时 [0] 会变成 "0"，
然后将字符串 "0" 转成数字 0，而 0 == 1 的结果显然是 false。

//
var ary = Array(3);
ary[0] = 2;
ary.map(function(elem) {
  return "1";
});

答案是D。实际上结果是 ["1", undefined x 2]，因为规范写得很清楚：

map 方法会给原数组中的每个元素都按顺序调用一次 callback 函数。callback 每次执行后的返回值组合起来形成一个新数组。callback 函数只会在有值的索引上被调用；那些从来没被赋过值或者使用 delete 删除的索引则不会被调用。

//
禁止修改函数名
function foo() {}
var oldName = foo.name;
foo.name = "bar";
[oldName, foo.name];

=> C. ["foo", "foo"]


//
所有的数组元素被转换成字符串，再用一个分隔符将这些字符串连接起来。如果元素是undefined 或者null， 则会转化成空字符串。

[,,,].join(", ")  => ", , "

//

Function构造器的属性：

Function 构造器本身也是个Function。他的 length 属性值为 1 。该属性 Writable: false, Enumerable: false, Configurable: true。
Function原型对象的属性：

Function原型对象的 length 属性值为 0 。
所以，在本例中，a代表的是 Function 构造器的 length 属性，而b代表的是 Function 原型的 length 属性。


//
看MDN文档，对 Math.min的描述：

如果没有参数，结果为Infinity。
对 Math.max 的描述：

如果没有参数，结果为-Infinity。

//
if("http://giftwrapped.com/picture.jpg".match(".gif")) {
  console.log("a gif file");
} else {
  console.log("not a gif file");
}
=> "a gif file"

答案是A。看MDN对 match 方法的描述：

如果传入一个非正则表达式对象，则会隐式地使用 new RegExp(obj)
将其转换为正则表达式对象。
所以我们的字符串 ".gif" 会被转换成正则对象 /.gif/，会匹配到 "/gif"。

//
function foo(a) {
  var a;
  return a;
}

function bar(a) {
  var a = "bye";
  return a;
}

[foo("hello"), bar("hello")]

=> ["hello", "bye"]
一个变量在同一作用域中已经声明过，会自动移除 var 声明，但是赋值操作依旧保留，结合前面提到的变量提升机制，你就明白了。