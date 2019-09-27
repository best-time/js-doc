import json from 'rollup-plugin-json';
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
// import { uglify } from 'rollup-plugin-uglify';

import { version } from './package.json';

/**
 export default [{
  entry: 'index.js',
  format: 'cjs',
  dest: './dist/distA.js'
},{
  entry: 'indexB.js',
  format: 'iife',
  moduleName: 'indexB',
  dest: './dist/distB.js'
}]

export default {
  entry: 'index.js',
  targets: [{
      dest: 'dist/bundle.cjs.js',
      format: 'cjs'
    },
    {
      dest: 'dist/bundle.umd.js',
      moduleName: 'res',
      format: 'umd'
    },
    {
      dest: 'dist/bundle.es.js',
      format: 'es'
    },
  ]
}
 */
const banner =
  '/*!\n' +
  ` * fs v${version}\n` +
  ` * (c) 2017-${new Date().getFullYear()}\n` +
  ' * Released under the MIT License.\n' +
  ' */'
const footer = `/*\n
ywy
*/
`
// amd – 异步模块定义，用于像RequireJS这样的模块加载器
// cjs – CommonJS，适用于 Node 和 Browserify/Webpack
// es – 将软件包保存为ES模块文件
// iife – 一个自动执行的功能，适合作为<script>标签。（如果要为应用程序创建一个捆绑包，您可能想要使用它，因为它会使文件大小变小。）

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/bundle.js',
    format: 'umd',
    name: 'F',
    exports: 'named',
    banner,
    footer,
    intro: '// 开始注释',
    outro: '// 结束注释',
    sourceMap: true
  },
  plugins: [
    commonjs(),
    babel({
      exclude: 'node_modules/**'
    }),
    json(),
    // uglify()
  ],
  watch: {
    include: 'src/**',
    exclude: 'node_modules/**'
  },
};