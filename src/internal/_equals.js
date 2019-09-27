import type from "../type";

function _functionName(f) {
  // String(x => x) evaluates to "x => x", so the pattern may not match.
  var match = String(f).match(/^function (\w*)/);
  return match == null ? '' : match[1];
}

export default function _equals(a, b, stackA, stackB) {
  if (
    type(a) !== type(b) || // 不同类型
    a == null || b == null || // null undefined
    a !== a || b !== b  // NaN
  ) {
    return false
  }
  let typeA = type(a)
  switch (typeA) {
    case 'Array':
      if(a.length !== b.length) {
        return false
      } else {
        
      }
      break
    case 'Boolean':
    case 'Number':
    case 'String':
      return a === b
      break;
    case 'Date':
      return a.valueOf() === b.valueOf()
      break;
    case 'Error':
      return a.name === b.name && a.message === b.message;
  }
}