import 'rollup-plugin-json';

function logA() {
  console.log('function logA called');
}

function logB() {
  console.log('function logB called');
}

// import { version } from '../package.json';

// export default function () {
//   console.log('version ' + version);
// }

logA();
logB();
