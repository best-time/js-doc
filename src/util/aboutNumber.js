const average = (...args) => args.reduce((a, b) => a + b) / args.length;
// average(1, 2, 3, 4) === 2.5

const sum = (...args) => args.reduce((a, b) => a + b);

// sum(1, 2, 3, 4) === 10

const prefixWithZeros = (number, length) =>
  (number / Math.pow(10, length)).toFixed(length).substr(2);

// Or
const prefixWithZeros = (number, length) =>
  `${Array(length).join('0')}${number}`.slice(-length);

// Or
const prefixWithZeros = (number, length) =>
  String(number).padStart(length, '0');

// prefixWithZeros(42, 5) === '00042'

// 数字取整
var
    num1 = parseInt("2015nov"),  //2015
    num2 = parseInt(""),  //NaN
    num3 = parseInt("0xA"),  //10(十六进制)
    num4 = parseInt(20.15),  //20
    num5 = parseInt(-20.15),  //-20
    num6 = parseInt("070");  //56(八进制数)

    var num1 = ~~20.15,  //20
    num2 = ~~(-20.15);  //-20

    var num1 = 20.15^0,  //20
    num2 = (-20.15)^0;  //-20

    var num1 = 20.15 << 0,  //20
    num2 = (-20.15) << 0,  //-20

    var num1 = 20.15 | 0,  //20
    num2 = (-20.15) | 0,  //-20

export default {
  /**
   * 返回数字长度
   * @param {*number} num Input number
   */
  digitLength(num) {
    const len = (num.toString().split('.')[1] || '').length;
    return len > 0 ? len : 0;
  },
  /**
   * 把小数转成整数,如果是小数则放大成整数
   * @param {*number} num 输入数
   */
  float2Fixed(num) {
    return Number(num.toString().replace('.', ''));
  },
  /**
   * 精确加法
   * plus(0.1, 0.2) // = 0.3, not 0.30000000000000004
   */
  plus(num1, num2) {
    const baseNum = Math.pow(
      10,
      Math.max(this.digitLength(num1), this.digitLength(num2))
    );
    return (num1 * baseNum + num2 * baseNum) / baseNum;
  },
  /**
   * 精确减法
   * minus(1.0, 0.9) // = 0.1, not 0.09999999999999998
   */
  minus(num1, num2) {
    const baseNum = Math.pow(
      10,
      Math.max(this.digitLength(num1), this.digitLength(num2))
    );
    return (num1 * baseNum - num2 * baseNum) / baseNum;
  },

  /**
   * 精确乘法
   * times(3, 0.3) // = 0.9, not 0.8999999999999999
   */
  times(num1, num2) {
    const num1Changed = this.float2Fixed(num1);
    const num2Changed = this.float2Fixed(num2);
    const baseNum = this.digitLength(num1) + this.digitLength(num2);
    const leftValue = num1Changed * num2Changed;
    return leftValue / Math.pow(10, baseNum);
  },

  /**
   * 精确除法
   * divide(1.21, 1.1) // = 1.1, not 1.0999999999999999
   */
  divide(num1, num2) {
    const num1Changed = this.float2Fixed(num1);
    const num2Changed = this.float2Fixed(num2);
    return (
      (num1Changed / num2Changed) *
      Math.pow(10, this.digitLength(num2) - this.digitLength(num1))
    );
  },
  /**
   * 四舍五入
   * round(0.105, 2); // = 0.11, not 0.1
   */
  round(num, ratio) {
    const base = Math.pow(10, ratio);
    return this.divide(Math.round(this.times(num, base)), base);
  },
};

// 奇偶
const isEven = (v) => v & (1 === 0);
const isOdd = (v) => v & (1 === 1);

console.log(~~11.71); // 11
console.log(11.71 >> 0); // 11
console.log(11.71 << 0); // 11
console.log(11.71 | 0); // 11
console.log(11.71 >>> 0); // 11
