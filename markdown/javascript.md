# javascript

#### 单例模式

```javascript
/*
1.2 作用
模块间通信
保证某个类的对象的唯一性
防止变量污染
1.3 注意事项
正确使用this
闭包容易造成内存泄漏,所以要及时清除不需要的变量
创建一个新对象的成本较高
*/
(function(){
  // 养鱼游戏
  let fish = null
  function catchFish() {
    // 如果鱼存在,则直接返回
    if(fish) {
      return fish
    }else {
      // 如果鱼不存在,则获取鱼再返回
      fish = document.querySelector('#cat')
      return {
        fish,
        water: function() {
          let water = this.fish.getAttribute('weight')
          this.fish.setAttribute('weight', ++water)
        }
      }
    }
  }

  // 每隔3小时喂一次水
  setInterval(() => {
    catchFish().water()
  }, 3*60*60*1000)
})()
```



#### 构造器模式

```javascript
function Tools(){
  if(!(this instanceof Tools)){
    return new Tools()
  }
  this.name = 'js工具库'
  // 获取dom的方法
  this.getEl = function(elem) {
    return document.querySelector(elem)
  }
  // 判断是否是数组
  this.isArray = function(arr) {
    return Array.isArray(arr)
  }
  // 其他通用方法...
}
```



#### 建造者模式

```javascript
(function(){
    function Gcode(el, option) {
        this.el = typeof el === 'string' ? document.querySelector(el) : el;
        this.option = option;
        this.init();
    }
    Gcode.prototype = {
        constructor: Gcode,
        init: function() {
            if(this.el.getContext) {
                isSupportCanvas = true;
                var ctx = this.el.getContext('2d'),
                // 设置画布宽高
                cw = this.el.width = this.option.width || 200,
                ch = this.el.height = this.option.height || 40,
                textLen = this.option.textLen || 4,
                lineNum = this.option.lineNum || 4;
                var text = this.randomText(textLen);
    
                this.onClick(ctx, textLen, lineNum, cw, ch);
                this.drawLine(ctx, lineNum, cw, ch);
                this.drawText(ctx, text, ch);
            }
        },
        onClick: function(ctx, textLen, lineNum, cw, ch) {
            var _ = this;
            this.el.addEventListener('click', function(){
                text = _.randomText(textLen);
                _.drawLine(ctx, lineNum, cw, ch);
                _.drawText(ctx, text, ch);
            }, false)
        },
        // 画干扰线
        drawLine: function(ctx, lineNum, maxW, maxH) {
            ctx.clearRect(0, 0, maxW, maxH);
            for(var i=0; i < lineNum; i++) {
                var dx1 = Math.random()* maxW,
                    dy1 = Math.random()* maxH,
                    dx2 = Math.random()* maxW,
                    dy2 = Math.random()* maxH;
                ctx.strokeStyle = 'rgb(' + 255*Math.random() + ',' + 255*Math.random() + ',' + 255*Math.random() + ')';
                ctx.beginPath();
                ctx.moveTo(dx1, dy1);
                ctx.lineTo(dx2, dy2);
                ctx.stroke();
            }
        },
        // 画文字
        drawText: function(ctx, text, maxH) {
            var len = text.length;
            for(var i=0; i < len; i++) {
                var dx = 30 * Math.random() + 30* i,
                    dy = Math.random()* 5 + maxH/2;
                ctx.fillStyle = 'rgb(' + 255*Math.random() + ',' + 255*Math.random() + ',' + 255*Math.random() + ')';
                ctx.font = '30px Helvetica';
                ctx.textBaseline = 'middle';
                ctx.fillText(text[i], dx, dy);
            }
        },
        // 生成指定个数的随机文字
        randomText: function(len) {
            var source = ['a', 'b', 'c', 'd', 'e',
            'f', 'g', 'h', 'i', 'j', 
            'k', 'l', 'm', 'o', 'p',
            'q', 'r', 's', 't', 'u',
            'v', 'w', 'x', 'y', 'z'];
            var result = [];
            var sourceLen = source.length;
            for(var i=0; i< len; i++) {
                var text = this.generateUniqueText(source, result, sourceLen);
                result.push(text)
            }
            return result.join('')
        },
        // 生成唯一文字
        generateUniqueText: function(source, hasList, limit) {
            var text = source[Math.floor(Math.random()*limit)];
            if(hasList.indexOf(text) > -1) {
                return this.generateUniqueText(source, hasList, limit)
            }else {
                return text
            }  
        }
    }
    new Gcode('#canvas_code', {
        lineNum: 6
    })
})();
```



#### 代理模式

