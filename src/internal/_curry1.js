export default function _curry1(fn) {
  return function f1(...args) {
    if (args.length) {
      return fn.apply(this, args)
    } else {
      return f1
    }
  }
}