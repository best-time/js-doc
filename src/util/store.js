var utils = {
    isArray: Array.isArray || function (value) {
        return Object.prototype.toString.call(value) === '[object Array]';
    },

    isPlainObj: (value) => value === Object(value),

    toArray: (value) => [].slice.call(value),

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

    serialize: (data) => JSON.stringify(data),

    unserialize: (data) => data == null ? data : JSON.parse(data)

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
    return this.set(key, !(this.get(key)));
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

xStore.prototype.extend = function (key, k, v) { // variables?
    var value = this.get(key, {});
    if (utils.isPlainObj(k)) {
        for (var _k in k) {
            if (k.hasOwnProperty(_k)) value[_k] = k[_k];
        }
    } else {
        value[k] = v
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

export default xStore
