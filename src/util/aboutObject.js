
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




const isPlainObject = v => (!!v && typeof v === 'object' && (v.__proto__ === null || v.__proto__ === Object.prototype));

// isPlainObject(null) === false
// isPlainObject('hello world') === false
// isPlainObject([]) === false
// isPlainObject(Object.create(null)) === false
// isPlainObject(function() {}) === false

// isPlainObject({}) === true
// isPlainObject({ a: '1', b: '2' }) === true


const isEmpty = obj => Object.keys(obj).length === 0 && obj.constructor === Object;

// Or
const isEmpty = obj => JSON.stringify(obj) === '{}';


const getValue = (path, obj) => path.split('.').reduce((acc, c) => acc && acc[c], obj);

// Example
// getValue('a.b', { a: { b: 'Hello World' } });   // 'Hello World';



const omit = (obj, keys) => Object.keys(obj).filter(k => !keys.includes(k)).reduce((res, k) => Object.assign(res, {[k]: obj[k]}), {});

// Example
// omit({a: '1', b: '2', c: '3'}, ['a', 'b']);     // returns { c: '3' }




const pick = (obj, keys) => Object.keys(obj).filter(k => keys.includes(k)).reduce((res, k) => Object.assign(res, {[k]: obj[k]}), {});

// Example
pick({ a: '1', b: '2', c: '3' }, ['a', 'b']);   // returns { a: '1', b: '2' }


const filterObj = (object, predicate) => {
  const result = {}
  const isArray = Array.isArray(predicate)
  for(const [key, value] of Object.entries(object)) {
    if(isArray ? predicate.includes(key) : predicate(key, value, object)) {
      result[key] = value
    }
  }
  return result
}

var object = {
	foo: true,
	bar: false
};

const newObject = filterObject(object, (key, value) => value === true);
//=> {foo: true}

const newObject2 = filterObject(object, ['bar']);
//=> {bar: false}