```javascript
/*
6.1 概念解读
观察者模式: 定义了一种一对多的关系, 所有观察对象同时监听某一主题对象,当主题对象状态发生变化时就会通知所有观察者对象,使得他们能够自动更新自己.
6.2 作用
目标对象与观察者存在一种动态关联,增加了灵活性
支持简单的广播通信, 自动通知所有已经订阅过的对象
目标对象和观察者之间的抽象耦合关系能够单独扩展和重用
6.3 注意事项
观察者模式一般都要注意要先监听, 再触发(特殊情况也可以先发布,后订阅,比如QQ的离线模式)
6.4 实际案例
观察者模式是非常经典的设计模式,主要应用如下:
系统消息通知
网站日志记录
内容订阅功能
javascript事件机制
react/vue等的观察者
*/

// 缓存代理
function sum(a, b){
  return a + b
}
let proxySum = (function(){
  let cache = {}
  return function(){
      let args = Array.prototype.join.call(arguments, ',');
      if(args in cache){
          return cache[args];
      }

      cache[args] = sum.apply(this, arguments)
      return cache[args]
  }
})()
```



#### 外观模式

```javascript
function on(type, fn){
  // 对于支持dom2级事件处理程序
  if(document.addEventListener){
      dom.addEventListener(type,fn,false);
  }else if(dom.attachEvent){
  // 对于IE9一下的ie浏览器
      dom.attachEvent('on'+type,fn);
  }else {
      dom['on'+ type] = fn;
  }
}
```



#### 观察者模式

```javascript
class Subject {
  constructor() {
    this.subs = {}
  }

  addSub(key, fn) {
    const subArr = this.subs[key]
    if (!subArr) {
      this.subs[key] = []
    }
    this.subs[key].push(fn)
  }

  trigger(key, message) {
    const subArr = this.subs[key]
    if (!subArr || subArr.length === 0) {
      return false
    }
    for(let i = 0, len = subArr.length; i < len; i++) {
      const fn = subArr[i]
      fn(message)
    }
  }

  unSub(key, fn) {
    const subArr = this.subs[key]
    if (!subArr) {
      return false
    }
    if (!fn) {
      this.subs[key] = []
    } else {
      for (let i = 0, len = subArr.length; i < len; i++) {
        const _fn = subArr[i]
        if (_fn === fn) {
          subArr.splice(i, 1)
        }
      }
    }
  }
}

// 测试
// 订阅
let subA = new Subject()
let A = (message) => {
  console.log('订阅者收到信息: ' + message)
}
subA.addSub('A', A)

// 发布
subA.trigger('A', 'aaa')   // A收到信息: --> aaa
```



#### 策略模式

```javascript
const obj = {
  A: (num) => num * 4,
  B: (num) => num * 6,
  C: (num) => num * 8
}

const getSum =function(type, num) {
  return obj[type](num)
}
```



#### 迭代器模式

```javascript
function _each(el, fn = (v, k, el) => {}) {
  // 判断数据类型
  function checkType(target){
    return Object.prototype.toString.call(target).slice(8,-1)
  }

  // 数组或者字符串
  if(['Array', 'String'].indexOf(checkType(el)) > -1) {
    for(let i=0, len = el.length; i< len; i++) {
      fn(el[i], i, el)
    }
  }else if(checkType(el) === 'Object') {
    for(let key in el) {
      fn(el[key], key, el)
    }
  }
}
```



#### 装饰器模式

```javascript
/*
重点体现了设计模式六大原则之中的单一职责原则和开闭原则。单一职责很好理解，就是专心，就是一个函数只做一件事情。开闭原则是指要对扩展开放，对修改关闭。
*/

let start = function () {
    console.log('start')
}
const _start = start;
start = function(){
    console.log('check');
    _start()
}
start();

Function.prototype.before = function(fn){
    var _this = this;       // 用来保存调用这个函数的引用，如func_1调用此函数，则_this指向func_1
    return function(){      // 返回一个函数，这个函数包含原函数和新函数，原函数指的是func_1，新函数指的是fn
        fn.apply(this,arguments);   // 执行新函数
        return _this.apply(this,arguments);     // 执行原函数
    }
}

Function.prototype.after = function(fn){
    var _this = this;
    return function(){
        var r = _this.apply(this,arguments); // 先执行原函数，也就是func_1
        fn.apply(this,arguments);   // 再执行新函数
        return r;
    }
}


var func_1 = function () {
   console.log("2")
}

func_1 = func_1.before(function () {
   console.log("1");
}).after(function () {
   console.log("3");
} )

func_1();   // 输出1、2、3
```

