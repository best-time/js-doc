
/*

super 关键字
this关键字总是指向函数所在的当前对象，ES6 又新增了另一个类似的关键字super，指向当前对象的原型对象
JavaScript 引擎内部，super.foo等同于
Object.getPrototypeOf(this).foo（属性）
或
Object.getPrototypeOf(this).foo.call(this)（方法）。
*/

const proto = {
  foo: 'hello'
};

const obj = {
  foo: 'world',
  find() {
    return super.foo;
  }
};

Object.setPrototypeOf(obj, proto);
obj.find() // "hello"