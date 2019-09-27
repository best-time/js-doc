export default Number.isInteger || function _isInteger(n) {
  return (n << 0) === n
}