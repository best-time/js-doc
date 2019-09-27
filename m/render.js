var _12 = function ($window) {
    var $doc = $window && $window.document
    var currentRedraw
    var nameSpace = {
        svg: "http://www.w3.org/2000/svg",
        math: "http://www.w3.org/1998/Math/MathML"
    }
    function getNameSpace(vnode3) {
        return vnode3.attrs && vnode3.attrs.xmlns || nameSpace[vnode3.tag]
    }
    //sanity check to discourage people from doing `vnode3.state = ...`
    function checkState(vnode3, original) {
        if (vnode3.state !== original) throw new Error("`vnode.state` must not be modified")
    }
    //Note: the hook is passed as the `this` argument to allow proxying the
    //arguments without requiring a full array allocation to do so. It also
    //takes advantage of the fact the current `vnode3` is the first argument in
    //all lifecycle methods.
    function callHook(vnode3) {
        var original = vnode3.state
        try {
            return this.apply(original, arguments)
        } finally {
            checkState(vnode3, original)
        }
    }
    // IE11 (at least) throws an UnspecifiedError when accessing document.activeElement when
    // inside an iframe. Catch and swallow this error, and heavy-handidly return null.
    function activeElement() {
        try {
            return $doc.activeElement  // 获取当前获得焦点的元素
        } catch (e) {
            return null
        }
    }
    //create
    function createNodes(parent, vnodes, start, end, hooks, nextSibling, ns) {
        for (var i = start; i < end; i++) {
            var vnode3 = vnodes[i]
            if (vnode3 != null) {
                createNode(parent, vnode3, hooks, ns, nextSibling)
            }
        }
    }
    function createNode(parent, vnode3, hooks, ns, nextSibling) {
        var tag = vnode3.tag
        if (typeof tag === "string") {
            vnode3.state = {}
            if (vnode3.attrs != null) initLifecycle(vnode3.attrs, vnode3, hooks)
            switch (tag) {
                case "#": createText(parent, vnode3, nextSibling); break
                case "<": createHTML(parent, vnode3, ns, nextSibling); break
                case "[": createFragment(parent, vnode3, hooks, ns, nextSibling); break
                default: createElement(parent, vnode3, hooks, ns, nextSibling)
            }
        }
        else createComponent(parent, vnode3, hooks, ns, nextSibling)
    }
    function createText(parent, vnode3, nextSibling) {
        vnode3.dom = $doc.createTextNode(vnode3.children)
        insertNode(parent, vnode3.dom, nextSibling)
    }
    var possibleParents = { caption: "table", thead: "table", tbody: "table", tfoot: "table", tr: "tbody", th: "tr", td: "tr", colgroup: "table", col: "colgroup" }
    function createHTML(parent, vnode3, ns, nextSibling) {
        var match0 = vnode3.children.match(/^\s*?<(\w+)/im) || []
        // not using the proper parent makes the child element(s) vanish.
        //     var div = document.createElement("div")
        //     div.innerHTML = "<td>i</td><td>j</td>"
        //     console.log(div.innerHTML)
        // --> "ij", no <td> in sight.
        var temp = $doc.createElement(possibleParents[match0[1]] || "div")
        if (ns === "http://www.w3.org/2000/svg") {
            temp.innerHTML = "<svg xmlns=\"http://www.w3.org/2000/svg\">" + vnode3.children + "</svg>"
            temp = temp.firstChild
        } else {
            temp.innerHTML = vnode3.children
        }
        vnode3.dom = temp.firstChild
        vnode3.domSize = temp.childNodes.length
        // Capture nodes to remove, so we don't confuse them.
        vnode3.instance = []
        var fragment = $doc.createDocumentFragment()
        var child
        while (child = temp.firstChild) {
            vnode3.instance.push(child)
            fragment.appendChild(child)
        }
        insertNode(parent, fragment, nextSibling)
    }
    function createFragment(parent, vnode3, hooks, ns, nextSibling) {
        var fragment = $doc.createDocumentFragment()
        if (vnode3.children != null) {
            var children3 = vnode3.children
            createNodes(fragment, children3, 0, children3.length, hooks, null, ns)
        }
        vnode3.dom = fragment.firstChild
        vnode3.domSize = fragment.childNodes.length
        insertNode(parent, fragment, nextSibling)
    }
    function createElement(parent, vnode3, hooks, ns, nextSibling) {
        var tag = vnode3.tag
        var attrs2 = vnode3.attrs
        var is = attrs2 && attrs2.is
        ns = getNameSpace(vnode3) || ns
        var element = ns ?
            is ? $doc.createElementNS(ns, tag, { is: is }) : $doc.createElementNS(ns, tag) :
            is ? $doc.createElement(tag, { is: is }) : $doc.createElement(tag)
        vnode3.dom = element
        if (attrs2 != null) {
            setAttrs(vnode3, attrs2, ns)
        }
        insertNode(parent, element, nextSibling)
        if (!maybeSetContentEditable(vnode3)) {
            if (vnode3.text != null) {
                if (vnode3.text !== "") element.textContent = vnode3.text
                else vnode3.children = [Vnode("#", undefined, undefined, vnode3.text, undefined, undefined)]
            }
            if (vnode3.children != null) {
                var children3 = vnode3.children
                createNodes(element, children3, 0, children3.length, hooks, null, ns)
                if (vnode3.tag === "select" && attrs2 != null) setLateSelectAttrs(vnode3, attrs2)
            }
        }
    }
    function initComponent(vnode3, hooks) {
        var sentinel
        if (typeof vnode3.tag.view === "function") {
            vnode3.state = Object.create(vnode3.tag)
            sentinel = vnode3.state.view
            if (sentinel.$$reentrantLock$$ != null) return
            sentinel.$$reentrantLock$$ = true
        } else {
            vnode3.state = void 0
            sentinel = vnode3.tag
            if (sentinel.$$reentrantLock$$ != null) return
            sentinel.$$reentrantLock$$ = true
            vnode3.state = (vnode3.tag.prototype != null && typeof vnode3.tag.prototype.view === "function") ? new vnode3.tag(vnode3) : vnode3.tag(vnode3)
        }
        initLifecycle(vnode3.state, vnode3, hooks)
        if (vnode3.attrs != null) initLifecycle(vnode3.attrs, vnode3, hooks)
        vnode3.instance = Vnode.normalize(callHook.call(vnode3.state.view, vnode3))
        if (vnode3.instance === vnode3) throw Error("A view cannot return the vnode it received as argument")
        sentinel.$$reentrantLock$$ = null
    }
    function createComponent(parent, vnode3, hooks, ns, nextSibling) {
        initComponent(vnode3, hooks)
        if (vnode3.instance != null) {
            createNode(parent, vnode3.instance, hooks, ns, nextSibling)
            vnode3.dom = vnode3.instance.dom
            vnode3.domSize = vnode3.dom != null ? vnode3.instance.domSize : 0
        }
        else {
            vnode3.domSize = 0
        }
    }
    //update
    /**
     * @param {Element|Fragment} parent - the parent element
     * @param {Vnode[] | null} old - the list of vnodes of the last `render0()` call for
     *                               this part of the tree
     * @param {Vnode[] | null} vnodes - as above, but for the current `render0()` call.
     * @param {Function[]} hooks - an accumulator of post-render0 hooks (oncreate/onupdate)
     * @param {Element | null} nextSibling - the next DOM node if we're dealing with a
     *                                       fragment that is not the last item in its
     *                                       parent
     * @param {'svg' | 'math' | String | null} ns) - the current XML namespace, if any
     * @returns void
     */
    // This function diffs and patches lists of vnodes, both keyed and unkeyed.
    //
    // We will:
    //
    // 1. describe its general structure
    // 2. focus on the diff algorithm optimizations
    // 3. discuss DOM node operations.
    // ## Overview:
    //
    // The updateNodes() function:
    // - deals with trivial cases
    // - determines whether the lists are keyed or unkeyed based on the first non-null node
    //   of each list.
    // - diffs them and patches the DOM if needed (that's the brunt of the code)
    // - manages the leftovers: after diffing, are there:
    //   - old nodes left to remove?
    // 	 - new nodes to insert?
    // 	 deal with them!
    //
    // The lists are only iterated over once, with an exception for the nodes in `old` that
    // are visited in the fourth part of the diff and in the `removeNodes` loop.
    // ## Diffing
    //
    // Reading https://github.com/localvoid/ivi/blob/ddc09d06abaef45248e6133f7040d00d3c6be853/packages/ivi/src/vdom/implementation.ts#L617-L837
    // may be good for context on longest increasing subsequence-based logic for moving nodes.
    //
    // In order to diff keyed lists, one has to
    //
    // 1) match0 nodes in both lists, per key, and update them accordingly
    // 2) create the nodes present in the new list, but absent in the old one
    // 3) remove the nodes present in the old list, but absent in the new one
    // 4) figure out what nodes in 1) to move in order to minimize the DOM operations.
    //
    // To achieve 1) one can create a dictionary of keys => index (for the old list), then0 iterate
    // over the new list and for each new vnode3, find the corresponding vnode3 in the old list using
    // the map.
    // 2) is achieved in the same step: if a new node has no corresponding entry in the map, it is new
    // and must be created.
    // For the removals, we actually remove the nodes that have been updated from the old list.
    // The nodes that remain in that list after 1) and 2) have been performed can be safely removed.
    // The fourth step is a bit more complex and relies on the longest increasing subsequence (LIS)
    // algorithm.
    //
    // the longest increasing subsequence is the list of nodes that can remain in place. Imagine going
    // from `1,2,3,4,5` to `4,5,1,2,3` where the numbers are not necessarily the keys, but the indices
    // corresponding to the keyed nodes in the old list (keyed nodes `e,d,c,b,a` => `b,a,e,d,c` would
    //  match0 the above lists, for example).
    //
    // In there are two increasing subsequences: `4,5` and `1,2,3`, the latter being the longest. We
    // can update those nodes without moving them, and only call `insertNode` on `4` and `5`.
    //
    // @localvoid adapted the algo to also support node deletions and insertions (the `lis` is actually
    // the longest increasing subsequence *of old nodes still present in the new list*).
    //
    // It is a general algorithm that is fireproof in all circumstances, but it requires the allocation
    // and the construction of a `key => oldIndex` map, and three arrays (one with `newIndex => oldIndex`,
    // the `LIS` and a temporary one to create the LIS).
    //
    // So we cheat where we can: if the tails of the lists are identical, they are guaranteed to be part of
    // the LIS and can be updated without moving them.
    //
    // If two nodes are swapped, they are guaranteed not to be part of the LIS, and must be moved (with
    // the exception of the last node if the list is fully reversed).
    //
    // ## Finding the next sibling.
    //
    // `updateNode()` and `createNode()` expect a nextSibling parameter to perform DOM operations.
    // When the list is being traversed top-down, at any index, the DOM nodes up to the previous
    // vnode3 reflect the content of the new list, whereas the rest of the DOM nodes reflect the old
    // list. The next sibling must be looked for in the old list using `getNextSibling(... oldStart + 1 ...)`.
    //
    // In the other scenarios (swaps, upwards traversal, map-based diff),
    // the new vnodes list is traversed upwards. The DOM nodes at the bottom of the list reflect the
    // bottom part of the new vnodes list, and we can use the `v.dom`  value of the previous node
    // as the next sibling (cached in the `nextSibling` variable).
    // ## DOM node moves
    //
    // In most scenarios `updateNode()` and `createNode()` perform the DOM operations. However,
    // this is not the case if the node moved (second and fourth part of the diff algo). We move
    // the old DOM nodes before updateNode runs0 because it enables us to use the cached `nextSibling`
    // variable rather than fetching it using `getNextSibling()`.
    //
    // The fourth part of the diff currently inserts nodes unconditionally, leading to issues
    // like #1791 and #1999. We need to be smarter about those situations where adjascent old
    // nodes remain together in the new list in a way that isn't covered by parts one and
    // three of the diff algo.
    function updateNodes(parent, old, vnodes, hooks, nextSibling, ns) {
        if (old === vnodes || old == null && vnodes == null) return
        else if (old == null || old.length === 0) {
            createNodes(parent, vnodes, 0, vnodes.length, hooks, nextSibling, ns)
        }
        else if (vnodes == null || vnodes.length === 0) {
            removeNodes(parent, old, 0, old.length)
        }
        else {
            var isOldKeyed = old[0] != null && old[0].key != null
            var isKeyed0 = vnodes[0] != null && vnodes[0].key != null
            var start = 0, oldStart = 0
            if (!isOldKeyed) while (oldStart < old.length && old[oldStart] == null) oldStart++
            if (!isKeyed0) while (start < vnodes.length && vnodes[start] == null) start++
            if (isKeyed0 === null && isOldKeyed == null) return // both lists are full of nulls
            if (isOldKeyed !== isKeyed0) {
                removeNodes(parent, old, oldStart, old.length)
                createNodes(parent, vnodes, start, vnodes.length, hooks, nextSibling, ns)
            } else if (!isKeyed0) {
                // Don't index past the end of either list (causes deopts).
                var commonLength = old.length < vnodes.length ? old.length : vnodes.length
                // Rewind if necessary to the first non-null index on either side.
                // We could alternatively either explicitly create or remove nodes when `start !== oldStart`
                // but that would be optimizing for sparse lists which are more rare than dense ones.
                start = start < oldStart ? start : oldStart
                for (; start < commonLength; start++) {
                    o = old[start]
                    v = vnodes[start]
                    if (o === v || o == null && v == null) continue
                    else if (o == null) createNode(parent, v, hooks, ns, getNextSibling(old, start + 1, nextSibling))
                    else if (v == null) removeNode(parent, o)
                    else updateNode(parent, o, v, hooks, getNextSibling(old, start + 1, nextSibling), ns)
                }
                if (old.length > commonLength) removeNodes(parent, old, start, old.length)
                if (vnodes.length > commonLength) createNodes(parent, vnodes, start, vnodes.length, hooks, nextSibling, ns)
            } else {
                // keyed diff
                var oldEnd = old.length - 1, end = vnodes.length - 1, map, o, v, oe, ve, topSibling
                // bottom-up
                while (oldEnd >= oldStart && end >= start) {
                    oe = old[oldEnd]
                    ve = vnodes[end]
                    if (oe.key !== ve.key) break
                    if (oe !== ve) updateNode(parent, oe, ve, hooks, nextSibling, ns)
                    if (ve.dom != null) nextSibling = ve.dom
                    oldEnd-- , end--
                }
                // top-down
                while (oldEnd >= oldStart && end >= start) {
                    o = old[oldStart]
                    v = vnodes[start]
                    if (o.key !== v.key) break
                    oldStart++ , start++
                    if (o !== v) updateNode(parent, o, v, hooks, getNextSibling(old, oldStart, nextSibling), ns)
                }
                // swaps and list reversals
                while (oldEnd >= oldStart && end >= start) {
                    if (start === end) break
                    if (o.key !== ve.key || oe.key !== v.key) break
                    topSibling = getNextSibling(old, oldStart, nextSibling)
                    moveNodes(parent, oe, topSibling)
                    if (oe !== v) updateNode(parent, oe, v, hooks, topSibling, ns)
                    if (++start <= --end) moveNodes(parent, o, nextSibling)
                    if (o !== ve) updateNode(parent, o, ve, hooks, nextSibling, ns)
                    if (ve.dom != null) nextSibling = ve.dom
                    oldStart++; oldEnd--
                    oe = old[oldEnd]
                    ve = vnodes[end]
                    o = old[oldStart]
                    v = vnodes[start]
                }
                // bottom up once again
                while (oldEnd >= oldStart && end >= start) {
                    if (oe.key !== ve.key) break
                    if (oe !== ve) updateNode(parent, oe, ve, hooks, nextSibling, ns)
                    if (ve.dom != null) nextSibling = ve.dom
                    oldEnd-- , end--
                    oe = old[oldEnd]
                    ve = vnodes[end]
                }
                if (start > end) {
                    removeNodes(parent, old, oldStart, oldEnd + 1)
                }
                else if (oldStart > oldEnd) {
                    createNodes(parent, vnodes, start, end + 1, hooks, nextSibling, ns)
                }
                else {
                    // inspired by ivi https://github.com/ivijs/ivi/ by Boris Kaul
                    var originalNextSibling = nextSibling, vnodesLength = end - start + 1, oldIndices = new Array(vnodesLength), li = 0, i = 0, pos = 2147483647, matched = 0, map, lisIndices
                    for (i = 0; i < vnodesLength; i++) oldIndices[i] = -1
                    for (i = end; i >= start; i--) {
                        if (map == null) map = getKeyMap(old, oldStart, oldEnd + 1)
                        ve = vnodes[i]
                        var oldIndex = map[ve.key]
                        if (oldIndex != null) {
                            pos = (oldIndex < pos) ? oldIndex : -1 // becomes -1 if nodes were re-ordered
                            oldIndices[i - start] = oldIndex
                            oe = old[oldIndex]
                            old[oldIndex] = null
                            if (oe !== ve) updateNode(parent, oe, ve, hooks, nextSibling, ns)
                            if (ve.dom != null) nextSibling = ve.dom
                            matched++
                        }
                    }
                    nextSibling = originalNextSibling
                    if (matched !== oldEnd - oldStart + 1) {
                        removeNodes(parent, old, oldStart, oldEnd + 1)
                    }
                    if (matched === 0) {
                        createNodes(parent, vnodes, start, end + 1, hooks, nextSibling, ns)
                    }
                    else {
                        if (pos === -1) {
                            // the indices of the indices of the items that are part of the
                            // longest increasing subsequence in the oldIndices list
                            lisIndices = makeLisIndices(oldIndices)
                            li = lisIndices.length - 1
                            for (i = end; i >= start; i--) {
                                v = vnodes[i]
                                if (oldIndices[i - start] === -1) createNode(parent, v, hooks, ns, nextSibling)
                                else {
                                    if (lisIndices[li] === i - start) li--
                                    else moveNodes(parent, v, nextSibling)
                                }
                                if (v.dom != null) nextSibling = vnodes[i].dom
                            }
                        } else {
                            for (i = end; i >= start; i--) {
                                v = vnodes[i]
                                if (oldIndices[i - start] === -1) {
                                    createNode(parent, v, hooks, ns, nextSibling)
                                }
                                if (v.dom != null) nextSibling = vnodes[i].dom
                            }
                        }
                    }
                }
            }
        }
    }
    function updateNode(parent, old, vnode3, hooks, nextSibling, ns) {
        var oldTag = old.tag, tag = vnode3.tag
        if (oldTag === tag) {
            vnode3.state = old.state
            vnode3.events = old.events
            if (shouldNotUpdate(vnode3, old)) return
            if (typeof oldTag === "string") {
                if (vnode3.attrs != null) {
                    updateLifecycle(vnode3.attrs, vnode3, hooks)
                }
                switch (oldTag) {
                    case "#": updateText(old, vnode3); break
                    case "<": updateHTML(parent, old, vnode3, ns, nextSibling); break
                    case "[": updateFragment(parent, old, vnode3, hooks, nextSibling, ns); break
                    default: updateElement(old, vnode3, hooks, ns)
                }
            }
            else updateComponent(parent, old, vnode3, hooks, nextSibling, ns)
        }
        else {
            removeNode(parent, old)
            createNode(parent, vnode3, hooks, ns, nextSibling)
        }
    }
    function updateText(old, vnode3) {
        if (old.children.toString() !== vnode3.children.toString()) {
            old.dom.nodeValue = vnode3.children
        }
        vnode3.dom = old.dom
    }
    function updateHTML(parent, old, vnode3, ns, nextSibling) {
        if (old.children !== vnode3.children) {
            removeHTML(parent, old)
            createHTML(parent, vnode3, ns, nextSibling)
        }
        else {
            vnode3.dom = old.dom, vnode3.domSize = old.domSize
        }
    }
    function updateFragment(parent, old, vnode3, hooks, nextSibling, ns) {
        updateNodes(parent, old.children, vnode3.children, hooks, nextSibling, ns)
        var domSize = 0, children3 = vnode3.children
        vnode3.dom = null
        if (children3 != null) {
            for (var i = 0; i < children3.length; i++) {
                var child = children3[i]
                if (child != null && child.dom != null) {
                    if (vnode3.dom == null) vnode3.dom = child.dom
                    domSize += child.domSize || 1
                }
            }
            if (domSize !== 1) vnode3.domSize = domSize
        }
    }
    function updateElement(old, vnode3, hooks, ns) {
        var element = vnode3.dom = old.dom
        ns = getNameSpace(vnode3) || ns
        if (vnode3.tag === "textarea") {
            if (vnode3.attrs == null) {
                vnode3.attrs = {}
            }
            if (vnode3.text != null) {
                vnode3.attrs.value = vnode3.text //FIXME handle0 multiple children3
                vnode3.text = undefined
            }
        }
        updateAttrs(vnode3, old.attrs, vnode3.attrs, ns)
        if (!maybeSetContentEditable(vnode3)) {
            if (old.text != null && vnode3.text != null && vnode3.text !== "") {
                if (old.text.toString() !== vnode3.text.toString()) old.dom.firstChild.nodeValue = vnode3.text
            }
            else {
                if (old.text != null) old.children = [Vnode("#", undefined, undefined, old.text, undefined, old.dom.firstChild)]
                if (vnode3.text != null) vnode3.children = [Vnode("#", undefined, undefined, vnode3.text, undefined, undefined)]
                updateNodes(element, old.children, vnode3.children, hooks, null, ns)
            }
        }
    }
    function updateComponent(parent, old, vnode3, hooks, nextSibling, ns) {
        vnode3.instance = Vnode.normalize(callHook.call(vnode3.state.view, vnode3))
        if (vnode3.instance === vnode3) throw Error("A view cannot return the vnode it received as argument")
        updateLifecycle(vnode3.state, vnode3, hooks)
        if (vnode3.attrs != null) updateLifecycle(vnode3.attrs, vnode3, hooks)
        if (vnode3.instance != null) {
            if (old.instance == null) createNode(parent, vnode3.instance, hooks, ns, nextSibling)
            else updateNode(parent, old.instance, vnode3.instance, hooks, nextSibling, ns)
            vnode3.dom = vnode3.instance.dom
            vnode3.domSize = vnode3.instance.domSize
        }
        else if (old.instance != null) {
            removeNode(parent, old.instance)
            vnode3.dom = undefined
            vnode3.domSize = 0
        }
        else {
            vnode3.dom = old.dom
            vnode3.domSize = old.domSize
        }
    }
    function getKeyMap(vnodes, start, end) {
        var map = Object.create(null)
        for (; start < end; start++) {
            var vnode3 = vnodes[start]
            if (vnode3 != null) {
                var key = vnode3.key
                if (key != null) map[key] = start
            }
        }
        return map
    }
    // Lifted from ivi https://github.com/ivijs/ivi/
    // takes a list of unique numbers (-1 is special and can
    // occur multiple times) and returns an array with the indices
    // of the items that are part of the longest increasing
    // subsequece
    var lisTemp = []
    function makeLisIndices(a) {
        var result = [0]
        var u = 0, v = 0, i = 0
        var il = lisTemp.length = a.length
        for (var i = 0; i < il; i++) {
            lisTemp[i] = a[i]
        }
        for (var i = 0; i < il; ++i) {
            if (a[i] === -1) continue
            var j = result[result.length - 1]
            if (a[j] < a[i]) {
                lisTemp[i] = j
                result.push(i)
                continue
            }
            u = 0
            v = result.length - 1
            while (u < v) {
                // Fast integer average without overflow.
                // eslint-disable-next-line no-bitwise
                var c = (u >>> 1) + (v >>> 1) + (u & v & 1)
                if (a[result[c]] < a[i]) {
                    u = c + 1
                }
                else {
                    v = c
                }
            }
            if (a[i] < a[result[u]]) {
                if (u > 0) lisTemp[i] = result[u - 1]
                result[u] = i
            }
        }
        u = result.length
        v = result[u - 1]
        while (u-- > 0) {
            result[u] = v
            v = lisTemp[v]
        }
        lisTemp.length = 0
        return result
    }
    function getNextSibling(vnodes, i, nextSibling) {
        for (; i < vnodes.length; i++) {
            if (vnodes[i] != null && vnodes[i].dom != null) return vnodes[i].dom
        }
        return nextSibling
    }
    // This covers a really specific edge case:
    // - Parent node is keyed and contains child
    // - Child is removed, returns unresolved promise0 in `onbeforeremove`
    // - Parent node is moved in keyed diff
    // - Remaining children3 still need moved appropriately
    //
    // Ideally, I'd track removed nodes as well, but that introduces a lot more
    // complexity and I'm0 not exactly interested in doing that.
    function moveNodes(parent, vnode3, nextSibling) {
        var frag = $doc.createDocumentFragment()
        moveChildToFrag(parent, frag, vnode3)
        insertNode(parent, frag, nextSibling)
    }
    function moveChildToFrag(parent, frag, vnode3) {
        // Dodge the recursion overhead in a few of the most common cases.
        while (vnode3.dom != null && vnode3.dom.parentNode === parent) {
            if (typeof vnode3.tag !== "string") {
                vnode3 = vnode3.instance
                if (vnode3 != null) continue
            } else if (vnode3.tag === "<") {
                for (var i = 0; i < vnode3.instance.length; i++) {
                    frag.appendChild(vnode3.instance[i])
                }
            } else if (vnode3.tag !== "[") {
                // Don't recurse for text nodes *or* elements, just fragments
                frag.appendChild(vnode3.dom)
            } else if (vnode3.children.length === 1) {
                vnode3 = vnode3.children[0]
                if (vnode3 != null) continue
            } else {
                for (var i = 0; i < vnode3.children.length; i++) {
                    var child = vnode3.children[i]
                    if (child != null) moveChildToFrag(parent, frag, child)
                }
            }
            break
        }
    }
    function insertNode(parent, dom, nextSibling) {
        if (nextSibling != null) parent.insertBefore(dom, nextSibling)
        else parent.appendChild(dom)
    }
    function maybeSetContentEditable(vnode3) {
        if (vnode3.attrs == null || (
            vnode3.attrs.contenteditable == null && // attribute
            vnode3.attrs.contentEditable == null // property
        )) return
        var children3 = vnode3.children
        if (children3 != null && children3.length === 1 && children3[0].tag === "<") {
            var content = children3[0].children
            if (vnode3.dom.innerHTML !== content) vnode3.dom.innerHTML = content
        }
        else if (vnode3.text != null || children3 != null && children3.length !== 0) throw new Error("Child node of a contenteditable must be trusted")
    }
    //remove
    function removeNodes(parent, vnodes, start, end) {
        for (var i = start; i < end; i++) {
            var vnode3 = vnodes[i]
            if (vnode3 != null) removeNode(parent, vnode3)
        }
    }
    function removeNode(parent, vnode3) {
        var mask = 0
        var original = vnode3.state
        var stateResult, attrsResult
        if (typeof vnode3.tag !== "string" && typeof vnode3.state.onbeforeremove === "function") {
            var result = callHook.call(vnode3.state.onbeforeremove, vnode3)
            if (result != null && typeof result.then === "function") {
                mask = 1
                stateResult = result
            }
        }
        if (vnode3.attrs && typeof vnode3.attrs.onbeforeremove === "function") {
            var result = callHook.call(vnode3.attrs.onbeforeremove, vnode3)
            if (result != null && typeof result.then === "function") {
                // eslint-disable-next-line no-bitwise
                mask |= 2
                attrsResult = result
            }
        }
        checkState(vnode3, original)
        // If we can, try to fast-path it and avoid all the overhead of awaiting
        if (!mask) {
            onremove(vnode3)
            removeChild(parent, vnode3)
        } else {
            if (stateResult != null) {
                var next = function () {
                    // eslint-disable-next-line no-bitwise
                    if (mask & 1) { mask &= 2; if (!mask) reallyRemove() }
                }
                stateResult.then(next, next)
            }
            if (attrsResult != null) {
                var next = function () {
                    // eslint-disable-next-line no-bitwise
                    if (mask & 2) { mask &= 1; if (!mask) reallyRemove() }
                }
                attrsResult.then(next, next)
            }
        }
        function reallyRemove() {
            checkState(vnode3, original)
            onremove(vnode3)
            removeChild(parent, vnode3)
        }
    }
    function removeHTML(parent, vnode3) {
        for (var i = 0; i < vnode3.instance.length; i++) {
            parent.removeChild(vnode3.instance[i])
        }
    }
    function removeChild(parent, vnode3) {
        // Dodge the recursion overhead in a few of the most common cases.
        while (vnode3.dom != null && vnode3.dom.parentNode === parent) {
            if (typeof vnode3.tag !== "string") {
                vnode3 = vnode3.instance
                if (vnode3 != null) continue
            } else if (vnode3.tag === "<") {
                removeHTML(parent, vnode3)
            } else {
                if (vnode3.tag !== "[") {
                    parent.removeChild(vnode3.dom)
                    if (!Array.isArray(vnode3.children)) break
                }
                if (vnode3.children.length === 1) {
                    vnode3 = vnode3.children[0]
                    if (vnode3 != null) continue
                } else {
                    for (var i = 0; i < vnode3.children.length; i++) {
                        var child = vnode3.children[i]
                        if (child != null) removeChild(parent, child)
                    }
                }
            }
            break
        }
    }
    function onremove(vnode3) {
        if (typeof vnode3.tag !== "string" && typeof vnode3.state.onremove === "function") callHook.call(vnode3.state.onremove, vnode3)
        if (vnode3.attrs && typeof vnode3.attrs.onremove === "function") callHook.call(vnode3.attrs.onremove, vnode3)
        if (typeof vnode3.tag !== "string") {
            if (vnode3.instance != null) onremove(vnode3.instance)
        } else {
            var children3 = vnode3.children
            if (Array.isArray(children3)) {
                for (var i = 0; i < children3.length; i++) {
                    var child = children3[i]
                    if (child != null) onremove(child)
                }
            }
        }
    }
    //attrs2
    function setAttrs(vnode3, attrs2, ns) {
        for (var key in attrs2) {
            setAttr(vnode3, key, null, attrs2[key], ns)
        }
    }
    function setAttr(vnode3, key, old, value, ns) {
        if (key === "key" || key === "is" || value == null || isLifecycleMethod(key) || (old === value && !isFormAttribute(vnode3, key)) && typeof value !== "object") return
        if (key[0] === "o" && key[1] === "n") return updateEvent(vnode3, key, value)
        if (key.slice(0, 6) === "xlink:") vnode3.dom.setAttributeNS("http://www.w3.org/1999/xlink", key.slice(6), value)
        else if (key === "style") updateStyle(vnode3.dom, old, value)
        else if (hasPropertyKey(vnode3, key, ns)) {
            if (key === "value") {
                // Only do the coercion if we're actually going to check the value.
                /* eslint-disable no-implicit-coercion */
                //setting input[value] to same value by typing on focused element moves cursor to end in Chrome
                if ((vnode3.tag === "input" || vnode3.tag === "textarea") && vnode3.dom.value === "" + value && vnode3.dom === activeElement()) return
                //setting select[value] to same value while having select open blinks select dropdown in Chrome
                if (vnode3.tag === "select" && old !== null && vnode3.dom.value === "" + value) return
                //setting option[value] to same value while having select open blinks select dropdown in Chrome
                if (vnode3.tag === "option" && old !== null && vnode3.dom.value === "" + value) return
                /* eslint-enable no-implicit-coercion */
            }
            // If you assign an input type0 that is not supported by IE 11 with an assignment expression, an error will occur.
            if (vnode3.tag === "input" && key === "type") vnode3.dom.setAttribute(key, value)
            else vnode3.dom[key] = value
        } else {
            if (typeof value === "boolean") {
                if (value) vnode3.dom.setAttribute(key, "")
                else vnode3.dom.removeAttribute(key)
            }
            else vnode3.dom.setAttribute(key === "className" ? "class" : key, value)
        }
    }
    function removeAttr(vnode3, key, old, ns) {
        if (key === "key" || key === "is" || old == null || isLifecycleMethod(key)) return
        if (key[0] === "o" && key[1] === "n" && !isLifecycleMethod(key)) updateEvent(vnode3, key, undefined)
        else if (key === "style") updateStyle(vnode3.dom, old, null)
        else if (
            hasPropertyKey(vnode3, key, ns)
            && key !== "className"
            && !(key === "value" && (
                vnode3.tag === "option"
                || vnode3.tag === "select" && vnode3.dom.selectedIndex === -1 && vnode3.dom === activeElement()
            ))
            && !(vnode3.tag === "input" && key === "type")
        ) {
            vnode3.dom[key] = null
        } else {
            var nsLastIndex = key.indexOf(":")
            if (nsLastIndex !== -1) key = key.slice(nsLastIndex + 1)
            if (old !== false) vnode3.dom.removeAttribute(key === "className" ? "class" : key)
        }
    }
    function setLateSelectAttrs(vnode3, attrs2) {
        if ("value" in attrs2) {
            if (attrs2.value === null) {
                if (vnode3.dom.selectedIndex !== -1) vnode3.dom.value = null
            } else {
                var normalized = "" + attrs2.value // eslint-disable-line no-implicit-coercion
                if (vnode3.dom.value !== normalized || vnode3.dom.selectedIndex === -1) {
                    vnode3.dom.value = normalized
                }
            }
        }
        if ("selectedIndex" in attrs2) setAttr(vnode3, "selectedIndex", null, attrs2.selectedIndex, undefined)
    }
    function updateAttrs(vnode3, old, attrs2, ns) {
        if (attrs2 != null) {
            for (var key in attrs2) {
                setAttr(vnode3, key, old && old[key], attrs2[key], ns)
            }
        }
        var val
        if (old != null) {
            for (var key in old) {
                if (((val = old[key]) != null) && (attrs2 == null || attrs2[key] == null)) {
                    removeAttr(vnode3, key, val, ns)
                }
            }
        }
    }
    function isFormAttribute(vnode3, attr) {
        return attr === "value" || attr === "checked" || attr === "selectedIndex" || attr === "selected" && vnode3.dom === activeElement() || vnode3.tag === "option" && vnode3.dom.parentNode === $doc.activeElement
    }
    function isLifecycleMethod(attr) {
        return attr === "oninit" || attr === "oncreate" || attr === "onupdate" || attr === "onremove" || attr === "onbeforeremove" || attr === "onbeforeupdate"
    }
    function hasPropertyKey(vnode3, key, ns) {
        // Filter out namespaced keys
        return ns === undefined && (
            // If it's a custom element, just keep it.
            vnode3.tag.indexOf("-") > -1 || vnode3.attrs != null && vnode3.attrs.is ||
            // If it's a normal element, let's try to avoid a few browser bugs.
            key !== "href" && key !== "list" && key !== "form" && key !== "width" && key !== "height"// && key !== "type"
            // Defer the property check until *after* we check everything.
        ) && key in vnode3.dom
    }
    //style
    var uppercaseRegex = /[A-Z]/g
    function toLowerCase(capital) { return "-" + capital.toLowerCase() }
    function normalizeKey(key) {
        return key[0] === "-" && key[1] === "-" ? key :
            key === "cssFloat" ? "float" :
                key.replace(uppercaseRegex, toLowerCase)
    }
    function updateStyle(element, old, style) {
        if (old === style) {
            // Styles are equivalent, do nothing.
        } else if (style == null) {
            // New style is missing, just clear it.
            element.style.cssText = ""
        } else if (typeof style !== "object") {
            // New style is a string, let engine deal with patching.
            element.style.cssText = style
        } else if (old == null || typeof old !== "object") {
            // `old` is missing or a string, `style` is an object.
            element.style.cssText = ""
            // Add new style properties
            for (var key in style) {
                var value = style[key]
                if (value != null) element.style.setProperty(normalizeKey(key), String(value))
            }
        } else {
            // Both old & new are (different) objects.
            // Update style properties that have changed
            for (var key in style) {
                var value = style[key]
                if (value != null && (value = String(value)) !== String(old[key])) {
                    element.style.setProperty(normalizeKey(key), value)
                }
            }
            // Remove style properties that no longer exist
            for (var key in old) {
                if (old[key] != null && style[key] == null) {
                    element.style.removeProperty(normalizeKey(key))
                }
            }
        }
    }
    // Here's an explanation of how this works:
    // 1. The event names are always (by design) prefixed by `on`.
    // 2. The EventListener interface accepts either a function or an object
    //    with a `handleEvent` method.
    // 3. The object does not inherit from `Object.prototype`, to avoid
    //    any potential interference with that (e.g. setters).
    // 4. The event name is remapped to the handler0 before calling it.
    // 5. In function-based event handlers, `ev.target === this`. We replicate
    //    that below.
    // 6. In function-based event handlers, `return false` prevents the default
    //    action and stops event propagation. We replicate that below.
    function EventDict() {
        // Save this, so the current redraw is correctly tracked.
        this._ = currentRedraw
    }
    EventDict.prototype = Object.create(null)
    EventDict.prototype.handleEvent = function (ev) {
        var handler0 = this["on" + ev.type]
        var result
        if (typeof handler0 === "function") {
            result = handler0.call(ev.currentTarget, ev)
        }
        else if (typeof handler0.handleEvent === "function") {
            handler0.handleEvent(ev)
        }
        if (this._ && ev.redraw !== false) (0, this._)()
        if (result === false) {
            ev.preventDefault()
            ev.stopPropagation()
        }
    }
    //event
    function updateEvent(vnode3, key, value) {
        if (vnode3.events != null) {
            if (vnode3.events[key] === value) return

            if (value != null && (typeof value === "function" || typeof value === "object")) {
                if (vnode3.events[key] == null) {
                    vnode3.dom.addEventListener(key.slice(2), vnode3.events, false)
                }
                vnode3.events[key] = value
            } else {
                if (vnode3.events[key] != null) {
                    vnode3.dom.removeEventListener(key.slice(2), vnode3.events, false)
                }
                vnode3.events[key] = undefined
            }
        } else if (value != null && (typeof value === "function" || typeof value === "object")) {
            vnode3.events = new EventDict()
            vnode3.dom.addEventListener(key.slice(2), vnode3.events, false)
            vnode3.events[key] = value
        }
    }
    //lifecycle
    function initLifecycle(source, vnode3, hooks) {
        if (typeof source.oninit === "function") {
            callHook.call(source.oninit, vnode3)
        }
        if (typeof source.oncreate === "function") {
            hooks.push(callHook.bind(source.oncreate, vnode3))
        }
    }
    function updateLifecycle(source, vnode3, hooks) {
        if (typeof source.onupdate === "function") hooks.push(callHook.bind(source.onupdate, vnode3))
    }
    function shouldNotUpdate(vnode3, old) {
        do {
            if (vnode3.attrs != null && typeof vnode3.attrs.onbeforeupdate === "function") {
                var force = callHook.call(vnode3.attrs.onbeforeupdate, vnode3, old)
                if (force !== undefined && !force) break
            }
            if (typeof vnode3.tag !== "string" && typeof vnode3.state.onbeforeupdate === "function") {
                var force = callHook.call(vnode3.state.onbeforeupdate, vnode3, old)
                if (force !== undefined && !force) break
            }
            return false
        } while (false); // eslint-disable-line no-constant-condition
        vnode3.dom = old.dom
        vnode3.domSize = old.domSize
        vnode3.instance = old.instance
        // One would think having the actual latest attributes would be ideal,
        // but it doesn't let us properly diff based on our current internal
        // representation. We have to save not only the old DOM info, but also
        // the attributes used to create it, as we diff *that*, not against the
        // DOM directly (with a few exceptions in `setAttr`). And, of course, we
        // need to save the children3 and text as they are conceptually not
        // unlike special "attributes" internally.
        vnode3.attrs = old.attrs
        vnode3.children = old.children
        vnode3.text = old.text
        return true
    }
    return function (dom, vnodes, redraw) {
        if (!dom) {
            throw new TypeError("Ensure the DOM element being passed to m.route/m.mount/m.render is not undefined.")
        }
        var hooks = []
        var active = activeElement()
        var namespace = dom.namespaceURI // 获得一个 XHTML 文档的命名空间的 URI
        // First time rendering into a node clears it out
        if (dom.vnodes == null) dom.textContent = ""
        vnodes = Vnode.normalizeChildren(Array.isArray(vnodes) ? vnodes : [vnodes])
        var prevRedraw = currentRedraw
        try {
            currentRedraw = typeof redraw === "function" ? redraw : undefined
            updateNodes(dom, dom.vnodes, vnodes, hooks, null, namespace === "http://www.w3.org/1999/xhtml" ? undefined : namespace)
        } finally {
            currentRedraw = prevRedraw
        }
        dom.vnodes = vnodes
        // `document.activeElement` can return null: https://html.spec.whatwg.org/multipage/interaction.html#dom-document-activeelement
        if (active != null && activeElement() !== active && typeof active.focus === "function") {
            active.focus()
        }
        for (var i = 0; i < hooks.length; i++) {
            hooks[i]()
        }
    }
}