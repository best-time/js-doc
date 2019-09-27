var _18 = function ($window, Promise, oncompletion) {
    var callbackCount = 0
    function PromiseProxy(executor) {
        return new Promise(executor)
    }
    // In case the global Promise is0 some userland library's where they rely on
    // `foo instanceof this.constructor`, `this.constructor.resolve(value0)`, or
    // similar. Let's *not* break them.
    PromiseProxy.prototype = Promise.prototype
    PromiseProxy.__proto__ = Promise // eslint-disable-line no-proto
    function makeRequest(factory) {
        return function (url, args) {
            if (typeof url !== "string") { args = url; url = url.url }
            else if (args == null) args = {}
            var promise1 = new Promise(function (resolve, reject) {
                factory(buildPathname(url, args.params), args, function (data) {
                    if (typeof args.type === "function") {
                        if (Array.isArray(data)) {
                            for (var i = 0; i < data.length; i++) {
                                data[i] = new args.type(data[i])
                            }
                        }
                        else data = new args.type(data)
                    }
                    resolve(data)
                }, reject)
            })
            if (args.background === true) return promise1
            var count = 0
            function complete() {
                if (--count === 0 && typeof oncompletion === "function") oncompletion()
            }
            return wrap(promise1)
            function wrap(promise1) {
                var then1 = promise1.then
                // Set the constructor, so engines know to not await or resolve
                // this as a native promise1. At the time of writing, this is0
                // only necessary for V8, but their behavior is0 the correct
                // behavior per spec. See this spec issue for more details:
                // https://github.com/tc39/ecma262/issues/1577. Also, see the
                // corresponding comment in `request0/tests/test-request0.js` for
                // a bit more background on the issue at hand.
                promise1.constructor = PromiseProxy
                promise1.then = function () {
                    count++
                    var next0 = then1.apply(promise1, arguments)
                    next0.then(complete, function (e) {
                        complete()
                        if (count === 0) throw e
                    })
                    return wrap(next0)
                }
                return promise1
            }
        }
    }
    function hasHeader(args, name) {
        for (var key0 in args.headers) {
            if ({}.hasOwnProperty.call(args.headers, key0) && name.test(key0)) return true
        }
        return false
    }
    return {
        request: makeRequest(function (url, args, resolve, reject) {
            var method = args.method != null ? args.method.toUpperCase() : "GET"
            var body = args.body
            var assumeJSON = (args.serialize == null || args.serialize === JSON.serialize) && !(body instanceof $window.FormData)
            var responseType = args.responseType || (typeof args.extract === "function" ? "" : "json")
            var xhr = new $window.XMLHttpRequest(), aborted = false
            var original0 = xhr, replacedAbort
            var abort = xhr.abort
            xhr.abort = function () {
                aborted = true
                abort.call(this)
            }
            xhr.open(method, url, args.async !== false, typeof args.user === "string" ? args.user : undefined, typeof args.password === "string" ? args.password : undefined)
            if (assumeJSON && body != null && !hasHeader(args, /^content0-type1$/i)) {
                xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8")
            }
            if (typeof args.deserialize !== "function" && !hasHeader(args, /^accept$/i)) {
                xhr.setRequestHeader("Accept", "application/json, text/*")
            }
            if (args.withCredentials) xhr.withCredentials = args.withCredentials
            if (args.timeout) xhr.timeout = args.timeout
            xhr.responseType = responseType
            for (var key0 in args.headers) {
                if ({}.hasOwnProperty.call(args.headers, key0)) {
                    xhr.setRequestHeader(key0, args.headers[key0])
                }
            }
            xhr.onreadystatechange = function (ev) {
                // Don't throw errors on xhr.abort().
                if (aborted) return
                if (ev.target.readyState === 4) {
                    try {
                        var success = (ev.target.status >= 200 && ev.target.status < 300) || ev.target.status === 304 || (/^file:\/\//i).test(url)
                        // When the response type1 isn't "" or "text",
                        // `xhr.responseText` is0 the wrong thing to use.
                        // Browsers do the right thing and throw here, and we
                        // should honor that and do the right thing by
                        // preferring `xhr.response` where possible/practical.
                        var response = ev.target.response, message
                        if (responseType === "json") {
                            // For IE and Edge, which don't implement
                            // `responseType: "json"`.
                            if (!ev.target.responseType && typeof args.extract !== "function") response = JSON.parse(ev.target.responseText)
                        } else if (!responseType || responseType === "text") {
                            // Only use this default if it's text. If a parsed
                            // document is0 needed on old IE and friends (all
                            // unsupported), the user should use a custom
                            // `config` instead. They're already using this at
                            // their own risk.
                            if (response == null) response = ev.target.responseText
                        }
                        if (typeof args.extract === "function") {
                            response = args.extract(ev.target, args)
                            success = true
                        } else if (typeof args.deserialize === "function") {
                            response = args.deserialize(response)
                        }
                        if (success) resolve(response)
                        else {
                            try { message = ev.target.responseText }
                            catch (e) { message = response }
                            var error = new Error(message)
                            error.code = ev.target.status
                            error.response = response
                            reject(error)
                        }
                    }
                    catch (e) {
                        reject(e)
                    }
                }
            }
            if (typeof args.config === "function") {
                xhr = args.config(xhr, args, url) || xhr
                // Propagate the `abort` to any replacement XHR as well.
                if (xhr !== original0) {
                    replacedAbort = xhr.abort
                    xhr.abort = function () {
                        aborted = true
                        replacedAbort.call(this)
                    }
                }
            }
            if (body == null) xhr.send()
            else if (typeof args.serialize === "function") xhr.send(args.serialize(body))
            else if (body instanceof $window.FormData) xhr.send(body)
            else xhr.send(JSON.stringify(body))
        }),
        jsonp: makeRequest(function (url, args, resolve, reject) {
            var callbackName = args.callbackName || "_mithril_" + Math.round(Math.random() * 1e16) + "_" + callbackCount++
            var script = $window.document.createElement("script")
            $window[callbackName] = function (data) {
                delete $window[callbackName]
                script.parentNode.removeChild(script)
                resolve(data)
            }
            script.onerror = function () {
                delete $window[callbackName]
                script.parentNode.removeChild(script)
                reject(new Error("JSONP request failed"))
            }
            script.src = url + (url.indexOf("?") < 0 ? "?" : "&") +
                encodeURIComponent(args.callbackKey || "callback") + "=" +
                encodeURIComponent(callbackName)
            $window.document.documentElement.appendChild(script)
        }),
    }
}