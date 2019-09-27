import { toString } from "./_tool";

export default Array.isArray || function _isArray(val) {
  return (val != null && val.length >= 0 && toString.call(val) === '[object Array]')
}