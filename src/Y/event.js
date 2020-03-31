
  // ## Event 模块
  //
  // **Event 用法：**
  //
  // 1.直接使用
  //
  // ```
  //	var $ = KISSY.all;
  //	$('body').on('click', function(ev){
  //		console.log(ev)
  //	});
  // ```
  //
  // 2.普通对象的自定义事件
  //
  //	```
  //	var a = {}, S = KISSY;
  //	S.mix(a, S.Event.Target);
  //	a.on('my_event', function(ev){
  //		console.log(ev)
  //	});
  //	a.fire('my_event', {"data1": 1, "data2": 2});
  //	```
  // **未列出的Event API与KISSY保持用法一致**
  //
  //| API                      | KISSY                | KISSY-MINI           |
  //| --------------------     |:--------------------:|:--------------------:|
  //| Event.Object             | YES                  | NO                   |
  //| Event.Target.publish     | YES                  | NO                   |
  //| Event.Target.addTarget   | YES                  | NO                   |
  //| Event.Target.removeTarget| YES                  | NO                   |
  //| mouseenter               | YES                  | NO                   |
  //| mouseleave               | YES                  | NO                   |
  //| mousewheel               | YES                  | NO                   |
  //| gestures                 | YES                  | `Import touch.js*`   |
  //| &nbsp;|&nbsp;|&nbsp;|
  //
  // **与 zeptojs 对比，有以下差异：**
  //
  // 1. 去除对鼠标兼容事件的支持，包括 mouseenter/mouseleave；
  // 2. 提供对普通对象的自定义事件支持，需提前混入 S.Event.Target
  //
  // **与 KISSY 对比，有以下差异：**
  //
  // 1. 仅支持链式调用，不支持 Event.on 语法；
  // 2. 自定义事件不支持冒泡等属性和方法；
  // 4. 回调返回的 event 对象是兼容处理后的原生事件对象，不再提供 ev.originalEvent
  // 5. delegate方法绑定的事件触发机制和on绑定的事件触发机制不一致（比如 delegate 绑定的事件冒泡被阻止后，在delegate中可能不生效）
  // 3. <del>触控事件需额外引入 touch.js；</del>1.0 版本之后内置 touch 模块
  //
  // **需要注意**
  //
  // KISSY MINI 极大的简化了事件机制，特别是`on`方法和`delegate`方法二者公用同一个`attach`方法，而且在底层`addEventListener`事件时的DOM节点均以delegate的最外层节点为挂载对象，所以事件的触发机制在on和delegate事件中不以有序的冒泡顺序执行，有些小众场景可能会带来bug，可以[参照测试用例](../tests/event.html)。但考虑到无线场景的简单和单一，所以此处并未做深入 hack。这也减少代码复杂度，进一步控制住了体积。
  (function(S){

    S.Event || (S.Event = {});
    var $ = S.all,
        Node = S.node,
        _eid = 1,
        isFunction = function(obj){
            return typeof obj == 'function';
        },
        /* 简化 S.mix */
        mix = function(target, source) {
            for (var key in source) {
                target[key] = source[key];
            }
        },
        /* 简化 S.each */
        each = function(obj, iterator, context) {
            Object.keys(obj).map(function(name){
                iterator.call(context, obj[name], name, obj);
            });
        },
        slice = [].slice,
        handlers = [],
        focusinSupported = 'onfocusin' in window,
        /* 焦点事件代理 */
        focusEvent = {
            focus: 'focusin',
            blur: 'focusout'
        },
        specialEvents = {
            "click": "MouseEvent"
        },
        eventMethods = {
            preventDefault: 'isDefaultPrevented',
            stopImmediatePropagation: 'isImmediatePropagationStopped',
            stopPropagation: 'isPropagationStopped'
        },
      stoppedDOMNode = [],
      originalEventTimeStamp;

    /* 内部方法，生成返回布尔值函数的方法 */
    function returnBool(trueOrFalse) {
       return function(){ return trueOrFalse; };
    }

    // eid(element)
    //
    // 内部方法，生成和 DOM 绑定的唯一 id
    // * @param  {[type]} element DOM节点
    // * @return {[type]}         返回唯一id
    function eid(element) {
        return element._eid || (element._eid = _eid++);
    }

    // parse(event)
    //
    // 内部方法，解析事件字符串
    // * @param  {String} event 原始的事件类型字符串
    // * @return {Object}       解析后得到的事件类型对象
    function parse(event) {
        var parts = event.split('.');
        return {
            e : parts[0],
            ns: parts.slice(1).join(' ')
        };
    }

    // matcherFor(ns)
    //
    // 内部方法，根据事件类型 ns 生成匹配正则，用于判断是否在同一个分组
    function matcherFor(ns) {
        return new RegExp('(?:^| )' + ns.replace(' ', ' .* ?') + '(?: |S)');
    }

    // findHandlers(el,event,fn)
    //
    // 内部方法，获得指定的 Handler
    // * @param  {[type]}   element  绑定事件的DOM节点
    // * @param  {[type]}   event    事件类型
    // * @param  {Function} fn       回调函数
    // * @param  {[type]}   selector 选择器
    // * @return {[type]}            返回事件的句柄
    function findHandlers(element, event, fn, selector, scope) {
        var evt = parse(event);
        if (evt.ns) var matcher = matcherFor(evt.ns);
        return (handlers[eid(element)] || []).filter(function(handler) {
            return handler &&
                (!evt.e || handler.e == evt.e) &&
                (!evt.ns || matcher.test(handler.ns)) &&
                (!fn || handler.fn === fn) &&
                (!selector || handler.sel == selector) &&
                (!scope || handler.scope === scope);
        });
    }

    // isCapture(handler,capture)
    //
    // 内部方法，获得是否捕获事件状态，焦点事件一律捕获
    // * @param  {[type]}  handler        事件句柄
    // * @param  {[type]}  captureSetting 捕捉状态
    // * @return {Boolean}                返回true或者false
    function isCapture(handler, capture) {
        return handler.del &&
            (!focusinSupported && (handler.e in focusEvent)) || !!capture;
    }

    // eventCvt(type)
    //
    // 内部方法，将焦点事件统一为真实事件，但 firefox 因为不支持 focusinout 所以不会被转换
    // * @param  {[type]} type 事件类型
    // * @return {[type]}      返回统一后的真实的事件
    function eventCvt(type) {
        return (focusinSupported && focusEvnet[type]) || type;
    }

    // **S.Event.createProxy(event)**
    // createProxy(event)
    //
    // 复制原事件对象，并作为原事件对象的代理，主要供内部方法调用
    // * @param  {[type]} event 事件类型
    // * @return {[type]}       返回包装好的事件
    function createProxy(event) {
        var key, proxy = {
                originalEvent: event
            };
        for (key in event)
            if (event[key] !== undefined) proxy[key] = event[key];
        return compatible(proxy, event);
    }
    S.Event.createProxy = createProxy;

    // compatible(event,source)
    //
    // 内部方法，针对三个事件属性做兼容
    // * @param  {[type]} event  事件类型
    // * @param  {[type]} source 事件发生时所处的节点
    // * @return {[type]}        返回正确的事件对象
    function compatible(event, source) {
        if (source || !event.isDefaultPrevented) {
            source || (source = event);
            each(eventMethods, function(predicate,name) {
                var sourceMethod = source[name];
                event[name] = function() {
                    this[predicate] = returnBool(true);
                    return sourceMethod && sourceMethod.apply(source, arguments);
                };
                event[predicate] = returnBool(false);
            });

        event.halt = function(){
          this.preventDefault();
          this.stopPropagation();
        };

            if (source.defaultPrevented !== undefined ? source.defaultPrevented :
                'returnValue' in source ? source.returnValue === false :
                source.getPreventDefault && source.getPreventDefault())
                event.isDefaultPrevented = returnBool(true);
        }
        return event;
    }

    // createEvent(type,props)
    //
    // 内部方法，生成原生事件对象
    // * @param   type  事件类型
    // * @param   props 上下文
    // * @return        返回正确的事件对象
    function createEvent(type, props) {
        var event = document.createEvent(specialEvents[type] || 'Events'),
            bubbles = true;
        if (props) {
            for (var name in props) {
                name == 'bubbles' ? (bubbles = !!props[name]) : (event[name] = props[name]);
            }
        }
        event.initEvent(type, bubbles, true);
        return compatible(event);
    }

    // add(el,event,fn,selector,delegate,scope)
    //
    // 内部方法，添加事件绑定的主函数
    // * @param element  要绑定事件的DOM节点
    // * @param events   事件类型
    // * @param fn       回调函数
    // * @param selector 如果是delegate时，表示filter
    // * @param delegator 事件委托的回调函数
    // * @param scope 		上下文
    //
    // 最常用的用法
    //
    // ```
    // add(el,event,fn)
    // ```
    function add(element, events, fn, selector, delegator, scope) {
        var id = eid(element),
            set = (handlers[id] || (handlers[id] = []));
        if (events == 'ready') return S.ready(fn);
        events.split(/\s/).map(function(event) {
            var handler = parse(event);
            handler.fn = fn;
            handler.sel = selector;
            handler.del = delegator;
            handler.scope = scope;
            var callback = delegator || fn;
            handler.proxy = function(e) {
                e = compatible(e);
                if (e.isImmediatePropagationStopped && e.isImmediatePropagationStopped()) return;
          /* 事件绑定的冒泡处理 */
          /* 根据事件时间戳来判断是否是同一事件，若不是，则将停止事件冒泡的状态位复原 */
          if(originalEventTimeStamp && originalEventTimeStamp !== e.timeStamp){
            stoppedDOMNode = [];
          }
          /* 如果是尝试触发停止冒泡元素之上的元素事件，则return*/
          if (e.isPropagationStopped && e.isPropagationStopped()
              && !S.inArray(e.currentTarget,stoppedDOMNode)
              && $(e.currentTarget).contains($(stoppedDOMNode[0]))){
            return;
          }
                var result = callback.apply(scope || element, e._args == undefined ? [e] : [e].concat(e._args));
                if (result === false) {
                    e.preventDefault();
                    e.stopPropagation();
                }
          originalEventTimeStamp = e.timeStamp;

          if(e.isPropagationStopped && e.isPropagationStopped()){
            if(!S.inArray(e.currentTarget,stoppedDOMNode)) stoppedDOMNode.push(e.currentTarget);
          }
                return result;
            };
            handler.i = set.length;
            set.push(handler);
            element.addEventListener(eventCvt(handler.e), handler.proxy, isCapture(handler));
        /* 自定义 DOM 事件处理，初始化*/
        if(typeof event !== 'undefined' && event in S.Event.Special){
          S.Event.Special[event].setup.apply(S.one(element,[handler.scope]));
        }
        });
    }

    // remove(el,event,fn,selector,scope,type)
    //
    // 内部方法，移除事件绑定的主函数
    // * @param   element  要移除事件的DOM对象
    // * @param   events   事件类型
    // * @param   fn       回调函数
    // * @param   selector 如果是delegate事件的移除，则表示filter
    // * @param   scope    上下文
    // * @param   type	   指示删除 on 绑定的时间还是 delegate 绑定的事件，取值为 delegate 或者 on 默认为 on
    //
    // 常用写法
    //
    // ```
    // remove(el,event,fn)
    // ```
    function remove(element, events, fn, selector, scope, type) {
      type = type || 'on';
        var id = eid(element),
            removeHandlers = function(set) {
                set.map(function(handler){
            if(type == 'delegate' && typeof handlers[id][handler.i].del === 'undefined'){
              return;


            }
                    delete handlers[id][handler.i];
                    element.removeEventListener(eventCvt(handler.e), handler.proxy, isCapture(handler));
                    /* 自定义 DOM 事件处理，销毁*/
                    if(typeof event !== 'undefined' && event in S.Event.Special){
                        S.Event.Special[event].teardown.apply(S.one(element));
                    }
                });
            };
        if(events) {
            events.split(/\s/).map(function(event) {
                removeHandlers(findHandlers(element, event, fn, selector, scope));
            });
        }
        else removeHandlers(handlers[id] || []);
    }

    // **S.Event.on(selector,event,callback,[scope])**
    //
    // 事件绑定的主要 API
    //
    // * @param  {[type]}   event    事件类型
    // * @param  {[type]}   selector 事件类型或者选择器
    // * @param  {Function} callback 回调函数
    // * @param  {[type]}   scope    上下文
    // * @return {[type]}            返回当前DOM节点
    //
    // ```
    // S.Event.on('div','div',function(e){...})
    // ```
    //
    // 可以使用`els.on('click',callback)`
    //
    // **el.on(eventType,callback)**
    //
    // 在元素上进行事件绑定，el也可以是Node列表，比如
    //
    // ```
    // S.one('div').on('click',function(){
    //		alert('ok');
    // });
    // ```
    Node.on = function(event, selector, callback, scope) {
        var delegator, _this = this;

        /* selector 为空的情况，即非 delegator */
        if (isFunction(selector)) {
            scope = callback;
            callback = selector;
            selector = undefined;
        }

        /* 阻止默认事件，kissy 不支持此方式 */
        if (callback === false) callback = returnFalse;

        _this.each(function(element) {
            /* delegate 处理逻辑 */
            if (selector) delegator = function(e) {
                var evt, match, matches = element.all(selector);
                if(!matches || !matches.length) return;
                match = matches.filter(function(el){
                    return (el == e.target) || ($(el).contains(e.target));
                });
          if(!match || !match.length) return;
          // 将待触发事件的节点反转，从内而外触发事件
          if(match.length > 1){
            var t_match = [];
            match.each(function(el){
              t_match.push(el);
            });
            for(var i = 0;i<t_match.length;i++){
              match[i] = t_match[t_match.length - 1 - i];
            }
          }
          // **注意**
          //
          // KISSY MINI 的 delegate 和 on 方法共用同一个 add 底层函数，最终调用 addEventListener 时绑定事件的DOM节点均是容器顶端节点，比如
          //
          // ```
          // delegate('#A','click','.link',callback)
          // ```
          //
          // 这个代码实际绑定事件的 DOM 节点为`"#A"`，所以当 delegate 和 on 混用的时候，事件触发顺序不是从内向外冒泡，这一点需要注意
          match.each(function(el){
            if(el) el = el.getDOMNode();
            if (el !== element.getDOMNode()) {
              evt = createProxy(e);
              evt.currentTarget = el;
              evt.liveFired = element.getDOMNode();
              /* bugfix by bachi 解决 stopPropagation 不工作的bug */
              /* 根据事件时间戳来判断是否是同一事件，若不是，则将停止事件冒泡的状态位复原*/
              if(originalEventTimeStamp
                && originalEventTimeStamp !== evt.originalEvent.timeStamp){
                stoppedDOMNode = [];
              }
              /* 如果是尝试触发停止冒泡元素之上的元素事件，则return */
              if (e.isPropagationStopped && e.isPropagationStopped()
                && el !== element.getDOMNode()
                && !S.inArray(el,stoppedDOMNode)
                && $(el).contains($(stoppedDOMNode[0]))){
                return;
              }
              // **注意**：
              //
              // KISSY MINI 绑定事件的回调闭包内的 this 指向 currentTarget，这个和 KISSY 1.4.x 不一样，KISSY 1.4.x 里的 this 指向顶端容器
              var result = callback.apply(scope || el, [evt].concat(slice.call(arguments, 1)));
              originalEventTimeStamp = evt.originalEvent.timeStamp;

              if(e.isPropagationStopped && e.isPropagationStopped()){
                if(!S.inArray(evt.currentTarget,stoppedDOMNode)) {
                  stoppedDOMNode.push(evt.currentTarget);
                }
              }
              return result;
            }
          });
            };

            add(element[0], event, callback, selector, delegator, scope);
        });

        return _this;
    };
    S.Event.on = function(host, event, callback, scope){
      $(host).on(event,callback, scope);
    };

    // **S.Event.detach(selector,event,callback,[scope])**
    //
    // 取消事件绑定的主函数
    //
    // * @param  {[type]}   event    取消事件的节点
    // * @param  {[type]}   selector 事件类型
    // * @param  {Function} callback 回调函数
    // * @param  {[type]}   scope    上下文
    // * @return {[type]}            返回当前DOM节点
    //
    // ```
    // S.Event.detach('#id','click',callback);
    // ```
    //
    // 取消事件绑定，推荐直接调用**els.detach('click',callback)**
    //
    // **el.detach(eventType,callback)**
    //
    // 取消元素事件，el也可以是Node列表。
    Node.detach = function(event, selector, callback, scope) {
        var _this = this;

        if (isFunction(selector)) {
            scope = callback;
            callback = selector;
            selector = undefined;
        }

        _this.each(function(element) {
            remove(element[0], event, callback, selector, scope, 'on');
        });

        return _this;
    };

    S.Event.detach = function(host, event, filter, callback, scope){
      $(host).detach(event, filter, callback, scope);
    };

    // **S.Event.delegate(selector,event,filter ,function(){...},[scope])**
    //
    // 事件委托，delegate 主函数，只是 Node.on 的别名
    // * @param  {[type]}   selector 选择器
    // * @param  {[type]}   eventype 事件类型
    // * @param  {Function} callback 回调函数
    // * @param  {[type]}   scope    上下文
    // * @return {[type]}            当前DOM节点
    //
    // 用法
    // ```
    // S.Event.delegate(document, 'click','input',callback);
    // ```
    //
    // 事件委托推荐直接调用**el.delegate('event',selector,callback,scop)**，针对当前节点执行事件委托，scope 为委托的节点或选择器
    //
    // **el.delegate(eventType,callback,scope)**
    //
    Node.delegate = function(event, selector, callback, scope) {
        return this.on(event, selector, callback, scope);
    };

    S.Event.delegate = function(selector,event,filter,callback,scope){
      $(selector).delegate(event, filter, callback, scope);
    };

    // **S.Event.undelegate(event,selector,function(){...},[scope])**
    // **S.Event.remove(event,selector,function(){},[scope])**
    //
    // undelegate 主函数，是`S.Event.detach`的别名，推荐直接调用**el.undelegate()**
    //
    // * @param  {[type]}   event    事件类型
    // * @param  {[type]}   selector 选择器
    // * @param  {Function} callback 回调函数
    // * @param  {[type]}   scope    上下文
    // * @return {[type]}            当前DOM节点
    //
    // **el.undelegate(eventType,selector,callback,scope)**
    //
    // S.Event.undelegate 的简用方法
    //
    // **注意 **
    //
    // 由于delegate和on事件实现机制这里做了极大的简化，因此解除绑定事件也相当的简化，针对事件委托的情况解除委托，将直接对容器顶端的事件绑定进行解除，而不会针对`filter`进行解除，所以一次`undelegate`调用可以清除整个事件委托，这一点和 KISSY 1.4.x 是不一样的
    Node.undelegate = function(event, filter, callback, scope) {
      var _this = this;
        if (isFunction(filter)) {
            scope = callback;
            callback = filter;
            filter = undefined;
        }

        _this.each(function(element) {
            remove(element[0], event, callback, filter, scope, 'delegate');
        });
      return _this;
    };

    S.Event.remove = S.Event.undelegate = function(selector, event, filter, callback, scope){
      $(selector).undelegate(event, filter, callback, scope);
    };


    // **el.fire(event,props)**
    // **S.Event.fire(selector, event,props)**
    //
    // 执行符合匹配的 dom 节点的相应事件的事件处理器，推荐直接调用
    // * @param  {String} events 事件类型
    // * @param  {Object} props  模拟处理原生事件的一些信息
    // * @return {[type]}       返回当前DOM节点
    //
    // ```
    // el.fire('click')
    // ```
    //
    // **el.fire(eventType,props)**
    //
    // 触发节点元素的`eventType`事件
    // - eventType: 事件类型
    // - props：触发事件的时候传入的回传参数
    //
    // ```
    // S.one('div').on('click',function(e){
    //		alert(e.a);
    // });
    // S.one('div').fire('click',{
    //		a:1
    // });
    // // => 弹出框，值为1
    // ```
    Node.fire = function(events, props) {
        var _this = this;
        events.split(/\s/).map(function(event){
            event = createEvent(event, props);
            _this.each(function(element) {
                if ('dispatchEvent' in element[0]) element[0].dispatchEvent(event);
                else element.fireHandler(events, props);
            });
        });
        return _this;
    };

    S.Event.fire = function(selector,event,props){
      return $(selector).fire(event,props);
    };

    // **S.Node.fireHandler(event,props)**
    //
    // 执行符合匹配的 dom 节点的相应事件的事件处理器，不会冒泡，是内部方法，不推荐直接调用
    //
    // 推荐直接执行
    //
    // ```
    // el.fireHandler('click',{...})
    // ```
    //
    // **el.fireHandler(eventType,props)**
    //
    // 以非冒泡形式触发回调，由`el.fire()`函数调用，在单纯希望执行事件绑定函数时使用此方法
    Node.fireHandler = function(events, props) {
        var e, result, _this = this;
        events.split(/\s/).map(function(event){
            _this.each(function(element) {
                e = createEvent(event);
                e.target = element[0];
          if(e.target === null){
            e = getCustomDOMEvent(e);
          }
          mix(e,props);
                findHandlers(element[0], event).map(function(handler, i) {
                    result = handler.proxy(e);
                    if (e.isImmediatePropagationStopped && e.isImmediatePropagationStopped()) return false;
                });
            });
        });
        return _this;
    };

    function getCustomDOMEvent(e){
      var eProxy = {};
      mix(eProxy,e);
      eProxy.__proto__ = e.__proto__;
      return eProxy;
    }


    S.Event || (S.Event = {});
    // **S.Event.Target**
    //
    // * @type {Object}
    //
    // 简单自定义事件对象，将普通对象混入 `Event.Target` 后，即能拥有简单的自定义事件特性。
    //
    // 事件本身是一个抽象概念，和平台无关、和设备无关、更和浏览器无关，浏览器只是使用“事件”的方法来触发特定的行为，进而触发某段网页逻辑。而常见的DOM事件诸如click,dbclick是浏览器帮我们实现的“特定行为”。而这里的“特定行为”就是触发事件的时机，是可以被重新定义的，原理上，事件都是需要精确的定义的，比如下面这个例子，我们定义了一个新事件：“初始化1秒后”
    //
    // ```
    // var EventFactory = function(){
    // 		var that = this;
    // 		setTimeout(function(){
    // 			that.fire('afterOneSecond');
    // 		},1000);
    // };
    // S.augment(EventFactory,S.Event.Target);
    // var a = new EventFactory();
    // a.on('afterOneSecond',function(){
    // 		alert('1秒后');
    // });
    // // 1秒后弹框
    // ```
    //
    // 这是一个很纯粹的自定义事件，它有事件名称`afterOneSecond`，有事件的触发条件`self.fire('afterOneSecond')`，有事件的绑定，`a.on('afterOneSecond')`。这样这个事件就能顺利的发生，并被成功监听。在代码组织层面，一般工厂类中实现了事件命名、定义和实现，属于内聚的功能实现。而绑定事件时可以是工厂类这段代码外的用户，他不会去关心事件的具体实现，只要关心工厂类"暴露了什么事件可以让我绑定"就可以了，这就是KISSY中使用自定义事件的用法。
    //
    S.Event.Target = {
        /**
         * 用于存放绑定的事件信息的临时变量
         * @type {Object}
         */
        _L: {
        /*
             "click": [
                 {
                     E: "click touchstart",
                     F: fn1,
                     S: scope1
                 },
                 {
                     E: "click",
                     F: fn2,
                     S: scope2
                 }
             ]
         */
        },
      // **obj.on(eventType,fn,[scope])**
      //
      // Event.Target 的参元方法，绑定自定义事件。混入 S.Event.Target 后的对象，可以直接使用`on()`方法，和 DOM 元素绑定事件的用法一样
      //
        // * @param  {String}   eventType 必选，绑定的事件类型，以空格分隔
        // * @param  {Function} fn        必选，触发事件后的回调方法
        // * @param  {[type]}   scope     回调方法的 this 指针
        // * @return {[type]}             返回对象本身
      //
        on: function(eventType, fn, scope) {
            var eventArr = s2a(eventType), T = this;
            eventArr.map(function(ev){
                var evt = ev in T._L ? T._L[ev] : (T._L[ev] = []);
                evt.push({
                    E: eventType,
                    F: fn,
                    S: scope
                });
            });
            return T;
        },
      // **obj.fire(event,data)**
      //
      // Event.Target 的参元方法，触发事件，和 DOM 元素的触发事件用法一样
      //
        // * @param  {String} eventType 必选，绑定的事件类型，以空格分隔
        // * @param  {[type]} data      触发事件时传递给回调事件对象的信息，而 data 后面的参数会原封不动地传过去
        // * @return {[type]}           返回对象本身
        fire: function(eventType, data) {
            var eventArr = s2a(eventType), T = this;
            eventArr.map(function(ev){
                var evt = T._L[ev],
                    returnEv = S.mix(data || {}, {target: T, currentTarget: T});
                if(!evt) return;
                evt.map(function(group){
                    group.F.apply(group.S || T, [returnEv].concat([].slice.call(arguments, 2)));
                });

            });
            return T;
        },

      // **obj.detach(event,fn)**
      //
      // Event.Target 的参元方法，解除绑定事件
      //
        // * @param  {String}   eventType 必选，绑定的事件类型，以空格分隔
        // * @param  {Function} fn        如果需要指定解除某个回调，需要填写
        // * @param  {[type]}   scope     同上，可以进一步区分某个回调
        // * @return {[type]}             返回对象本身
        detach: function(eventType, fn, scope) {
            var eventArr = s2a(eventType), T = this;
            eventArr.map(function(ev){
                /* 如果遇到相同事件，优先取消最新绑定的 */
                var evt = T._L[ev], group;
                if(!evt) return;
                if(!fn && (T._L[ev] = [])) return;
                for(var key=0; key < evt.length; key++) {
                    group = evt[key];
                    if(group.F == fn && group.S == scope) {
                        evt.splice(key, 1);
                        continue;
                    }
                    else if(group.F == fn) {
                        evt.splice(key, 1);
                        continue;
                    }
                }
            });
            return T;
        }
    };

    // **给DOM添加自定义事件**
    //
    // 自定义事件的存储命名空间，给DOM添加自定义事件的[DEMO](../example/dump/fx.html)
    //
    // ```
    //	<div id="test">
    //		<ul>
    //			<li>点击这里</li>
    //		</ul>
    //	</div>
    //	<script>
    //	var S = KISSY;
    // 	// 实现了一个新的DOM事件，名为myEvent
    //	S.Event.Special['myEvent'] = {
    //		setup:function(scope){
    //			this.delegate('click',function(e){
    //				S.one(e.currentTarget).fire('myEvent');
    //				return true;
    //			});
    //		},
    //		teardown:function(){
    //		}
    //	};
    //
    //	S.one('#test').on('myEvent',function(e){
    //		alert('ok');
    //	});
    //	</script>
    //	```
    S.Event.Special = {
      /*
      'myEvent':{
        setup:function(){
        },
        teardown:function(){
        }
      }
        */
    };

    // s2a(str)
    //
    // 内部方法，把 event 字符串格式化为数组
    function s2a(str) {
        return str.split(' ');
    }

    S.add('event',function(S){
      return S.Event;
    });

    })(KISSY);