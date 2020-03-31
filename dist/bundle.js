/*!
 * fs v1.0.0
 * (c) 2017-2020
 * Released under the MIT License.
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.F = {}));
}(this, function (exports) { 'use strict';

  // 开始注释

  const memory = fn => {
    let obj = {};
    return n => {
      if (!obj[n]) obj[n] = fn(n);
      return obj(n);
    };
  };
  const run = generatorFunc => {
    let it = generatorFunc();
    let val = it.next();
    return new Promise((resolve, reject) => {
      const next = result => {
        if (result.done) {
          resolve(result.value);
        }

        result.value = Promise.resolve(result.value);
        result.value.then(res => {
          let result = it.next(res);
          next(result);
        }).catch(err => {
          reject(err);
        });
      };

      next(val);
    });
  };
  /**
   * function *func() {
   *  let res = yield api(data)
   *  let res2 = yield api(data2)
   *  let res3 = yield api(data3)
   * }
   * run(func)
   */

  /**
   * 
   * @param {*} func 
   * @param {*} time 
   * @param {*} option 
   * 
   * leading 为是否在进入时立即执行一次， trailing 为是否在事件触发结束后额外再触发一次，
   * 原理是利用定时器，如果在规定时间内再次触发事件会将上次的定时器清除，
   * 即不会执行函数并重新设置一个新的定时器，直到超过规定时间自动触发定时器中的函数
   */

  const debounce = (func, time = 17, option = {
    leading: true,
    trailing: true,
    context: null
  }) => {
    let timer;

    const _debounce = (...args) => {
      if (timer) clearTimeout(timer);

      if (option.leading && !timer) {
        timer = setTimeout(null, time);
        func.apply(option.context, args);
      } else if (option.trailing) {
        timer = setTimeout(() => {
          func.apply(option.context, args);
          timer = null;
        }, time);
      }
    };

    _debounce.cancel = () => {
      clearTimeout(timer);
      timer = null;
    };

    return _debounce;
  };
  const throttle = (func, time = 17, option = {
    leading: true,
    trailing: false,
    context: null
  }) => {
    let previous = new Date(0).getTime(),
        timer;

    const _throttle = (...args) => {
      let now = new Date().getTime();

      if (!option.leading) {
        if (timer) return;
        timer = setTimeout(() => {
          timer = null;
          func.apply(option.context, args);
        }, time);
      } else if (now - previous > time) {
        func.apply(option.context, args);
        previous = now;
      } else if (option.trailing) {
        clearTimeout(timer);
        timer = setTimeout(() => {
          func.apply(option.context, args);
        }, time);
      }
    };

    _throttle.cancel = () => {
      previous = 0;
      clearTimeout(timer);
      timer = null;
    };

    return _throttle;
  };
  let imgList = [...document.querySelectorAll('img')],
      num = imgList.length;

  const proxy = obj => {
    return new Proxy(obj, {
      get(target, key) {
        if (key.startsWith('_')) {
          throw new Error('private key');
        }

        return Reflect.get(target, key);
      },

      ownKeys(target) {
        return Reflect.ownKeys(target).filter(key => !key.startsWith('_'));
      }

    });
  };

  class EventEmitter {
    constructor() {
      this.subs = {};
    }

    on(event, cb) {
      (this.subs[event] || (this.subs[event] = [])).push(cb);
    }

    trigger(event, ...args) {
      this.subs[event] && this.subs[event].map(cb => {
        cb(...args);
      });
    }

    once(event, onceCb) {
      const cb = (...args) => {
        onceCb(...args);
        this.off(event, onceCb);
      };

      this.on(event, cb);
    }

    off(event, offCb) {
      if (this.subs[event]) {
        let index = this.subs[event].findIndex(cb => cb === offCb);
        this.subs[event].splice(index, 1);
        if (!this.subs[event].length) delete this.subs[event];
      }
    }

  }
  const deepCopy = source => {
    let target = Array.isArray(source) ? [] : {};

    for (var k in source) {
      if (typeof source[k] === 'object') {
        target[k] = deepCopy(source[k]);
      } else {
        target[k] = source[k];
      }
    }

    return target;
  };
  //   add: addClass,
  //   rm: rmClass
  // };

  var utils = {
    isArray: Array.isArray || function (value) {
      return Object.prototype.toString.call(value) === '[object Array]';
    },
    isPlainObj: value => value === Object(value),
    toArray: value => [].slice.call(value),
    prepareArgs: function (args, element) {
      args = utils.toArray(args);
      args.unshift(element);
      return args;
    },
    getObjKeyByValue: function (obj, value) {
      for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
          if (obj[key] === value) return key;
        }
      }
    },
    retrieve: (value, fallback) => value == null ? fallback : value,
    serialize: data => JSON.stringify(data),
    unserialize: data => data == null ? data : JSON.parse(data)
  };

  var xStore = function (prefix = 'store', store) {
    this.prefix = prefix;
    this.store = store;
  };

  xStore.prototype.addPrefix = function (key) {
    return `${this.prefix}-${key}`;
  };

  xStore.prototype.get = function (keys, fallback) {
    var key;

    if (utils.isArray(keys)) {
      var result = {};

      for (var i = 0, l = keys.length; i < l; i++) {
        key = keys[i];
        result[key] = this.get(key, fallback);
      }

      return result;
    } else {
      key = this.addPrefix(keys);
      return utils.retrieve(utils.unserialize(this.store.getItem(key)), fallback);
    }
  };

  xStore.prototype.set = function (key, value) {
    if (utils.isPlainObj(key)) {
      for (var k in key) {
        if (key.hasOwnProperty(k)) {
          this.set(k, key[k]);
        }
      }
    } else {
      key = this.addPrefix(key);
      this.store.setItem(key, utils.serialize(value));
    }

    return this;
  };

  xStore.prototype.invert = function (key) {
    return this.set(key, !this.get(key));
  };

  xStore.prototype.add = function (key, value) {
    return this.set(key, this.get(key) + parseInt(value, 10));
  };

  xStore.prototype.concat = function (key, string) {
    return this.set(key, this.get(key) + string);
  };

  xStore.prototype.push = function (key, value) {
    var args = utils.toArray(arguments),
        arr = this.get(key, []);
    args.splice(0, 1);
    arr.push.apply(arr, args);
    return this.set(key, arr);
  };

  xStore.prototype.extend = function (key, k, v) {
    // variables?
    var value = this.get(key, {});

    if (utils.isPlainObj(k)) {
      for (var _k in k) {
        if (k.hasOwnProperty(_k)) value[_k] = k[_k];
      }
    } else {
      value[k] = v;
    }

    return this.set(key, value);
  };

  xStore.prototype.remove = function (keys) {
    keys = utils.isArray(keys) ? keys : utils.toArray(arguments);

    for (var i = 0, l = keys.length; i < l; i++) {
      var key = this.addPrefix(keys[i]);
      this.store.removeItem(key);
    }

    return this;
  };

  xStore.prototype.empty = function () {
    for (var i = this.store.length - 1; i >= 0; i--) {
      var key = this.store.key(i);

      if (key.indexOf(this.prefix) === 0) {
        this.store.removeItem(key);
      }
    }

    return this;
  };

  xStore.prototype.all = function () {
    var obj = {};

    for (var i = 0, l = this.store.length; i < l; i++) {
      var key = this.store.key(i);

      if (key.indexOf(this.prefix) === 0) {
        var value = utils.unserialize(this.store.getItem(key));
        key = key.substring(this.prefix.length);
        obj[key] = value;
      }
    }

    return obj;
  };

  function $(args) {
    return new Zbase(args);
  }

  function Zbase(args) {
    // 将elements数组在这里声明，当 new Zbase();就会有一份新的数组
    // elements 用来存放 节点数组
    this.elements = [];

    if (typeof args == "string") {
      // css 模拟  如  $('.cp span').css('color','red');
      // 传进来的 字符串 有包含空格
      if (args.indexOf(" ") != -1) {
        var ele = args.split(" ");
        var childElements = [];
        var node = [];

        for (var i = 0; i < ele.length; i++) {
          if (node.length == 0) node.push(document);

          switch (ele[i].charAt(0)) {
            case "#":
              childElements = [];
              childElements.push(this.getId(ele[i].substring(1)));
              node = childElements;
              break;

            case ".":
              childElements = [];

              for (var j = 0; j < node.length; j++) {
                var temps = this.getClassName(ele[i].substring(1), node[j]);

                for (var k = 0; k < temps.length; k++) {
                  childElements.push(temps[k]);
                }
              }

              node = childElements;
              break;

            default:
              childElements = [];

              for (var j = 0; j < node.length; j++) {
                // 这里的 node 是上一次的子节点，在这一次变成了父节点来为这次的子节点做遍历！！！
                var temps = this.getTagName(ele[i], node[j]);

                for (var k = 0; k < temps.length; k++) {
                  childElements.push(temps[k]);
                }
              } // 遍历的子节点变成父节点，供给下一次子节点的子节点用。


              node = childElements;
          }
        }

        this.elements = childElements;
      } else {
        // find 模拟  如  $('.cp')find('span').css('color','red');
        switch (args.charAt(0)) {
          case "#":
            this.elements.push(this.getId(args.substring(1)));
            break;

          case ".":
            this.elements = this.getClassName(args.substring(1));
            break;

          default:
            this.elements = this.getTagName(args);
        }
      }
    } else if (typeof args == "object") {
      // args 是一个对象，对象不存在就是 undefined ，而不是 ‘undefined’，带引号的是对象的类型，
      if (args != undefined) {
        this.elements[0] = args;
      }
    }
  }

  Zbase.prototype.find = function (str) {
    var childElements = [];

    for (var t = 0; t < this.elements.length; t++) {
      switch (str.charAt(0)) {
        case "#":
          // 虽然这么写，但没什么意义，因为 id是唯一的，想得到id不用利用他的父元素再来找id
          childElements.push(this.getId(str.substring(1)));
          break;

        case ".":
          var temp = this.getClassName(str.substring(1), this.elements[t]);

          for (var j = 0; j < temp.length; j++) {
            childElements.push(temp[j]);
          }

          break;

        default:
          var temp = this.getTagName(str, this.elements[t]);

          for (var j = 0; j < temp.length; j++) {
            childElements.push(temp[j]);
          }

      }
    }

    this.elements = childElements;
    return this;
  }; // 注意： elements 不能放在 prototype 原型里面，不然参数会共享，
  //Zbase.prototype.elements = [];


  Zbase.prototype.getId = function (id) {
    return document.getElementById(id);
  };

  Zbase.prototype.getName = function (name) {
    var tags = document.getElementsByName(name);

    for (var t = 0; t < tags.length; t++) {
      this.elements.push(tags[t]);
    }
  };

  Zbase.prototype.getTagName = function (tagName, parentNode) {
    var node = null;
    var temps = [];

    if (parentNode != undefined) {
      node = parentNode; //  node 是 [object HTMLDivElement]  及 id 包含下的 html 片段
    } else {
      node = document; //  document   是   [object HTMLDocument]  及所有html 片段  ,typeof document 是 object
    }

    var tags = node.getElementsByTagName(tagName);

    for (var t = 0; t < tags.length; t++) {
      //[object HTMLParagraphElement]
      temps.push(tags[t]);
    }

    return temps;
  };

  Zbase.prototype.getClassName = function (className, parentNode) {
    var node = null;
    var temps = [];

    if (parentNode != undefined) {
      node = parentNode; //  node 是 [object HTMLDivElement]  及 id 包含下的 html 片段
    } else {
      node = document; //  document   是   [object HTMLDocument]  及所有html 片段  ,typeof document 是 object
    }

    var tags = node.getElementsByClassName(className);

    for (var t = 0; t < tags.length; t++) {
      //[object HTMLParagraphElement]
      if (new RegExp("(\\s|^)" + className + "(\\s|$)").test(tags[t].className)) {
        temps.push(tags[t]);
      }
    }

    return temps;
  };
  /**
   * 给节点 添加 class name
   * @param className
   * @returns {Zbase}
   */


  Zbase.prototype.addClass = function (className) {
    for (var i = 0; i < this.elements.length; i++) {
      // 利用正则表达式 判断 添加的 classname 是否已经存在；
      // (\\s|^) 表示 空格或重第一个开始判断， (\\s|$) 表示 空格或 结束
      if (!this.elements[i].className.match(new RegExp("(\\s|^)" + className + "(\\s|$)"))) {
        this.elements[i].className += " " + className;
      }
    }

    return this;
  };

  Zbase.prototype.removeClass = function (className) {
    for (var i = 0; i < this.elements.length; i++) {
      // 先做个正则表达式 判断 是否存在 要替换的 class name ，
      if (this.elements[i].className.match(new RegExp("(\\s|^)" + className + "(\\s|$)"))) {
        // 如果存在，将 要替换的 name  = 空；再付给 elements[i]
        this.elements[i].className = this.elements[i].className.replace(new RegExp("(\\s|^)" + className + "(\\s|$)"), "");
      }
    }

    return this;
  };
  /**
   * 获取 相同 节点 下的 第几个 节点
   *  $().getTagName("p").getElement(1)
   * @param num
   * @returns {Zbase}
   */


  Zbase.prototype.getElement = function (num) {
    var ele = this.elements[num];
    this.elements = []; // 清空后 重新赋值 ！！！！
    // 反正 就是 对 elements 进行操作就是了，elements保存了所有节点的信息

    this.elements[0] = ele;
    return this;
  };

  Zbase.prototype.getE = function (num) {
    return this.elements[num];
  };
  /**
   * 获取 第一个节点
   * @returns {*}
   */


  Zbase.prototype.firstE = function () {
    return this.elements[0];
  };
  /**
   * 获取最后一个节点
   * @returns {*}
   */


  Zbase.prototype.lastE = function () {
    return this.elements[this.elements.length - 1];
  };
  /**
   * 获取 / 设置 某一个节点的 属性 ，包括自定义属性
   * @param attr
   * @returns {string}
   */


  Zbase.prototype.arrt = function (attr, value) {
    for (var i = 0; i < this.elements.length; i++) {
      if (arguments.length == 1) {
        return this.elements[i].getAttribute(attr);
      } else if (arguments.length == 2) {
        return this.elements[i].setAttribute(attr, value);
      }
    }

    return this;
  };
  /**
   * 操作 css
   * @param css_type
   * @param value
   * @returns {Zbase}
   */


  Zbase.prototype.css = function (css_type, value) {
    //  js 调用属性有 两种方法 ，xx.xx 或 xx[xx] ，这里传进的是一个字符串，所以用  xx[xx]
    var tags = this.elements.length;

    for (var t = 0; t < tags; t++) {
      /*// 当只传进一个参数时，css_type，说明目的是为获取css样式，而不是设置，所以返回css 样式
               // 但这种方法有局限性，只能获取 行内 的 css 样式    <div id="div_id" style="color:red">  div_id  </div>
               if(arguments.length == 1){
               return this.elements[t].style[css_type];
               }*/
      if (typeof css_type == "object") {
        for (var c in css_type) {
          this.elements[t].style[c] = css_type[c];
        }
      } else {
        //  接下来用第二中方法
        if (arguments.length == 1) {
          return _getStyle(this.elements[t], css_type);
        }

        this.elements[t].style[css_type] = value;
      }
    }

    return this;
  };
  /**
   * 获取节点元素的 样式 的 值
   * @param element 节点
   * @param attr  样式
   * @returns {*} 样式的值
   */


  function _getStyle(element, attr) {
    if (typeof window.getComputedStyle != "undefined") {
      // W3C
      return window.getComputedStyle(element, null)[attr];
    } else if (typeof element.currentStyle != "underfined") {
      // IE
      return element.currentStyle[attr];
    }
  }
  /**
   * 获取节点元素的 样式 的 值
   * @param element 节点
   * @param attr  样式
   * @returns {*} 样式的值
   */


  Zbase.prototype._centerInWindow = function (element, attr) {
    if (typeof window.getComputedStyle != "undefined") {
      // W3C
      return window.getComputedStyle(element, null)[attr];
    } else if (typeof element.currentStyle != "underfined") {
      // IE
      return element.currentStyle[attr];
    }
  };
  /**
   * 通过 name 得到表单
   * @param name
   * @returns {Zbase}
   */


  Zbase.prototype.form = function (name) {
    for (var i = 0; i < this.elements.length; i++) {
      this.elements[i] = this.elements[i][name];
    }

    return this;
  };
  /**
   * 设置表单字段内容获取
   * @param str
   * @returns {*}
   */


  Zbase.prototype.value = function (str) {
    for (var i = 0; i < this.elements.length; i++) {
      if (arguments.length == 0) {
        return this.elements[i].value;
      }

      this.elements[i].value = str;
    }

    return this;
  };
  /**
   *  操作 html
   * @param str
   * @returns {*}
   */


  Zbase.prototype.html = function (str) {
    for (var t = 0; t < this.elements.length; t++) {
      // 当不传参数 直接 调用 .html（） 时，就 将原本的 innerHTML 返回，而不是设置 innerHTML；
      // 如  $().getTagName("p").html() ；
      if (arguments.length == 0) {
        return this.elements[t].innerHTML;
      } // 当有参数时 设置  innerHTML = str;


      this.elements[t].innerHTML = str;
    }

    return this;
  };

  Zbase.prototype.click = function (fun) {
    for (var t = 0; t < this.elements.length; t++) {
      this.elements[t].onclick = fun;
    }

    return this;
  };
  /**
   * 鼠标的 移入 移出 事件
   * @param over
   * @param out
   * @returns {Zbase}
   */


  Zbase.prototype.hover = function (over, out) {
    for (var t = 0; t < this.elements.length; t++) {
      this.elements[t].onmouseover = over;
      this.elements[t].onmouseout = out;
    }

    return this;
  };
  /**
   *  将元素  显示 display = "block"
   * @returns {Zbase}
   */


  Zbase.prototype.show = function () {
    for (var t = 0; t < this.elements.length; t++) {
      this.elements[t].style.display = "block";
    }

    return this;
  };
  /**
   * 将元素 隐藏  display = "none"
   * @returns {Zbase}
   */


  Zbase.prototype.hide = function () {
    for (var t = 0; t < this.elements.length; t++) {
      this.elements[t].style.display = "none";
    }

    return this;
  };
  /**
   * 设置 div 在 当前窗口的 居中 位置
   * @param width   div 的 宽
   * @param heigh   div 的 高
   * @returns {Zbase}
   */


  Zbase.prototype.centerInWindow = function (width, heigh) {
    var top = (getInner().height - heigh) / 2 + getScroll().top;
    var left = (getInner().width - width) / 2 + getScroll().left;

    for (var t = 0; t < this.elements.length; t++) {
      this.elements[t].style.top = top + "px";
      this.elements[t].style.left = left + "px";
    }

    return this;
  };
  /**
   * 浏览器 窗口 大小 改变是事件
   * @param fun  事件的方法
   * @returns {Zbase}
   */


  Zbase.prototype.windowResize = function (fun) {
    for (var t = 0; t < this.elements.length; t++) {
      var ele = this.elements[i];

      _addEvent(window, "resize", function () {
        fun();

        if (ele.offsetLeft > getInner().width + getScroll().left - ele.offsetWidth) {
          ele.style.left = getInner().width + getScroll().left - ele.offsetWidth + "px";

          if (ele.offsetLeft <= 0 + getScroll().left) {
            ele.style.left = 0 + getScroll().top + "px";
          }
        }

        if (ele.offsetTop > getInner().height + getScroll().top - ele.offsetHeight) {
          ele.style.top = getInner().height + getScroll().top - ele.offsetHeight + "px";

          if (ele.offsetTop <= 0 + getScroll().top) {
            ele.style.top = 0 + getScroll().top + "px";
          }
        }
      });
    }

    return this;
  };
  /**
   * 将屏幕完全遮住的功能，如登陆弹窗，需要将背景置灰色透明
   * 用法  $().getId("screen")。screenLock（）;
   *
   * @returns {Zbase}
   */


  Zbase.prototype.screenLock = function () {
    for (var t = 0; t < this.elements.length; t++) {
      fixedScroll.top = getScroll().top;
      fixedScroll.left = getScroll().left; // 将 宽度 和 高度 设为 当前窗口的 大小

      this.elements[t].style.height = getInner().height + getScroll().top + "px";
      this.elements[t].style.width = getInner().width + getScroll().left + "px";
      this.elements[t].style.display = "block";
      document.documentElement.style.overflow = "hidden";

      _addEvent(this.elements[i], "mousedown", predef);

      _addEvent(this.elements[i], "mouseup", predef);

      _addEvent(this.elements[i], "selectsart", predef);

      _addEvent(window, "scroll", fixedScroll);
    }

    return this;
  };
  /**
   * 关闭屏幕遮住功能，配合  screenLock（） 方法使用
   * @returns {Zbase}
   */


  Zbase.prototype.screenUnLock = function () {
    for (var t = 0; t < this.elements.length; t++) {
      this.elements[t].style.display = "none";
      document.documentElement.style.overflow = "auto";

      _removeEvent(this.elements[i], "mousedown", predef);

      _removeEvent(this.elements[i], "mouseup", predef);

      _removeEvent(this.elements[i], "selectsart", predef);

      _removeEvent(window, "scroll", fixedScroll);
    }

    return this;
  };
  /**
   * 给一个 元素添加动画
   * 如  $('#divId').animate('left',10,700,1000);
   * @param attr 样式 ，一般是 left 或 top
   * @param step 移动的距离
   * @param target 移动的终点
   * @param t 每次移动的毫秒
   */


  Zbase.prototype.animate = function (obj) {
    for (var i = 0; i < this.elements.length; i++) {
      var ele = this.elements[i];
      var attr = obj["attr"] == "x" ? "left" : obj["attr"] == "y" ? "top" : "left"; // 给一个默认值，默认 动画左右移动

      var start = obj["start"] != undefined ? obj["start"] : _getStyle(ele, attr); //默认值 默认节点的位置，

      var t = obj["t"] != undefined ? obj["t"] : 50; // 默认动画为 50 ms

      var step = obj["step"] != undefined ? obj["step"] : 10; //默认移动步长 10px

      var target = obj["alter"] + start; // 必选值

      if (step > target) step = -step;
      ele.style[attr] = start + "px";
      clearInterval(window.time);
      var nowPosition = 0;
      var time = setInterval(function () {
        nowPosition = parseInt(_getStyle(ele, attr));
        ele.style[attr] = nowPosition + step + "px"; // if 判断 放在赋值的后面，会减掉多出来的一个节拍！！

        if (step > 0 && nowPosition >= target) {
          ele.style[attr] = target + "px";
          clearInterval(time);
        } else if (step < 0 && nowPosition <= target) {
          ele.style[attr] = target + "px";
          clearInterval(time);
        }
      }, t);
    }
  };
  /**
   *  插件接口  ，当一些比较不经常用的东西可以以插件的形式载入，避免 zZbase 文件冗余
   *  <script type="text/javascript" src="../js/zZbase_drag.js"></script>
   *  例如 一个 zZbase_drag.js 插件，利用下面函数将插件的 内容加载到 原型函数中
   * @param name   插件函数名
   * @param fun    插件方法
   */


  Zbase.prototype.extend = function (name, fun) {
    Zbase.prototype[name] = fun;
  };
  /**
   * 设置事件发生器，绑定所有节点的事件，给所有节点添加事件
   * @param event
   * @param fun
   * @returns {Zbase}
   */


  Zbase.prototype.bind = function (event, fun) {
    for (var t = 0; t < this.elements.length; t++) {
      _addEvent(this.elements[t], event, fun);
    }

    return this;
  };
  /**
   * 封装现代事件 ，因为 存在 IE 的兼容问题，所以在 else 的 地方处理的比较麻烦
   * 添加事件
   * @param obj   元素节点，需要注册事件的 节点
   * @param type  事件类型 click 或 movie
   * @param fun   处理事件的方法
   * @returns {boolean}
   */


  function _addEvent(obj, type, fun) {
    if (typeof obj.addEventListener != "undefined") {
      obj.addEventListener(type, fun, false);
    } else {
      // IE 的 现代事件绑定有很多漏洞，所以用原始的事件绑定模拟 现代事件绑定
      //创建一个存放事件的哈希表
      if (!obj.events) obj.events = {}; // 第一次执行时

      if (!obj.events[type]) {
        // 创建一个存放事件处理函数的数组
        obj.events[type] = []; // 把第一次事件处理函数添加到第一个位置

        if (obj["on" + type]) obj.events[type][0] = fun;
      } else {
        // 判断比较是否传进了重复的点击事件，是的话不做处理，跳过
        if (_addEvent.equal(obj.events[type], fun)) return false;
      } // 从第二次开始用事件计数器来存储


      obj.events[type][_addEvent.ID++] = fun; // 执行事件处理函数

      obj["on" + type] = _addEvent.exec;
    }
  } // 直接 var ID =  1  为什么不行，因为全局变量是魔鬼 ID是给 addEvent用的，就应该是addEvent的变量


  _addEvent.ID = 1; // 执行事件处理函数

  _addEvent.exec = function (e) {
    var e = event || _addEvent.fixEvent(window.event);

    var es = this.events[e.type];

    for (var i in es) {
      es[i].call(this, e);
    }
  };

  _addEvent.equal = function (es, fun) {
    for (var i in es) {
      if (es[i] == fun) return true;
    }

    return false;
  }; // 把IE 常用的 Event 对象 配对到 W3C 中去 ， 其实也就是 重写 IE 的 默认方法


  _addEvent.fixEvent = function (e) {
    //e.preventDefault() 是 w3c 的 方法
    e.preventDefault = _addEvent.fixEvent.preventDefault;
    e.stopPropagation = _addEvent.fixEvent.stopPropagation;
    return e;
  }; // IE 阻止默认行为


  _addEvent.fixEvent.preventDefault = function () {
    // e.returnValue = false; 是 IE 的 方法
    this.returnValue = false;
  }; // IE 取消冒泡


  _addEvent.fixEvent.stopPropagation = function () {
    this.cancelBubble = true;
  };
  /**
   *  移除 事件
   * @param obj   要移除的元素节点，需要移除事件的 节点
   * @param type  事件类型 click 或 movie
   * @param fun   处理事件的方法
   */


  function _removeEvent(obj, type, fun) {
    if (typeof obj.removeEventListener != "undefined") {
      obj.removeEventListener(type, fun, false);
    } else {
      for (var i in obj.events[type]) {
        if (obj.events[type][i] == fun) {
          delete obj.events[type][i];
        }
      }
    }
  }
  /**
   *  跨浏览器获取视口大小
   * @returns {*}
   */


  Zbase.prototype.getInner = function () {
    if (typeof window.innerWidth != "undefined") {
      // 直接 返回一个 对象  ，掉调调；
      return {
        width: window.innerWidth,
        // google 和 IE
        height: window.innerHeight //  在这种 方法下 火狐 有白边，滚动条的白边

      };
    } else {
      return {
        width: document.documentElement.clientWidth,
        // google  Fixfox
        height: document.documentElement.clientHeight
      };
    }
  };
  /**
   * 获得 浏览器滚动条的距离
   * @returns {{top: number, left: number}}
   */


  Zbase.prototype.getScroll = function () {
    return {
      top: document.documentElement.scrollTop || document.body.scrollTop,
      left: document.documentElement.scrollLeft || document.body.scrollLeft
    };
  };
  /**
   * 删除前后空格
   * @param str
   * @returns {string|void|XML|*}
   */


  Zbase.prototype.trim = function (str) {
    return str.replace("/(^s*)|(s*$)/g,");
  };
  /**
   * 跨浏览器 获取 html 文本
   * @param element
   * @returns {string}
   */


  Zbase.prototype.getInnerText = function (element) {
    return typeof element.textContent == "strign" ? element.textContent : element.innerText;
  };
  /**
   * 跨浏览器 设置 html 文本
   * @param element
   * @param text
   */


  Zbase.prototype.setInnerText = function (element, text) {
    if (typeof element.textContent == "string") {
      element.textContent = text;
    } else {
      element.innerText = text;
    }
  };
  /**
   * 某 一个值是否存在某一个数组中
   * 如 var arr = [12,323,43,434,54,5];
   * inArray(arr,666);  返回 false；
   * @param array
   * @param value
   * @returns {boolean}
   */


  Zbase.prototype.inArray = function (array, value) {
    for (var i in array) {
      if (array[i] === value) return true;
    }

    return false;
  };
  /**
   * 获取某一元素到最外层顶点的距离
   * @param ele  元素
   * @returns {number|Number}  顶点距离
   */


  Zbase.prototype.offsetTop = function (ele) {
    var top = ele.offsetTop;
    var parent = ele.offsetParent;

    while (parent != null) {
      top += parent.offsetTop;
      parent = parent.offsetParent;
    }

    return top;
  };
  /**
   * 得到上一个 节点的 索引
   * 比如 ,<ul  下面有好几个  <li   ，得到当前 li 的 上一个 li
   * @param current
   * @param parent
   * @returns {number}
   */


  Zbase.prototype.pervIndex = function (current, parent) {
    var length = parent.children.length;

    if (current == 0) {
      return length - 1;
    }

    return parseInt(current) - 1;
  };
  /**
   * 得到下一个 节点的 索引
   * 比如 ,<ul  下面有好几个  <li   ，得到当前 li 的 下一个 li
   * @param current
   * @param parent
   * @returns {*}
   */


  Zbase.prototype.nextIndex = function (current, parent) {
    var length = parent.children.length;

    if (current == length) {
      return 0;
    }

    return parseInt(current) + 1;
  };
  /**
   * 滚动条固定到一定位置
   */


  Zbase.prototype.fixedScroll = function () {
    window.screenTop(fixedScroll().left, fixedScroll().top);
  };
  /**
   * 阻止浏览器默认行为
   * @param e
   */


  Zbase.prototype.predef = function (e) {
    e.preventDefault();
  };
  /**
   * 图片预加载
   * @param obj
   */


  Zbase.prototype.preprocessorImage = function (obj) {
    var img_array = obj.img_array;
    var images = [];

    for (var i = 0, len = img_array.length; i < len; i++) {
      images.push(new Image());

      images[i].onload = function () {
        console.log(".....dd.");
        obj.callback(this.src);
      };

      console.log("......");
      images[i].src = img_array[i];
    }
  };
  /**
   * 当加载 zBase_drag.js  这个文件时，会执行这段代码，
   * 其中  $() 是  new Base(_this); new 出一个对象，
   * 对象执行 extend() 方法 ，这个方法是在 zBase.js  里面定义的一个方法，这个方法会将
   * 方法名 和 函数 加载到 对象的 原型中。 这样 下面的代码 就会像插件的形式插入 对象原型，给其他对象调用了。
   *
   * 为什么  new Base(_this); new 出一个的是一个新对象，而其他对象能调用新对象添加的方法呢，
   * 因为 下面是将方法添加到原型中，共享的
   */


  $().extend("drag", function () {
    for (var t = 0; t < this.elements.length; t++) {
      // var moveLogin = document.getElementById("login");
      this.elements[t].onmousedown = function (e) {
        // 这里的 this 代表 moveLogin，因为在 moveLogin的方法里。
        var _this = this;

        console.log(333); // 兼容 IE

        var e = e || window.event; //  diffX 只 鼠标点在 moveLogin 容器里 距离 容器左边的 小 距离

        var diffX = e.clientX - _this.offsetLeft;
        var diffY = e.clientY - _this.offsetTop; // 为什么 onmousemove 和 onmouseup 用的是 document，而不是 moveLogin
        // 因为 如果是 在 moveLogin执行 onmousemove 和 onmouseup 操作，那么只是针对  moveLogin 的操作，
        // 当你 鼠标快速移动 离开了 moveLogin 区域，那么 onmousemove 和 onmouseup事件就被 屏幕给抓取了，
        // 你就不能继续 对 moveLogin执行onmousemove 和 onmouseup 操作了。
        // 所以 onmousemove 和 onmouseup 操作 全局交给 document 就可以了！！！！

        document.onmousemove = function (e) {
          console.log('ddddddd');
          var e = e || window.event;
          var left = e.clientX - diffX;
          var top = e.clientY - diffY; // 设置 最左边最右边，使之不能脱出 浏览器大小

          if (left < 0) {
            left = 0;
          } else if (left <= getScroll().left) {
            left = getScroll().left;
          } else if (left > getInner().width - _this.offsetWidth) {
            left = getInner().width - _this.offsetWidth;
          } // 设置 最上边最下边，使之不能脱出 浏览器大小


          if (top < 0) {
            top = 0;
          } else if (top <= getScroll().top) {
            top = getScroll().top;
          } else if (top > getInner().height - _this.offsetHeight) {
            top = getInner().height - _this.offsetHeight;
          }

          _this.style.left = left + "px";
          _this.style.top = top + "px";
        };

        document.onmouseup = function () {
          // 这里的 this 代表 document，因为在 document 的方法里。
          this.onmousemove = null;
          this.onmouseup = null;
        };
      };
    }

    return this;
  });
  window.$ = $;

  var noop = function () {};

  var offloadFn = function (fn) {
    setTimeout(fn || noop, 0);
  }; // check browser capabilities


  var browser = {
    addEventListener: !!window.addEventListener,
    touch: "ontouchstart" in window || window.DocumentTouch && document instanceof DocumentTouch,
    transitions: function (temp) {
      var props = ["transitionProperty", "WebkitTransition", "MozTransition", "OTransition", "msTransition"];

      for (var i in props) if (temp.style[props[i]] !== undefined) return true;

      return false;
    }(document.createElement("swipe"))
  };

  function Swipe(container, options) {
    if (!container) return;
    var _baseOption = {
      startSlide: 0,
      auto: 0,
      speed: 300,
      // transition 动画时间
      continuous: true,
      // 是否可循环滑动
      disableScroll: undefined,
      stopPropagation: undefined,
      callback: null,
      transitionEnd: null
    };
    var isSupportTransition = browser.transitions;
    var element = container.children[0];
    var slides, // 可滑动元素 []
    slidePos, // 滑动元素的 translateX 值 []
    width, // container 宽度
    length; // 原始可滑动元素个数

    options = Object.assign(_baseOption, options);
    var index = parseInt(options.startSlide, 10);
    var speed = options.speed;

    function setup() {
      // cache slides
      slides = element.children;
      length = slides.length; // set continuous to false if only one slide

      if (slides.length < 2) {
        options.continuous = false;
      } // 小于3个slide拷贝节点


      if (isSupportTransition && options.continuous && slides.length < 3) {
        element.appendChild(slides[0].cloneNode(true));
        element.appendChild(element.children[1].cloneNode(true));
        slides = element.children;
      }

      slidePos = new Array(slides.length);
      width = container.getBoundingClientRect().width || container.offsetWidth;
      element.style.width = slides.length * width + "px";
      var pos = slides.length;

      while (pos--) {
        // 设置left 和 transition
        var slide = slides[pos];
        slide.style.width = width + "px";
        slide.setAttribute("data-index", pos);

        if (isSupportTransition) {
          slide.style.left = -(pos * width) + "px";
          var wid = index > pos ? -width : index < pos ? width : 0;
          move(pos, wid, 0);
        }
      } // 重新设置当前元素的前一个和后一个元素transition


      if (isSupportTransition && options.continuous) {
        var pos1 = circle(index - 1); // 前一个el

        var pos2 = circle(index + 1); // 后一个el

        move(pos1, -width, 0);
        move(pos2, width, 0);
      }

      if (!isSupportTransition) {
        element.style.left = index * -width + "px";
      }

      container.style.visibility = "visible";
    }

    function prev() {
      if (options.continuous) slide(index - 1);else if (index) slide(index - 1);
    }

    function next() {
      if (options.continuous) slide(index + 1);else if (index < slides.length - 1) slide(index + 1);
    }

    function circle(index) {
      // a simple positive modulo using slides.length
      var len = slides.length;
      return (len + index % len) % len;
    }

    function slide(to, slideSpeed) {
      // do nothing if already on requested slide
      if (index == to) return;

      if (isSupportTransition) {
        var direction = Math.abs(index - to) / (index - to); // 1: backward, -1: forward
        // get the actual position of the slide

        if (options.continuous) {
          var natural_direction = direction;
          direction = -slidePos[circle(to)] / width; // if going forward but to < index, use to = slides.length + to
          // if going backward but to > index, use to = -slides.length + to

          if (direction !== natural_direction) to = -direction * slides.length + to;
        }

        var diff = Math.abs(index - to) - 1; // move all the slides between index and to in the right direction

        while (diff--) move(circle((to > index ? to : index) - diff - 1), width * direction, 0);

        to = circle(to);
        move(index, width * direction, slideSpeed || speed);
        move(to, 0, slideSpeed || speed);
        if (options.continuous) move(circle(to - direction), -(width * direction), 0); // we need to get the next in place
      } else {
        to = circle(to);
        animate(index * -width, to * -width, slideSpeed || speed); //no fallback for a circular continuous if the browser does not accept transitions
      }

      index = to;
      offloadFn(options.callback && options.callback(index, slides[index]));
    }

    function move(index, dist, speed) {
      translate(index, dist, speed);
      slidePos[index] = dist;
    }

    function translate(index, dist, speed) {
      var slide = slides[index];
      var style = slide && slide.style;
      if (!style) return;
      style.webkitTransitionDuration = style.MozTransitionDuration = style.transitionDuration = speed + "ms";
      style.webkitTransform = "translate(" + dist + "px,0)" + "translateZ(0)";
      style.MozTransform = "translateX(" + dist + "px)";
    }

    function animate(from, to, speed) {
      // if not an animation, just reposition
      if (!speed) {
        element.style.left = to + "px";
        return;
      }

      var start = +new Date();
      var timer = setInterval(function () {
        var timeElap = +new Date() - start;

        if (timeElap > speed) {
          element.style.left = to + "px";
          if (delay) begin();
          options.transitionEnd && options.transitionEnd.call(event, index, slides[index]);
          clearInterval(timer);
          return;
        }

        element.style.left = (to - from) * (Math.floor(timeElap / speed * 100) / 100) + from + "px";
      }, 4);
    } // setup auto slideshow


    var delay = options.auto || 0;
    var interval;

    function begin() {
      interval = setTimeout(next, delay);
    }

    function stop() {
      delay = 0;
      clearTimeout(interval);
    } // setup initial vars


    var start = {};
    var delta = {};
    var isScrolling; // setup event capturing

    var events = {
      handleEvent: function (event) {
        switch (event.type) {
          case "touchstart":
            this.start(event);
            break;

          case "touchmove":
            this.move(event);
            break;

          case "touchend":
            offloadFn(this.end(event));
            break;

          case "webkitTransitionEnd":
          case "msTransitionEnd":
          case "oTransitionEnd":
          case "otransitionend":
          case "transitionend":
            offloadFn(this.transitionEnd(event));
            break;

          case "resize":
            offloadFn(setup);
            break;
        }

        if (options.stopPropagation) event.stopPropagation();
      },
      start: function (event) {
        var touches = event.touches[0]; // measure start values

        start = {
          // get initial touch coords
          x: touches.pageX,
          y: touches.pageY,
          // store time to determine touch duration
          time: +new Date()
        }; // used for testing first move event

        isScrolling = undefined; // reset delta and end measurements

        delta = {}; // attach touchmove and touchend listeners

        element.addEventListener("touchmove", this, false);
        element.addEventListener("touchend", this, false);
      },
      move: function (event) {
        // ensure swiping with one touch and not pinching
        if (event.touches.length > 1 || event.scale && event.scale !== 1) return;

        if (options.disableScroll) {
          event.preventDefault();
        }

        var touches = event.touches[0]; // measure change in x and y

        delta = {
          x: touches.pageX - start.x,
          y: touches.pageY - start.y
        }; // determine if scrolling test has run - one time test

        if (typeof isScrolling == "undefined") {
          isScrolling = !!(isScrolling || Math.abs(delta.x) < Math.abs(delta.y));
        } // if user is not trying to scroll vertically


        if (!isScrolling) {
          // prevent native scrolling
          event.preventDefault(); // stop slideshow

          stop(); // increase resistance if first or last slide

          if (options.continuous) {
            // we don't add resistance at the end
            // console.log(circle(index-1), index, circle(index + 1), slidePos, delta)
            var indexArr = [circle(index - 1), index, circle(index + 1)];
            indexArr.forEach(index => {
              translate(index, delta.x + slidePos[index], 0);
            });
          } else {
            delta.x = delta.x / (!index && delta.x > 0 || // if first slide and sliding left
            index == slides.length - 1 && // or if last slide and sliding right
            delta.x < 0 // and if sliding at all
            ? Math.abs(delta.x) / width + 1 // determine resistance level
            : 1); // no resistance if false
            // translate 1:1

            translate(index - 1, delta.x + slidePos[index - 1], 0);
            translate(index, delta.x + slidePos[index], 0);
            translate(index + 1, delta.x + slidePos[index + 1], 0);
          }
        }
      },
      end: function (event) {
        // measure duration
        var duration = +new Date() - start.time;
        var fasrMoveEnd = Number(duration) < 250 && Math.abs(delta.x) > 20;
        var isValidSlide = fasrMoveEnd || Math.abs(delta.x) > width / 2; // determine if slide attempt is past start and end

        var isPastBounds = !index && delta.x > 0 || // if first slide and slide amt is greater than 0
        index == slides.length - 1 && delta.x < 0; // or if last slide and slide amt is less than 0

        if (options.continuous) isPastBounds = false; // determine direction of swipe (true:right, false:left)

        var direction = delta.x < 0; // if not scrolling vertically

        if (!isScrolling) {
          if (isValidSlide && !isPastBounds) {
            if (direction) {
              if (options.continuous) {
                // we need to get the next in this direction in place
                move(circle(index - 1), -width, 0);
                move(circle(index + 2), width, 0);
              } else {
                move(index - 1, -width, 0);
              }

              move(index, slidePos[index] - width, speed);
              move(circle(index + 1), slidePos[circle(index + 1)] - width, speed);
              index = circle(index + 1);
            } else {
              if (options.continuous) {
                // we need to get the next in this direction in place
                move(circle(index + 1), width, 0);
                move(circle(index - 2), -width, 0);
              } else {
                move(index + 1, width, 0);
              }

              move(index, slidePos[index] + width, speed);
              move(circle(index - 1), slidePos[circle(index - 1)] + width, speed);
              index = circle(index - 1);
            }

            options.callback && options.callback(index, slides[index]);
          } else {
            if (options.continuous) {
              move(circle(index - 1), -width, speed);
              move(index, 0, speed);
              move(circle(index + 1), width, speed);
            } else {
              move(index - 1, -width, speed);
              move(index, 0, speed);
              move(index + 1, width, speed);
            }
          }
        } // kill touchmove and touchend event listeners until touchstart called again


        element.removeEventListener("touchmove", events, false);
        element.removeEventListener("touchend", events, false);
      },
      transitionEnd: function (event) {
        if (parseInt(event.target.getAttribute("data-index"), 10) == index) {
          if (delay) begin();
          options.transitionEnd && options.transitionEnd.call(event, index, slides[index]);
        }
      }
    }; // trigger setup

    setup(); // start auto slideshow if applicable

    if (delay) begin(); // add event listeners

    if (browser.addEventListener) {
      // set touchstart event on element
      if (browser.touch) element.addEventListener("touchstart", events, false);

      if (isSupportTransition) {
        element.addEventListener("webkitTransitionEnd", events, false);
        element.addEventListener("transitionend", events, false);
      } // set resize event on window


      window.addEventListener("resize", events, false);
    } else {
      window.onresize = function () {
        setup();
      }; // to play nice with old IE

    } // expose the Swipe API


    return {
      setup: function () {
        setup();
      },
      slide: function (to, speed) {
        // cancel slideshow
        stop();
        slide(to, speed);
      },
      prev: function () {
        // cancel slideshow
        stop();
        prev();
      },
      next: function () {
        // cancel slideshow
        stop();
        next();
      },
      stop: function () {
        // cancel slideshow
        stop();
      },
      getPos: function () {
        // return current index position
        return index;
      },
      getNumSlides: function () {
        // return total number of slides
        return length;
      },
      kill: function () {
        // cancel slideshow
        stop(); // reset element

        element.style.width = "";
        element.style.left = ""; // reset slides

        var pos = slides.length;

        while (pos--) {
          var slide = slides[pos];
          slide.style.width = "";
          slide.style.left = "";
          if (isSupportTransition) translate(pos, 0, 0);
        } // removed event listeners


        if (browser.addEventListener) {
          // remove current event listeners
          element.removeEventListener("touchstart", events, false);
          element.removeEventListener("webkitTransitionEnd", events, false);
          element.removeEventListener("transitionend", events, false);
          window.removeEventListener("resize", events, false);
        } else {
          window.onresize = null;
        }
      }
    };
  }

  var ObjProto = Object.prototype;
  const toString = ObjProto.toString;
  const T = () => true;
  const F = () => false;
  const NOOP = () => {};


  const _curry1 = (fn = NOOP) => {
    return function f1(a) {
      if (arguments.length) {
        return fn.apply(this, arguments);
      } else {
        return f1;
      }
    };
  };
  const _curry2 = (fn = NOOP) => {
    return function f2(a, b) {
      switch (arguments.length) {
        case 0:
          return f2;

        case 1:
          if (!a) {
            return f2;
          } else {
            return _curry1(function (_b) {
              return fn(a, _b);
            });
          }

        default:
          if (!a && !b) {
            return f2;
          } else if (!a) {
            return _curry1(function (_a) {
              return fn(_a, b);
            });
          } else if (!b) ; else {
            return fn(a, b);
          }

      }
    };
  };
  const _keys = typeof Object.keys === 'function' ? _curry1(function keys(obj) {
    return Object(obj) !== obj ? [] : Object.keys(obj);
  }) : () => {};
  const _filter = (cb = NOOP, arr = []) => {
    let a = [],
        arrLen = arr.length,
        i = arrLen;

    while (i > 0) {
      if (cb(arr[arrLen - i], arrLen - i, arr)) {
        a[a.length] = arr[arrLen - i];
      }

      --i;
    }

    return a;
  };
  const _for = (cb = NOOP, arr = []) => {
    let a = [],
        arrLen = arr.length,
        i = arrLen;

    while (i > 0) {
      a[a.length] = cb(arr[arrLen - i], arrLen - i, arr);
      --i;
    }

    return a;
  };
  const _some = (cb = NOOP, arr = []) => {
    let arrLen = arr.length,
        i = arrLen;

    while (i > 0) {
      if (cb(arr[arrLen - i], arrLen - i, arr)) {
        return true;
      }

      --i;
    }

    return false;
  };
  const _every = (cb = NOOP, arr = []) => {
    let arrLen = arr.length,
        i = arrLen;

    while (i > 0) {
      if (!cb(arr[arrLen - i], arrLen - i, arr)) {
        return false;
      }

      --i;
    }

    return true;
  };
  let types = {};

  _for(function (name) {
    types['is' + name] = function (obj) {
      return toString.call(obj) === '[object ' + name + ']';
    };
  }, ['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error', 'Array']);

  var add = _curry2(function add(a, b) {
    return Number(a) + Number(b);
  });
  var find = _curry2(function find(fn, list) {
    var len = list.length,
        i = 0;

    while (i < len) {
      if (fn(list[i])) {
        return list[i];
      }

      i++;
    }
  });
  var findIndex = _curry2(function findIndex(fn, list) {
    var len = list.length,
        i = 0;

    while (i < len) {
      if (fn(list[i])) {
        return i;
      }

      i++;
    }

    return -1;
  });
  var findLast = _curry2(function findLast(fn, list) {
    var i = list.length - 1;

    while (i >= 0) {
      if (fn(list[i])) {
        return list[i];
      }

      i--;
    }
  });
  var findLastIndex = _curry2(function findLastIndex(fn, list) {
    var i = list.length - 1;

    while (i >= 0) {
      if (fn(list[i])) {
        return i;
      }

      i--;
    }

    return -1;
  });

  function _arity(fn) {
    return function () {
      return fn.apply(this, arguments);
    };
  }

  var once = _curry1(function once(fn) {
    var called = false,
        result;
    return _arity(function () {
      if (called) {
        return result;
      }

      called = true;
      result = fn.apply(this, arguments);
      return result;
    });
  });
  var _tool = {
    _filter,
    _some,
    _every,
    T,
    F,
    _keys,
    ...types,
    add,
    find,
    findIndex,
    findLast,
    findLastIndex,
    once
  };

  var _isArray = Array.isArray || function _isArray(val) {
    return val != null && val.length >= 0 && toString.call(val) === '[object Array]';
  };

  var _isInteger = Number.isInteger || function _isInteger(n) {
    return n << 0 === n;
  };

  const isDef = v => v !== undefined && v !== null;
  const isUndef = v => !isDef(v);
  const inArray = (item, arr) => arr.includes(item);
  const isWindow = v => v && v == v.window;
  const noop$1 = () => {};

  /**
   * 正则
   * replace
   * insertBefore
   */
  let arrayProto = Array.prototype;
  let class2type = {};
  let doc = document;
  let win = window;
  let S = {
    Env: {
      host: win
    }
  };
  ["Boolean", "Number", "String", "Function", "Array", "Date", "RegExp", "Object", "Error"].forEach(name => {
    let name2lc = name.toLowerCase();
    class2type["[object " + name + "]"] = name2lc;

    S["is" + name] = function (obj) {
      return S.type(obj) === name2lc;
    };
  });

  S.type = function (obj) {
    return isUndef(obj) ? String(obj) : class2type[{}.toString.call(obj)] || "object";
  };

  S.isPlainObject = obj => {
    return S.isObject(obj) && !isWindow(obj) && Object.getPrototypeOf(obj) == Object.prototype;
  };

  S.map = (els, cb) => {
    let val;
    let key;
    let ret = [];

    if (S.isObject(els)) {
      arrayProto.forEach.call(els, (el, index) => {
        val = cb(el, index);

        if (val !== null) {
          ret.push(val);
        }
      });
    } else {
      for (key in els) {
        val = cb(els[key], key);

        if (val !== null) {
          ret.push(val);
        }
      }
    }

    return ret.length > 0 ? arrayProto.concat.apply([], ret) : ret;
  };

  S.each = (obj, iterator, context) => {
    if (!obj) return obj;

    if (obj.forEach === arrayProto.forEach) {
      obj.forEach(iterator, context);
    } else {
      let len;
      let i;

      if (S.isArray(obj)) {
        for (i = 0, len = obj.length; i < len; i++) {
          if (iterator.call(context, obj[i], i, obj) === false) {
            return;
          }
        }
      } else {
        let keys = Object.keys(obj);

        for (i = 0, len = keys.length; i < len; i++) {
          if (iterator.call(context, obj[keys[i]], keys[i], obj) === false) {
            return;
          }
        }
      }
    }

    return obj;
  };

  function mix(obj, ...rest) {
    let k;
    S.each(rest, source => {
      if (source) {
        for (let prop in source) {
          if ((k = source[prop]) !== undefined) {
            obj[prop] = k;
          }
        }
      }
    });
    return obj;
  }

  S.mix = mix;

  S.makeArray = o => {
    if (isUndef(o)) return [];
    if (S.isArray(o)) return o;
    let lengthType = typeof o.length;
    let oType = typeof o;

    if (lengthType !== "number" || o.alert || oType === "string") {
      return [o];
    }

    let ret = [];

    for (let i = 0, l = o.length; i < l; i++) {
      ret[i] = o[i];
    }

    return ret;
  }; // 类的扩充，将 `s1` 的 `prototype` 属性的成员复制到 `r.prototype` 上。`Base` 使用。
  // - r: 将要扩充的函数
  // - s1: 扩充来源函数或对象. 非函数对象时复制的就是 s 的成员.
  // - wl: 属性来源对象的属性白名单, 仅在名单中的属性进行复制.


  S.augment = (r, o, wl) => {
    if (o instanceof Function) {
      S.mix(r.prototype, o.prototype);
    }

    if (o instanceof Object) {
      S.mix(r.prototype, o);
    }

    if (wl instanceof Object) {
      S.mix(r.prototype, wl);
    }

    return r;
  };

  S.filter = (arr, fn, context) => {
    return Array.prototype.filter.call(arr, fn, context || win);
  }; // 创建一个 普通对象 或数组的深拷贝, 并且返回新对象，Base 使用。
  // - input: 待深拷贝的对象或数组.
  // - filter: 过滤函数, 返回 false 不拷贝该元素. 传入参数为:
  // 	1. 待克隆值为数组, 参数同 `S.filter()`, 上下文对象为全局 `window`
  // 	2. 待克隆值为普通对象, 参数为对象的每个键, 每个键对应的值, 当前对象, 上下文对象为当前对象.


  S.clone = (input, filter) => {
    let destination = input;
    if (!input) return destination;
    let constructor = input.constructor;

    if (inArray(constructor, [Boolean, String, Number, Date, RegExp])) {
      destination = input.valueOf();
    } else if (S.isArray(input)) {
      destination = filter ? S.filter(input, filter) : input.concat();
    } else if (S.isPlainObject(input)) {
      destination = {};
    }

    if (S.isArray(input)) {
      for (let i = 0; i < destination.length; i++) {
        destination[i] = S.clone(destination[i], filter);
      }
    } else if (S.isPlainObject(input)) {
      for (let k in input) {
        if (!filter || filter.call(input, input[k], k, input) !== false) {
          destination[k] = S.clone(input[k], filter);
        }
      }
    }

    return destination;
  };

  S.ucFirst = s => {
    s += "";
    return s.charAt(0).toLowerCase() + s.slice(1);
  };

  S.trim = s => {
    return isUndef(s) ? "" : String.prototype.trim.call(s);
  };

  S.now = Date.now;

  S.indexOf = (item, arr) => {
    return Array.prototype.indexOf.call(arr, item);
  }; // 从左向右对每个数组元素调用给定函数，并把返回值累积起来，返回这个累加值，Base使用
  // - arr: 需要遍历的数组.
  // - fn: 在每个数组元素上执行的函数.
  // - initialValue: 对象类型，初次执行 fn 时的第一个参数值，如果不指定则为第一个元素值，后续从第二个元素开始遍历
  //


  S.reduce = (arr, callback, initialValue) => {
    let len = arr.length;

    if (typeof callback !== "function") {
      throw new Error("callback is not function!");
    }

    if (len === 0 && callback) {
      throw new TypeError("arguments invalid");
    }

    let k = 0;
    let accumulator;

    if (initialValue) {
      accumulator = initialValue;
    } else {
      do {
        if (k in arr) {
          accumulator = arr[k++];
          break;
        }

        k += 1;

        if (k >= len) {
          throw new TypeError();
        }
      } while (true);
    }

    while (k < len) {
      if (k in arr) {
        accumulator = callback.call(undefined, accumulator, arr[k], k, arr);
      }

      k++;
    }

    return accumulator;
  };

  S.substitute = (str, o, regexp) => {
    if (typeof str !== "string" || !o) {
      return str;
    }

    return str.replace(regexp || /\\?\{([^{}]+)\}/g, (match, name) => {
      // console.log(match, name);
      if (match.charAt(0) === "\\") {
        return match.slice(1);
      }

      return o[name] === undefined ? "" : o[name];
    });
  };

  S.merge = (...rest) => {
    return mix.apply(null, [{}].concat(rest));
  }; // 让函数对象 r 继承函数对象 s
  // - r: 将要继承的子类函数
  // - supplier: 继承自的父类函数
  // - px: 需要添加/覆盖的原型成员
  // - sx: 需要添加/覆盖的静态成员.


  S.extend = (receiver, supplier, protoPros, staticProps) => {
    let supplierProto = supplier.prototype;
    supplierProto.constructor = supplier;
    let receiverProto = Object.create(supplierProto);
    receiverProto.constructor = receiver;
    receiver.prototype = S.mix(receiverProto, receiver.prototype);
    receiver.superclass = supplierProto;

    if (protoPros) {
      S.mix(receiverProto, protoPros);
    }

    if (staticProps) {
      S.mix(receiver, staticProps);
    }

    return receiver;
  };

  S.unique = array => {
    return arrayProto.filter.call(array, (item, index) => {
      return array.indexOf(item) - index === 0;
    });
  };

  S.startsWidth = (str, prefix) => {
    return str.lastIndexOf(prefix, 0) === 0;
  };

  S.endsWith = (str, suffix) => {
    let ind = str.length - suffix.length;
    return ind >= 0 && str.indexOf(suffix, ind) === ind;
  };

  S.inArray = (item, arr) => {
    return S.indexOf(item, arr) > -1;
  };

  let guid = 0;

  S.guid = pre => {
    return (pre || "") + guid++;
  };

  S.ready = fn => {
    if (/complete|loaded|interactive/.test(doc.readyState) && doc.body) {
      fn(S);
    } else {
      doc.addEventListener("DOMContentLoaded", () => {
        fn(S);
      }, false);
    }

    return undefined;
  };

  function bindFn(r, fn, obj) {
    function FNOP() {}

    let slice = [].slice;
    let args = slice.call(arguments, 3);

    let bound = () => {
      let inArgs = slice.call(arguments);
      return fn.apply(this instanceof FNOP ? this : obj || this, r ? inArgs.concat(args) : args.concat(inArgs));
    };

    FNOP.prototype = fn.prototype;
    bound.prototype = new FNOP();
    return bound;
  }

  S.mix(S, {
    noop: noop$1,
    // **S.bind (fn , context)**
    //
    // 创建一个新函数，该函数可以在固定的上下文以及传递部分固定参数放在用户参数前面给原函数并执行
    // - fn: 需要固定上下文以及固定部分参数的函数
    // - context: 执行 fn 时的 this 值. 如果新函数用于构造器则该参数无用.
    bind: bindFn(0, bindFn, null, 0),
    rBind: bindFn(0, bindFn, null, 1)
  }); // -----------------------------------------------------------
  // script/css load across browser

  let webkit = +navigator.userAgent.replace(/.*Web[kK]it[\/]{0,1}(\d+)\..*/, "$1");
  let isOldWebKit = !webkit || webkit < 536;
  let cssTimer = 0,
      monitors = {},
      monitorLen = 0;

  function startCssTimer() {
    if (!cssTimer) {
      cssPoll();
    }
  }

  function isCssLoaded(node, url) {
    let sheet = node.sheet,
        loaded;

    if (isOldWebKit) {
      /* http://www.w3.org/TR/Dom-Level-2-Style/stylesheets.html */
      if (sheet) {
        loaded = 1;
      }
    } else if (sheet) {
      try {
        let cssRules = sheet.cssRules;

        if (cssRules) {
          loaded = 1;
        }
      } catch (ex) {
        /* http://www.w3.org/TR/dom/#dom-domexception-code */
        if (ex.name === "NS_ERROR_DOM_SECURITY_ERR") {
          /* for old firefox */
          loaded = 1;
        }
      }
    }

    return loaded;
  }

  function cssPoll() {
    for (let url in monitors) {
      let callbackObj = monitors[url],
          node = callbackObj.node;

      if (isCssLoaded(node, url)) {
        if (callbackObj.callback) {
          callbackObj.callback.call(node);
        }

        delete monitors[url];
        monitorLen--;
      }
    }

    cssTimer = monitorLen ? setTimeout(cssPoll, 30) : 0;
  }

  function pollCss(node, callback) {
    let href = node.href;
    let arr;
    arr = monitors[href] = {};
    arr.node = node;
    arr.callback = callback;
    monitorLen++;
    startCssTimer();
  } // getScript support for css and js callback after load


  let jsCssCallbacks = {};
  let headNode = doc.getElementsByTagName("head")[0] || doc.documentElement;
  /**
   * Load a javascript/css file from the server using a GET HTTP request,
   * then execute it.
   *
   * for example:
   *      @example
   *      getScript(url, success, charset);
   *      // or
   *      getScript(url, {
   *          charset: string
   *          success: fn,
   *          error: fn,
   *          timeout: number
   *      });
   *
   * Note 404/500 status in ie<9 will trigger success callback.
   * If you want a jsonp operation, please use {@link KISSY.IO} instead.
   *
   * @param {String} url resource's url
   * @param {Function|Object} [success] success callback or config
   * @param {Function} [success.success] success callback
   * @param {Function} [success.error] error callback
   * @param {Number} [success.timeout] timeout (s)
   * @param {String} [success.charset] charset of current resource
   * @param {String} [charset] charset of current resource
   * @return {HTMLElement} script/style node
   * @member KISSY
   */
  // **S.getScript(url,cuccess,charset)**
  //
  // 通过一个get请求的方式加载一个js或css文件，加载完成后执行它
  // 调用样例
  // ```
  // S.getScript(url, success, charset);
  // // or
  // S.getScript(url, {
  //     charset: string
  //     success: fn,
  //     error: fn,
  //     timeout: number
  // });

  let getScript = (url, success, charset) => {
    let config = success,
        css = 0,
        error,
        timeout,
        attrs,
        timer;

    if (S.endsWith(url.toLowerCase(), ".css")) {
      css = 1;
    }

    if (S.isObject(config)) {
      success = config.success;
      error = config.error;
      timeout = config.timeout;
      charset = config.charset;
      attrs = config.attrs;
    }

    callbacks = jsCssCallbacks[url] = jsCssCallbacks[url] || [];
    callbacks.push([success, error]);

    if (callbacks.length > 1) {
      return callbacks.node;
    }

    let node = doc.createElement(css ? "link" : "script");

    let clearTimer = () => {
      if (timer) {
        clearTimeout(timer);
        timer = undefined;
      }
    };

    if (attrs) {
      S.each(attrs, (v, n) => {
        node.setAttribute(n, v);
      });
    }

    if (charset) {
      node.charset = charset;
    }

    if (css) {
      node.href = url;
      node.rel = "stylesheet";
    } else {
      node.src = url;
      node.async = true;
    }

    callbacks.node = node;

    let end = error => {
      let index = error;
      let fn;
      clearTimer();
      S.each(jsCssCallbacks[url], callback => {
        if (fn = callback[index]) {
          fn.call(node);
        }

        delete jsCssCallbacks[url];
      });
    };

    let useNative = "onload" in node;
    let forceCssPoll = S.Config.forceCssPoll || isOldWebKit;

    if (css && forceCssPoll && useNative) {
      useNative = false;
    }

    function onload() {
      let readyState = node.readyState;

      if (!readyState || readyState === "loaded" || readyState === "complete") {
        node.onreadystatechange = node.onload = null;
        end(0);
      }
    }

    if (useNative) {
      node.onload = onload;

      node.onerror = () => {
        node.onerror = null;
        end(1);
      };
    } else if (css) {
      pollCss(node, () => {
        end(0);
      });
    } else {
      node.onreadystatechange = onload;
    }

    if (timeout) {
      timer = setTimeout(() => {
        end(1);
      }, timeout * 1000);
    }

    if (css) {
      headNode.appendChild(node);
    } else {
      headNode.insertBefore(node, headNode.firstChild);
    }

    return node;
  };

  mix(S, {
    getScript
  });
  let fns = {},
      config = {
    fns
  };
  S.Config = config; // config(configJSON) //⇒ void
  // config(name,value) //⇒ void，name：参数名，value：参数值
  // config(name) //⇒ data，返回参数名的值

  S.config = (configName, configValue) => {};

  S.config("mini", true); // -----------------------------------------------------------
  // -----------------------------------------------------------

  let modules = {};
  let isString = S.isString;
  let isFunction = S.isFunction;
  let RE_DIRNAME = /[^?#]*\//;
  let RE_DOT = /\/\.\//g;
  let RE_DOUBLE_DOT = /\/[^/]+\/\.\.\//;
  let RE_DOUBLE_SLASH = /([^:/])\/\//g;

  function parseDirName(name) {
    let mat = name.match(RE_DIRNAME);
    return name ? mat[0] : name + "/";
  }

  function parseRelativeName(name, refName) {
    if (refName && /^[\.\/]/.test(name)) {
      name = parseDirName(refName) + name;
      /* /a/b/./c/./d ==> /a/b/c/d */

      name = name.replace(RE_DOT, "/");
      /* a/b/c/../../d  ==>  a/b/../d  ==>  a/d */

      while (name.match(RE_DOUBLE_DOT)) {
        name = name.replace(RE_DOUBLE_DOT, "/");
      }
      /* a//b/c  ==>  a/b/c  */


      name = name.replace(RE_DOUBLE_SLASH, "$1/");
    }

    return name;
  }

  function parseModuleName(name, refName) {
    if (name.charAt(name.length - 1) === "/") {
      name += "index";
    } else if (/.js$/.test(name)) {
      name = name.slice(0, -3);
    }

    return parseRelativeName(name, refName);
  }

  function execFnWithModules(fn, modNames, refName) {
    var args = S.map(modNames || [], function (modName) {
      return S.require(modName, refName);
    });
    return isFunction(fn) ? fn.apply(S, [S].concat(args)) : undefined;
  }

  function execFnWithCJS(fn) {
    return isFunction(fn) ? fn.apply(S, [S, S.require]) : undefined;
  } // **S.add(name,fn,[cfg])**
  //
  // KISSY 添加模块/逻辑片段的函数，`config`为配置对象，包括`config.requires`，给出当前模块的依赖模块。模块返回一个对象，通过引用它的时候来调用到。
  // - name (string) – 模块名。可选。
  // - fn (function) – 模块定义函数
  // - config (object) – 模块的一些格外属性, 是JSON对象，包含属性：
  // - requires (Array) – 模块的一些依赖
  //
  // KISSY MINI 中的`S.add()`只有基本功能，只支持上面三个参数，在[mini.js](../build/mini.js)中，包含完整的 KMD 规范的实现的 loader，可以参照[KISSY 1.4 Loader的文档](http://docs.kissyui.com/1.4/docs/html/guideline/loader.html)
  //
  // KISSY.add 的传统用法（1.x 及后续版本继续兼容这种写法，但已不推荐此写法）：
  // ```
  // // package/a.js
  // KISSY.add('a',function(S){
  //	 return ObjA;
  // },{
  // 	 // 当前逻辑依赖一个包内的文件b和一个模块base
  // 	 requires:['b','base']
  // });
  // ```
  //
  // `add()`方法亦支持简单的 CommonJS 规范，强烈推荐这种用法，用法参照 [DEMO](../example/modules-loader/index.html)。
  //
  // ```
  // S.add(function(S,require,exports, module){
  //		var A = require('./a');
  //		var B = require('./b');
  //		module.exports = {
  //			/*需要返回的数据*/
  //		};
  // });
  // ```


  S.add = (name, factory, config) => {
    if (isString(name)) {
      name = parseModuleName(name);
      modules[name] = {
        factory,
        requires: config && config.requires
      };
    }

    return S;
  }; // **S.require(name,[refName])**
  //
  // 如果模块已经载入，则可以通过`S.require()`方法来调用这个模块，通常如果use()的模块过多，回调参数需要和模块列表一一对应，最简单的办法就是使用`S.require()`方法，注意，`S.require()`方法是同步执行，只有在模块已经注册完成的情况下，执行这个方法来 attache 这个模块
  //
  // 比如这段代码：
  // ```
  // // use 的模块太多，用肉眼来对应模块名称？
  // S.use('a,b,c,d,e,f,g',function(S,A,B,C,D,E,F,G){
  //     // Your code...
  // });
  //
  // // 可以简写为这样
  // S.use('a,b,c,d,e,f,g',function(S){
  //     var A = S.require('a');
  //     var B = S.require('b');
  //     var C = S.require('c');
  //     // Your code...
  // });
  // ```
  //
  // 再比如我添加了一个模块，希望立即执行这个模块
  // ```
  // S.add('my-mod',function(S,require,exports,module){
  //		alert('hello world');
  // });
  // S.require('my-mod');// 将会弹出 hello world
  // ```


  S.requires = (name, refName) => {
    let mod;

    if (isString(name)) {
      name = parseModuleName(name, refName);
      mod = modules[name];

      if (mod) {
        if (!mod.exports) {
          mod.exports = isFunction(mod.factory) ? mod.requires ? execFnWithModules(mod.factory, mod.require, name) : execFnWithCJS(mod.factory) : mod.factory;
        }
      }

      return mod.exports;
    }
  }; // **S.use(names, callback)**
  //
  // 载入并运行模块,和add一起使用，详细用法参照[KISSY模块规范](http://docs.kissyui.com/1.4/docs/html/kmd.html)（KMD），fn 类型是functio。参数说明：
  // - modNames (String) – 以逗号（,）分割的模块名称,例如 `S.use("custommod,custommod2")`
  // - callback (function|Object) – 当 modNames 中所有模块载入并执行完毕后执行的函数或者对象描述
  //
  // 当callback类型为Object时，可传入两个属性：
  //
  // 1. success (function) : 当 modNames 中所有模块加载完毕后执行的函数
  // 2. error (function) : 当前 use 失败时调用的函数，参数为失败的模块对象
  //
  // 需要注意，`S.use()`方法永远异步来 attach 模块，因此和`S.require()`的区别主要在于
  // - S.use 异步 attach 模块
  // - S.require 同步 attach 模块
  //
  // 比如这段代码就会有问题
  // ```
  // S.add('my-mod',function(S){
  //		window._my_mod = 1;
  // });
  // S.use('my-mod');
  // alert(window._my_mod);//这时弹出undefined
  // ```
  //
  // 修改正确时则为：
  // ```
  // S.add('my-mod',function(S){
  //		window._my_mod = 1;
  // });
  // S.use('my-mod');
  // setTimeout(function(){
  // 		alert(window._my_mod);//这时弹出1
  // },200);
  // ```
  //
  // 显然这段代码有冗余（setTimeout），这种逻辑的正确用法应该用`S.require`
  // ```
  // S.add('my-mod',function(S){
  //		window._my_mod = 1;
  // });
  // S.require('my-mod');
  // alert(window._my_mod);//这时弹出1
  // ```
  //


  S.use = (names, success) => {
    if (S.isObject(success)) {
      success = success.success;
    }

    if (isString(names)) {
      names = names.replace(/\s+/g, "").split(",");
    }

    execFnWithModules(success, names);
    return S;
  }; // **S.log(msg,[cat,type])**
  //
  // 输出调试信息
  // - msg : 试信息
  // - cat : 调试信息类别. 可以取 info, warn, error, dir, time 等 console 对象的方法名, 默认为 log.
  // - src : 调试代码所在的源信息


  S.log = (msg, cat, type) => {
    let logger = console;
    cat = cat && logger[cat] ? cat : "log";
    logger[cat](type ? type + ": " + msg : msg);
  };

  S.error = msg => {
    if (S.config('debug')) {
      throw msg instanceof Error ? msg : new Error(msg);
    }
  };

  win.KISSY = S; // -----------------------------------------------------------

  function adapter(response, info) {
    return Object.keys(info).reduce((res, key) => {
      res[key] = response[info[key]];
      return res;
    }, {});
  }
  //   const reqs = reqGenerator(res.cgiMAp)
  //   reqs.a()
  // })


  function slice(arr, i) {
    return Array.prototype.slice.call(arr, i);
  }

  function delay(fn, ms, ctx) {
    var args = slice(arguments, 3);
    return setTimeout(function delayer() {
      fn.apply(ctx || null, args);
    }, ms);
  }

  const deferMs = 1;

  function defer(fn, ctx) {
    const args = slice(arguments, 2);
    const params = [fn, deferMs, ctx].concat(args);
    return delay.apply(null, params);
  }

  function delayed() {
    var args = slice(arguments);
    return function delayeder() {
      return delay.apply(null, args.concat(slice(arguments)));
    };
  }

  exports.$ = $;
  exports.EventEmitter = EventEmitter;
  exports.S = S;
  exports.adapter = adapter;
  exports.debounce = debounce;
  exports.deepCopy = deepCopy;
  exports.defer = defer;
  exports.delay = delay;
  exports.delayed = delayed;
  exports.isArray = _isArray;
  exports.isInteger = _isInteger;
  exports.memory = memory;
  exports.proxy = proxy;
  exports.run = run;
  exports.store = xStore;
  exports.swipe = Swipe;
  exports.throttle = throttle;
  exports.tool = _tool;

  Object.defineProperty(exports, '__esModule', { value: true });

  // 结束注释

}));
/*

ywy
*/
