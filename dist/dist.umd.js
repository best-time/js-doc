(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('rollup-plugin-json')) :
  typeof define === 'function' && define.amd ? define(['rollup-plugin-json'], factory) :
  (global = global || self, factory(global.rollupPluginJson));
}(this, function (rollupPluginJson) { 'use strict';

  rollupPluginJson = rollupPluginJson && rollupPluginJson.hasOwnProperty('default') ? rollupPluginJson['default'] : rollupPluginJson;

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

}));
