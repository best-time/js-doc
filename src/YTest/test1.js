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
