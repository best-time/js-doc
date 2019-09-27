function Vnode(tag, key, attrs0, children0, text, dom) {
    return {
      tag: tag,
      key: key,
      attrs: attrs0,
      children: children0,
      text: text,
      dom: dom,
      domSize: undefined,
      state: undefined,
      events: undefined,
      instance: undefined
    }
  }
  Vnode.normalize = function (node) {
    if (Array.isArray(node)) {
      return Vnode("[", undefined, undefined, Vnode.normalizeChildren(node), undefined, undefined)
    }
    if (node == null || typeof node === "boolean") {
      return null
    }
    if (typeof node === "object") {
      return node
    }
    return Vnode("#", undefined, undefined, String(node), undefined, undefined)
  }
  Vnode.normalizeChildren = function (input) {
    var children0 = []
    if (input.length) {
      var isKeyed = input[0] != null && input[0].key != null
      // Note: this is a *very* perf-sensitive check.
      // Fun fact: merging the loop like this is somehow faster than splitting
      // it, noticeably so.
      for (var i = 1; i < input.length; i++) {
        if ((input[i] != null && input[i].key != null) !== isKeyed) {
          throw new TypeError("Vnodes must either always have keys or never have keys!")
        }
      }
      for (var i = 0; i < input.length; i++) {
        var tmp = Vnode.normalize(input[i])
        children0[i] = tmp
      }
    }
    return children0
  }