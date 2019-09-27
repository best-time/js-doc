const isArray = Array.isArray || function (object) { return object instanceof Array }
const $ = {}
let emptyArray = [],
    concat = emptyArray.concat,
    filter = emptyArray.filter,
    slice = emptyArray.slice,
    document = window.document,
    class2type = {},
      toString = class2type.toString

    function type(obj) {
        return obj == null ? String(obj) :
          class2type[toString.call(obj)] || "object"
      }
    
      function isFunction(value) { return type(value) == "function" }
      function isWindow(obj)     { return obj != null && obj == obj.window }
      function isDocument(obj)   { return obj != null && obj.nodeType == obj.DOCUMENT_NODE }
      function isObject(obj)     { return type(obj) == "object" }
      function isPlainObject(obj) {
        return isObject(obj) && !isWindow(obj) && Object.getPrototypeOf(obj) == Object.prototype
      }
    
      function likeArray(obj) {
        var length = !!obj && 'length' in obj && obj.length,
          type = $.type(obj)
    
        return 'function' != type && !isWindow(obj) && (
          'array' == type || length === 0 ||
            (typeof length == 'number' && length > 0 && (length - 1) in obj)
        )
      }

function compact(array) {
    return filter.call(array, function (item) { return item != null })
}
function flatten(array) {
    return array.length > 0 ? concat.apply([], array) : array
}
const camelize = function (str) {
    return str.replace(/-+(.)?/g, function (match, chr) { return chr ? chr.toUpperCase() : '' })
}

uniq = function (array) {
    return filter.call(array, function (item, idx) {
        return array.indexOf(item) == idx
    })
}

$.map = function (elements, callback) {
    var value, values = [], i, key
    if (likeArray(elements))
        for (i = 0; i < elements.length; i++) {
            value = callback(elements[i], i)
            if (value != null) values.push(value)
        }
    else
        for (key in elements) {
            value = callback(elements[key], key)
            if (value != null) values.push(value)
        }
    return flatten(values)
}

function children(element) {
    return 'children' in element ?
        slice.call(element.children) :
        $.map(element.childNodes, function (node) { if (node.nodeType == 1) return node })
}


$.contains = document.documentElement.contains ?
    function (parent, node) {
        return parent !== node && parent.contains(node)
    } :
    function (parent, node) {
        while (node && (node = node.parentNode))
            if (node === parent) return true
        return false
    }

function setAttribute(node, name, value) {
    value == null ? node.removeAttribute(name) : node.setAttribute(name, value)
}


function className(node, value) {
    var klass = node.className || '',
        svg = klass && klass.baseVal !== undefined

    if (value === undefined) return svg ? klass.baseVal : klass
    svg ? (klass.baseVal = value) : (node.className = value)
}


    // "true"  => true
    // "false" => false
    // "null"  => null
    // "42"    => 42
    // "42.5"  => 42.5
    // "08"    => "08"
    // JSON    => parse if valid
    // String  => self
    function deserializeValue(value) {
        try {
          return value ?
            value == "true" ||
            ( value == "false" ? false :
              value == "null" ? null :
              +value + "" == value ? +value :
              /^[\[\{]/.test(value) ? $.parseJSON(value) :
              value )
            : value
        } catch(e) {
          return value
        }
      }


      $.isEmptyObject = function(obj) {
        var name
        for (name in obj) return false
        return true
      }
    
      $.isNumeric = function(val) {
        var num = Number(val), type = typeof val
        return val != null && type != 'boolean' &&
          (type != 'string' || val.length) &&
          !isNaN(num) && isFinite(num) || false
      }
    
      $.inArray = function(elem, array, i){
        return emptyArray.indexOf.call(array, elem, i)
      }


      $.trim = function(str) {
        return str == null ? "" : String.prototype.trim.call(str)
      }

      $.grep = function(elements, callback){
        return filter.call(elements, callback)
      }



      const addClass = (el, className) => {
        if (el.classList)
        el.classList.add(className);
      else
        el.className += ' ' + className;
      }

      const after = (el, htmlString) => {
        el.insertAdjacentHTML('afterend', htmlString);
        // el.insertAdjacentHTML('beforebegin', htmlString);
      }

      append = (parent, el) => {
        parent.appendChild(el);
      }

      contain = (el, child) => {
        el !== child && el.contains(child);
      }

      each = (selector, fn) => {
        var elements = document.querySelectorAll(selector);
        Array.prototype.forEach.call(elements, function(el, i){
        
        });
      }

      empty = (el) => {
        while(el.firstChild)
        el.removeChild(el.firstChild);
    //   谷歌浏览器，火狐浏览器，IE9+
    //   el.innerHTML = '';
      }

      css = (el, ruleName) => {
        getComputedStyle(el)[ruleName];
      }

      hasClass = (el, className) => {
        el.classList.contains(className);
      }


      var matches = function(el, selector) {
        return (el.matches || el.matchesSelector || el.msMatchesSelector || el.mozMatchesSelector || el.webkitMatchesSelector || el.oMatchesSelector).call(el, selector);
      };
      
    //   matches(el, '.my-class');



      offset = () => {
        var rect = el.getBoundingClientRect()

        return {
          top: rect.top + document.body.scrollTop,
          left: rect.left + document.body.scrollLeft
        }
      }


      function ready(fn) {
        if (document.readyState != 'loading'){
          fn();
        } else {
          document.addEventListener('DOMContentLoaded', fn);
        }
      }

      if (window.CustomEvent) {
        var event = new CustomEvent('my-event', {detail: {some: 'data'}});
      } else {
        var event = document.createEvent('CustomEvent');
        event.initCustomEvent('my-event', true, true, {some: 'data'});
      }
      
      el.dispatchEvent(event);

      var deepExtend = function(out) {
        out = out || {};
      
        for (var i = 1; i < arguments.length; i++) {
          var obj = arguments[i];
      
          if (!obj)
            continue;
      
          for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
              if (typeof obj[key] === 'object')
                deepExtend(out[key], obj[key]);
              else
                out[key] = obj[key];
            }
          }
        }
      
        return out;
      };

      function fadeIn(el) {
        var opacity = 0;
      
        el.style.opacity = 0;
        el.style.filter = '';
      
        var last = +new Date();
        var tick = function() {
          opacity += (new Date() - last) / 400;
          el.style.opacity = opacity;
          el.style.filter = 'alpha(opacity=' + (100 * opacity)|0 + ')';
      
          last = +new Date();
      
          if (opacity < 1) {
            (window.requestAnimationFrame && requestAnimationFrame(tick)) || setTimeout(tick, 16);
          }
        };
      
        tick();
      }
      
      fadeIn(el);



      /**
    
      http://www.webhek.com/post/you-do-not-need-jquery.html
       */