import { _curry1, toString } from "./internal/_tool";

/**
 *      type({}); //=> "Object"
 *      type(1); //=> "Number"
 *      type(false); //=> "Boolean"
 *      type('s'); //=> "String"
 *      type(null); //=> "Null"
 *      type([]); //=> "Array"
 *      type(/[A-z]/); //=> "RegExp"
 *      type(() => {}); //=> "Function"
 *      type(undefined); //=> "Undefined"
 */

var type = _curry1(function type(val) {
  return val === null ? 'Null' : (val === undefined ? 'Undefined' : toString.call(val).slice(8, -1))
});

export default type;