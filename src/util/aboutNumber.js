const average = (...args) => args.reduce((a, b) => a + b) / args.length;
// average(1, 2, 3, 4) === 2.5

const sum = (...args) => args.reduce((a, b) => a + b);

// sum(1, 2, 3, 4) === 10


const prefixWithZeros = (number, length) => (number / Math.pow(10, length)).toFixed(length).substr(2);

// Or
const prefixWithZeros = (number, length) => `${Array(length).join('0')}${number}`.slice(-length);

// Or
const prefixWithZeros = (number, length) => String(number).padStart(length, '0');

// prefixWithZeros(42, 5) === '00042'