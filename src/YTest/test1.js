// console.log(F.S, 'test1')

/** 1
 * S.map
 *   	S.map(["foot", "goose", "moose"],function(single){
  		return single.replace(/o/g, "e");
  	}); // =>  ["feet", "geese", "meese"]
 */

let S = F.S;

if (!S) {
  console.log("error");
}

let r1 = S.map(["foot", "goose", "moose"], function(single) {
  return single.replace(/o/g, "e");
});

// console.log(r1); // =>  ["feet", "geese", "meese"]

/** 2
 *
 */

//		S.each(['a', 'b', 'c'], function(index, item){
//  		console.log('item %d is: %s', index, item)
//		})
//
//		var hash = { name: 'kissy.js', size: 'micro' }
//		S.each(hash, function(key, value){
//			console.log('%s: %s', key, value)
//		})

let r2 = S.each(["a", "b", "c"], (item, index) => {
  // console.log("item %d is: %s", index, item);
});

// console.log(r2)

/**3
 *
 */

 let a = {a: 1}
 let b = {b: 2}
 let c = {c: 3}

 let r3 = S.mix({}, a, b, c)
//  console.log(r3)



/**4
   // S.reduce([0,1,2,3,4],function(p, c, index){
  // 	return p + c;
  // });
  // // 首次调用
  // p = 0, c = 1, index = 1
  // //第二次调用
  // p = 1, c = 2, index = 2
  // // 第三次调用
  // p = 3, c= 3, index = 3
  // // 第四次调用
  // p = 6, c = 4, index = 4
  // // 最终返回：10
 */

 let r4 =  S.reduce([10,1,2,3,4],(p, c, index) =>{
  	return p + c;
  });
  // console.log(r4, 'r4')


  /**5
     //
  // obj = {name: 'Jack Bauer',
  // 			prop_1: 'our lord',
  // 			prop_2: 'savior'};
  //
  //
  // 		// => 'Jack Bauer is our lord and savior.'
   */

   let str = '{name} is {prop_1} and {prop_2}.'
     let obj = {name: 'Jack Bauer',
  			prop_1: 'our lord',
        prop_2: 'savior'};

   let r5 = S.substitute(str, obj);

  //  console.log(r5)


function Foo(name) {
  this.name = name
}

Foo.prototype.say = (v)=> {
  console.log(v)
}

// let aa = new Foo('yyy')
// console.log(aa)
// console.log(aa.__proto__)
// console.log(aa.constructor === aa.__proto__.constructor)

// for (let ii in aa) {
//   console.log(ii, aa.hasOwnProperty(ii))
// }

let aa = [1,2,3]
let aa1  = aa.filter(it => {
  return it > 1
})
console.log(aa1)

let aa2 = Array.prototype.filter.call(aa, it => {
  return it > 1
})
console.log(aa2)