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