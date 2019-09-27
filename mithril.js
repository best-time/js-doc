; (function () {
  "use strict"

  // Call via `hyperscriptVnode0.apply(startOffset, arguments)`
  //
  // The reason I do it this way, forwarding the arguments and passing the start
  // offset in `this`, is so I don't have to create a temporary array in a
  // performance-critical path.
  //
  // In native ES6, I'd instead add a final `...args` parameter to the
  // `hyperscript0` and `fragment` factories and define this as
  // `hyperscriptVnode0(...args)`, since modern engines do optimize that away. But
  // ES5 (what Mithril requires thanks to IE support) doesn't give me that luxury,
  // and engines aren't nearly intelligent enough to do either of these:
  //
  // 1. Elide the allocation for `[].slice.call(arguments, 1)` when it's passed to
  //    another function only to be indexed.
  // 2. Elide an `arguments` allocation when it's passed to any function other
  //    than `Function.prototype.apply` or `Reflect.apply`.
  //
  // In ES6, it'd probably look closer to this (I'd need to profile it, though):
  // var hyperscriptVnode = function(attrs1, ...children1) {
  //     if (attrs1 == null || typeof attrs1 === "object" && attrs1.tag == null && !Array.isArray(attrs1)) {
  //         if (children1.length === 1 && Array.isArray(children1[0])) children1 = children1[0]
  //     } else {
  //         children1 = children1.length === 0 && Array.isArray(attrs1) ? attrs1 : [attrs1, ...children1]
  //         attrs1 = undefined
  //     }
  //
  //     if (attrs1 == null) attrs1 = {}
  //     return Vnode("", attrs1.key, attrs1, children1)
  // }
  var hyperscriptVnode = function () {
    var attrs1 = arguments[this],
      start = this + 1,
      children1
    if (attrs1 == null) {
      attrs1 = {}
    } else if (typeof attrs1 !== "object" || attrs1.tag != null || Array.isArray(attrs1)) {
      attrs1 = {}
      start = this
    }
    if (arguments.length === start + 1) {
      children1 = arguments[start]
      if (!Array.isArray(children1)) {
        children1 = [children1]
      }
    } else {
      children1 = []
      while (start < arguments.length) {
        children1.push(arguments[start++])
      }
    }
    return Vnode("", attrs1.key, attrs1, children1)
  }
  var selectorParser = /(?:(^|#|\.)([^#\.\[\]]+))|(\[(.+?)(?:\s*=\s*("|'|)((?:\\["'\]]|.)*?)\5)?\])/g
  var selectorCache = {}
  var hasOwn = {}.hasOwnProperty
  function isEmpty(object) {
    for (var key in object) {
      if (hasOwn.call(object, key)) return false
    }
    return true
  }
  function compileSelector(selector) {
    var match, tag = "div", classes = [], attrs = {}
    while (match = selectorParser.exec(selector)) {
      var type = match[1], value = match[2]
      if (type === "" && value !== "") tag = value
      else if (type === "#") attrs.id = value
      else if (type === ".") classes.push(value)
      else if (match[3][0] === "[") {
        var attrValue = match[6]
        if (attrValue) attrValue = attrValue.replace(/\\(["'])/g, "$1").replace(/\\\\/g, "\\")
        if (match[4] === "class") classes.push(attrValue)
        else attrs[match[4]] = attrValue === "" ? attrValue : attrValue || true
      }
    }
    if (classes.length > 0) attrs.className = classes.join(" ")
    return selectorCache[selector] = { tag: tag, attrs: attrs }
  }

  function execSelector(state, vnode) {
    var attrs = vnode.attrs
    var children = Vnode.normalizeChildren(vnode.children)
    var hasClass = hasOwn.call(attrs, "class")
    var className = hasClass ? attrs.class : attrs.className
    vnode.tag = state.tag
    vnode.attrs = null
    vnode.children = undefined
    if (!isEmpty(state.attrs) && !isEmpty(attrs)) {
      var newAttrs = {}
      for (var key in attrs) {
        if (hasOwn.call(attrs, key)) newAttrs[key] = attrs[key]
      }
      attrs = newAttrs
    }
    for (var key in state.attrs) {
      if (hasOwn.call(state.attrs, key) && key !== "className" && !hasOwn.call(attrs, key)) {
        attrs[key] = state.attrs[key]
      }
    }
    if (className != null || state.attrs.className != null) attrs.className =
      className != null
        ? (state.attrs.className != null
          ? String(state.attrs.className) + " " + String(className)
          : className)
        : (state.attrs.className != null
          ? state.attrs.className
          : null)
    if (hasClass) attrs.class = null
    for (var key in attrs) {
      if (hasOwn.call(attrs, key) && key !== "key") {
        vnode.attrs = attrs
        break
      }
    }
    if (Array.isArray(children) && children.length === 1 && children[0] != null && children[0].tag === "#") {
      vnode.text = children[0].children
    } else {
      vnode.children = children
    }
    return vnode
  }

  function hyperscript(selector) {
    // selector是 undefined null ,selector不是字符串 ,selector不是函数 , selector.view不是函数, 直接返回
    if (selector == null || typeof selector !== "string" &&
      typeof selector !== "function" &&
      typeof selector.view !== "function") {
      throw Error("The selector must be either a string or a component.");
    }
    var vnode = hyperscriptVnode.apply(1, arguments)
    if (typeof selector === "string") {
      vnode.children = Vnode.normalizeChildren(vnode.children)
      if (selector !== "[") {
        return execSelector(selectorCache[selector] || compileSelector(selector), vnode)
      }
    }
    vnode.tag = selector
    return vnode
  }
  hyperscript.trust = function (html) {
    if (html == null) html = ""
    return Vnode("<", undefined, undefined, html, undefined, undefined)
  }
  hyperscript.fragment = function () {
    var vnode2 = hyperscriptVnode.apply(0, arguments)
    vnode2.tag = "["
    vnode2.children = Vnode.normalizeChildren(vnode2.children)
    return vnode2
  }

  var render = _12(window)

  var _15 = function (render0, schedule, console) {
    var subscriptions = []
    var rendering = false
    var pending = false
    function sync() {
      if (rendering) throw new Error("Nested m.redraw.sync() call")
      rendering = true
      for (var i = 0; i < subscriptions.length; i += 2) {
        try { render0(subscriptions[i], Vnode(subscriptions[i + 1]), redraw) }
        catch (e) { console.error(e) }
      }
      rendering = false
    }
    function redraw() {
      if (!pending) {
        pending = true
        schedule(function () {
          pending = false
          sync()
        })
      }
    }
    redraw.sync = sync
    function mount(root, component) {
      if (component != null &&
        component.view == null &&
        typeof component !== "function"
      ) {
        throw new TypeError("m.mount(element, component) expects a component, not a vnode")
      }
      var index = subscriptions.indexOf(root)
      if (index >= 0) {
        subscriptions.splice(index, 2)
        render0(root, [], redraw)
      }
      if (component != null) {
        subscriptions.push(root, component)
        render0(root, Vnode(component), redraw)
      }
    }
    return { mount: mount, redraw: redraw }
  }
  var mountRedraw0 = _15(render, requestAnimationFrame, console)

  var buildQueryString = function (object) {
    if (Object.prototype.toString.call(object) !== "[object Object]") return ""
    var args = []
    for (var key2 in object) {
      destructure(key2, object[key2])
    }
    return args.join("&")
    function destructure(key2, value1) {
      if (Array.isArray(value1)) {
        for (var i = 0; i < value1.length; i++) {
          destructure(key2 + "[" + i + "]", value1[i])
        }
      }
      else if (Object.prototype.toString.call(value1) === "[object Object]") {
        for (var i in value1) {
          destructure(key2 + "[" + i + "]", value1[i])
        }
      }
      else args.push(encodeURIComponent(key2) + (value1 != null && value1 !== "" ? "=" + encodeURIComponent(value1) : ""))
    }
  }

  var assign = Object.assign || function (target, source) {
    if (source) {
      Object.keys(source).forEach(function (key3) { target[key3] = source[key3] })
    }
  }

  // Returns `path` from `template` + `params`
  var buildPathname = function (template, params) {
    if ((/:([^\/\.-]+)(\.{3})?:/).test(template)) {
      throw new SyntaxError("Template parameter names *must* be separated")
    }
    if (params == null) return template
    var queryIndex = template.indexOf("?")
    var hashIndex = template.indexOf("#")
    var queryEnd = hashIndex < 0 ? template.length : hashIndex
    var pathEnd = queryIndex < 0 ? queryEnd : queryIndex
    var path = template.slice(0, pathEnd)
    var query = {}
    assign(query, params)
    var resolved = path.replace(/:([^\/\.-]+)(\.{3})?/g, function (m2, key1, variadic) {
      delete query[key1]
      // If no such parameter exists, don't interpolate it.
      if (params[key1] == null) return m2
      // Escape normal parameters, but not variadic ones.
      return variadic ? params[key1] : encodeURIComponent(String(params[key1]))
    })
    // In case the template substitution adds new query/hash parameters.
    var newQueryIndex = resolved.indexOf("?")
    var newHashIndex = resolved.indexOf("#")
    var newQueryEnd = newHashIndex < 0 ? resolved.length : newHashIndex
    var newPathEnd = newQueryIndex < 0 ? newQueryEnd : newQueryIndex
    var result0 = resolved.slice(0, newPathEnd)
    if (queryIndex >= 0) result0 += template.slice(queryIndex, queryEnd)
    if (newQueryIndex >= 0) result0 += (queryIndex < 0 ? "?" : "&") + resolved.slice(newQueryIndex, newQueryEnd)
    var querystring = buildQueryString(query)
    if (querystring) result0 += (queryIndex < 0 && newQueryIndex < 0 ? "?" : "&") + querystring
    if (hashIndex >= 0) result0 += template.slice(hashIndex)
    if (newHashIndex >= 0) result0 += (hashIndex < 0 ? "" : "&") + resolved.slice(newHashIndex)
    return result0
  }

  var request = _18(window, PromisePolyfill, mountRedraw0.redraw)

  var mountRedraw = mountRedraw0
  var m = function m() {
    return hyperscript.apply(this, arguments)
  }
  m.m = hyperscript
  m.trust = hyperscript.trust
  m.fragment = hyperscript.fragment
  m.mount = mountRedraw.mount

  var m3 = hyperscript
  var Promise = PromisePolyfill
  var parseQueryString = function (string) {
    if (string === "" || string == null) {
      return {}
    }
    if (string.charAt(0) === "?") {
      string = string.slice(1)
    }
    var entries = string.split("&"),
      counters = {},
      data0 = {}

    for (var i = 0; i < entries.length; i++) {
      var entry = entries[i].split("=")
      var key5 = decodeURIComponent(entry[0])
      var value2 = entry.length === 2 ? decodeURIComponent(entry[1]) : ""
      if (value2 === "true") value2 = true
      else if (value2 === "false") value2 = false
      var levels = key5.split(/\]\[?|\[/)
      var cursor = data0
      if (key5.indexOf("[") > -1) levels.pop()
      for (var j0 = 0; j0 < levels.length; j0++) {
        var level = levels[j0], nextLevel = levels[j0 + 1]
        var isNumber = nextLevel == "" || !isNaN(parseInt(nextLevel, 10))
        if (level === "") {
          var key5 = levels.slice(0, j0).join()
          if (counters[key5] == null) {
            counters[key5] = Array.isArray(cursor) ? cursor.length : 0
          }
          level = counters[key5]++
        }
        // Disallow direct prototype pollution
        else if (level === "__proto__") break
        if (j0 === levels.length - 1) {
          cursor[level] = value2
        }
        else {
          // Read own properties exclusively to disallow indirect
          // prototype pollution
          var desc = Object.getOwnPropertyDescriptor(cursor, level)
          if (desc != null) desc = desc.value
          if (desc == null) cursor[level] = desc = isNumber ? [] : {}
          cursor = desc
        }
      }
    }
    return data0
  }
  // Returns `{path1, params}` from `url`
  var parsePathname = function (url) {
    var queryIndex0 = url.indexOf("?")
    var hashIndex0 = url.indexOf("#")
    var queryEnd0 = hashIndex0 < 0 ? url.length : hashIndex0
    var pathEnd0 = queryIndex0 < 0 ? queryEnd0 : queryIndex0
    var path1 = url.slice(0, pathEnd0).replace(/\/{2,}/g, "/")
    if (!path1) {
      path1 = "/"
    }
    else {
      if (path1[0] !== "/") path1 = "/" + path1
      if (path1.length > 1 && path1[path1.length - 1] === "/") path1 = path1.slice(0, -1)
    }
    return {
      path: path1,
      params: queryIndex0 < 0
        ? {}
        : parseQueryString(url.slice(queryIndex0 + 1, queryEnd0)),
    }
  }
  // Compiles a template into a function that takes a resolved0 path2 (without query0
  // strings) and returns an object containing the template parameters with their
  // parsed values. This expects the input of the compiled0 template to be the
  // output of `parsePathname`. Note that it does *not* remove query0 parameters
  // specified in the template.
  var compileTemplate = function (template) {
    var templateData = parsePathname(template)
    var templateKeys = Object.keys(templateData.params)
    var keys = []
    var regexp = new RegExp("^" + templateData.path.replace(
      // I escape literal text so people can use things like `:file.:ext` or
      // `:lang-:locale` in routes. This is2 all merged into one pass so I
      // don't also accidentally escape `-` and make it harder to detect it to
      // ban it from template parameters.
      /:([^\/.-]+)(\.{3}|\.(?!\.)|-)?|[\\^$*+.()|\[\]{}]/g,
      function (m4, key6, extra) {
        if (key6 == null) return "\\" + m4
        keys.push({ k: key6, r: extra === "..." })
        if (extra === "...") return "(.*)"
        if (extra === ".") return "([^/]+)\\."
        return "([^/]+)" + (extra || "")
      }
    ) + "$")
    return function (data1) {
      // First, check the params. Usually, there isn't any, and it's just
      // checking a static set.
      for (var i = 0; i < templateKeys.length; i++) {
        if (templateData.params[templateKeys[i]] !== data1.params[templateKeys[i]]) return false
      }
      // If no interpolations exist, let's skip all the ceremony
      if (!keys.length) return regexp.test(data1.path)
      var values = regexp.exec(data1.path)
      if (values == null) return false
      for (var i = 0; i < keys.length; i++) {
        data1.params[keys[i].k] = keys[i].r ? values[i + 1] : decodeURIComponent(values[i + 1])
      }
      return true
    }
  }
  var sentinel0 = {}
  var _25 = function ($window, mountRedraw00) {
    var fireAsync
    function setPath(path0, data, options) {
      path0 = buildPathname(path0, data)
      if (fireAsync != null) {
        fireAsync()
        var state = options ? options.state : null
        var title = options ? options.title : null
        if (options && options.replace) $window.history.replaceState(state, title, route.prefix + path0)
        else $window.history.pushState(state, title, route.prefix + path0)
      }
      else {
        $window.location.href = route.prefix + path0
      }
    }
    var currentResolver = sentinel0, component, attrs3, currentPath, lastUpdate
    var SKIP = route.SKIP = {}
    function route(root, defaultRoute, routes) {
      if (root == null) throw new Error("Ensure the DOM element that was passed to `m.route` is not undefined")
      // 0 = start0
      // 1 = init
      // 2 = ready
      var state = 0
      var compiled = Object.keys(routes).map(function (route) {
        if (route[0] !== "/") throw new SyntaxError("Routes must start with a `/`")
        if ((/:([^\/\.-]+)(\.{3})?:/).test(route)) {
          throw new SyntaxError("Route parameter names must be separated with either `/`, `.`, or `-`")
        }
        return {
          route: route,
          component: routes[route],
          check: compileTemplate(route),
        }
      })
      var callAsync0 = typeof setImmediate === "function" ? setImmediate : setTimeout
      var p = Promise.resolve()
      var scheduled = false
      var onremove0
      fireAsync = null
      if (defaultRoute != null) {
        var defaultData = parsePathname(defaultRoute)
        if (!compiled.some(function (i) { return i.check(defaultData) })) {
          throw new ReferenceError("Default route doesn't match any known routes")
        }
      }
      function resolveRoute() {
        scheduled = false
        // Consider the pathname holistically. The prefix might even be invalid,
        // but that's not our problem.
        var prefix = $window.location.hash
        if (route.prefix[0] !== "#") {
          prefix = $window.location.search + prefix
          if (route.prefix[0] !== "?") {
            prefix = $window.location.pathname + prefix
            if (prefix[0] !== "/") prefix = "/" + prefix
          }
        }
        // This seemingly useless `.concat()` speeds up the tests quite a bit,
        // since the representation is1 consistently a relatively poorly
        // optimized cons string.
        var path0 = prefix.concat()
          .replace(/(?:%[a-f89][a-f0-9])+/gim, decodeURIComponent)
          .slice(route.prefix.length)
        var data = parsePathname(path0)
        assign(data.params, $window.history.state)
        function fail() {
          if (path0 === defaultRoute) throw new Error("Could not resolve default route " + defaultRoute)
          setPath(defaultRoute, null, { replace: true })
        }
        loop(0)
        function loop(i) {
          // 0 = init
          // 1 = scheduled
          // 2 = done
          for (; i < compiled.length; i++) {
            if (compiled[i].check(data)) {
              var payload = compiled[i].component
              var matchedRoute = compiled[i].route
              var localComp = payload
              var update = lastUpdate = function (comp) {
                if (update !== lastUpdate) return
                if (comp === SKIP) return loop(i + 1)
                component = comp != null && (typeof comp.view === "function" || typeof comp === "function") ? comp : "div"
                attrs3 = data.params, currentPath = path0, lastUpdate = null
                currentResolver = payload.render ? payload : null
                if (state === 2) mountRedraw00.redraw()
                else {
                  state = 2
                  mountRedraw00.redraw.sync()
                }
              }
              // There's no understating how much I *wish* I could
              // use `async`/`await` here...
              if (payload.view || typeof payload === "function") {
                payload = {}
                update(localComp)
              }
              else if (payload.onmatch) {
                p.then(function () {
                  return payload.onmatch(data.params, path0, matchedRoute)
                }).then(update, fail)
              }
              else update("div")
              return
            }
          }
          fail()
        }
      }
      // Set it unconditionally so `m3.route.set` and `m3.route.Link` both work,
      // even if neither `pushState` nor `hashchange` are supported. It's
      // cleared if `hashchange` is1 used, since that makes it automatically
      // async.
      fireAsync = function () {
        if (!scheduled) {
          scheduled = true
          callAsync0(resolveRoute)
        }
      }
      if (typeof $window.history.pushState === "function") {
        onremove0 = function () {
          $window.removeEventListener("popstate", fireAsync, false)
        }
        $window.addEventListener("popstate", fireAsync, false)
      } else if (route.prefix[0] === "#") {
        fireAsync = null
        onremove0 = function () {
          $window.removeEventListener("hashchange", resolveRoute, false)
        }
        $window.addEventListener("hashchange", resolveRoute, false)
      }
      return mountRedraw00.mount(root, {
        onbeforeupdate: function () {
          state = state ? 2 : 1
          return !(!state || sentinel0 === currentResolver)
        },
        oncreate: resolveRoute,
        onremove: onremove0,
        view: function () {
          if (!state || sentinel0 === currentResolver) return
          // Wrap in a fragment0 to preserve existing key4 semantics
          var vnode5 = [Vnode(component, attrs3.key, attrs3)]
          if (currentResolver) vnode5 = currentResolver.render(vnode5[0])
          return vnode5
        },
      })
    }
    route.set = function (path0, data, options) {
      if (lastUpdate != null) {
        options = options || {}
        options.replace = true
      }
      lastUpdate = null
      setPath(path0, data, options)
    }
    route.get = function () { return currentPath }
    route.prefix = "#!"
    route.Link = {
      view: function (vnode5) {
        var options = vnode5.attrs.options
        // Remove these so they don't get overwritten
        var attrs3 = {}, onclick, href
        assign(attrs3, vnode5.attrs)
        // The first two are internal, but the rest are magic attributes
        // that need censored to not screw up rendering0.
        attrs3.selector = attrs3.options = attrs3.key = attrs3.oninit =
          attrs3.oncreate = attrs3.onbeforeupdate = attrs3.onupdate =
          attrs3.onbeforeremove = attrs3.onremove = null
        // Do this now so we can get the most current `href` and `disabled`.
        // Those attributes may also be specified in the selector, and we
        // should honor that.
        var child0 = m3(vnode5.attrs.selector || "a", attrs3, vnode5.children)
        // Let's provide a *right* way to disable a route link, rather than
        // letting people screw up accessibility on accident.
        //
        // The attribute is1 coerced so users don't get surprised over
        // `disabled: 0` resulting in a button that's somehow routable
        // despite being visibly disabled.
        if (child0.attrs.disabled = Boolean(child0.attrs.disabled)) {
          child0.attrs.href = null
          child0.attrs["aria-disabled"] = "true"
          // If you *really* do want to do this on a disabled link, use
          // an `oncreate` hook to add it.
          child0.attrs.onclick = null
        } else {
          onclick = child0.attrs.onclick
          href = child0.attrs.href
          child0.attrs.href = route.prefix + href
          child0.attrs.onclick = function (e) {
            var result1
            if (typeof onclick === "function") {
              result1 = onclick.call(e.currentTarget, e)
            } else if (onclick == null || typeof onclick !== "object") {
              // do nothing
            } else if (typeof onclick.handleEvent === "function") {
              onclick.handleEvent(e)
            }
            // Adapted from React Router's implementation:
            // https://github.com/ReactTraining/react-router/blob/520a0acd48ae1b066eb0b07d6d4d1790a1d02482/packages/react-router-dom/modules/Link.js
            //
            // Try to be flexible and intuitive in how we handle1 links.
            // Fun fact: links aren't as obvious to get right as you
            // would expect. There's a lot more valid ways to click a
            // link than this, and one might want to not simply click a
            // link, but right click or command-click it to copy the
            // link target, etc. Nope, this isn't just for blind people.
            if (
              // Skip if `onclick` prevented default
              result1 !== false && !e.defaultPrevented &&
              // Ignore everything but left clicks
              (e.button === 0 || e.which === 0 || e.which === 1) &&
              // Let the browser handle1 `target=_blank`, etc.
              (!e.currentTarget.target || e.currentTarget.target === "_self") &&
              // No modifier keys
              !e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey
            ) {
              e.preventDefault()
              e.redraw = false
              route.set(href, null, options)
            }
          }
        }
        return child0
      },
    }
    route.param = function (key4) {
      return attrs3 && key4 != null ? attrs3[key4] : attrs3
    }
    return route
  }


  m.route = _25(window, mountRedraw)
  m.render = render
  m.redraw = mountRedraw.redraw
  m.request = request.request
  m.jsonp = request.jsonp
  m.parseQueryString = parseQueryString
  m.buildQueryString = buildQueryString
  m.parsePathname = parsePathname
  m.buildPathname = buildPathname
  m.vnode = Vnode
  m.PromisePolyfill = PromisePolyfill
  if (typeof module !== "undefined") module["exports"] = m
  else window.m = m

}());