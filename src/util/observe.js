const {TARGET, UNSUBSCRIBE, PATH_SEPARATOR} = {
  PATH_SEPARATOR: '.',
  TARGET: Symbol('target'),
  UNSUBSCRIBE: Symbol('unsubscribe'),
};
const path = {
  after: (path, subPath) => {
    if (isArray(path)) {
      return path.slice(subPath.length);
    }

    if (subPath === '') {
      return path;
    }

    return path.slice(subPath.length + 1);
  },
  concat: (path, key) => {
    if (isArray(path)) {
      path = path.slice();

      if (key) {
        path.push(key);
      }

      return path;
    }

    if (key && key.toString !== undefined) {
      if (path !== '') {
        path += PATH_SEPARATOR;
      }

      if (isSymbol(key)) {
        return path + 'Symbol(' + key.description + ')';
      }

      return path + key;
    }

    return path;
  },
  initial: (path) => {
    if (isArray(path)) {
      return path.slice(0, -1);
    }

    if (path === '') {
      return path;
    }

    const index = path.lastIndexOf(PATH_SEPARATOR);

    if (index === -1) {
      return '';
    }

    return path.slice(0, index);
  },
  walk: (path, callback) => {
    if (isArray(path)) {
      path.forEach(callback);
    } else if (path !== '') {
      let position = 0;
      let index = path.indexOf(PATH_SEPARATOR);

      if (index === -1) {
        callback(path);
      } else {
        while (position < path.length) {
          if (index === -1) {
            index = path.length;
          }

          callback(path.slice(position, index));

          position = index + 1;
          index = path.indexOf(PATH_SEPARATOR, position);
        }
      }
    }
  },
};
const isArray = Array.isArray;
const isSymbol = (value) => typeof value === 'symbol';

const isPrimitive = (value) =>
  value === null || (typeof value !== 'object' && typeof value !== 'function');

const isBuiltinWithoutMutableMethods = (value) =>
  value instanceof RegExp || value instanceof Number;

const isBuiltinWithMutableMethods = (value) => value instanceof Date;

const isSameDescriptor = (a, b) => {
  return (
    a !== undefined &&
    b !== undefined &&
    Object.is(a.value, b.value) &&
    (a.writable || false) === (b.writable || false) &&
    (a.enumerable || false) === (b.enumerable || false) &&
    (a.configurable || false) === (b.configurable || false)
  );
};

const shallowClone = (value) => {
  if (isArray(value)) {
    return value.slice();
  }

  return {...value};
};

const onChange = (object, onChange, options = {}) => {
  const proxyTarget = Symbol('ProxyTarget');
  let inApply = false;
  let changed = false;
  let applyPath;
  let applyPrevious;
  let isUnsubscribed = false;
  const equals = options.equals || Object.is;
  let propCache = new WeakMap();
  let pathCache = new WeakMap();
  let proxyCache = new WeakMap();

  const handleChange = (changePath, property, previous, value) => {
    if (isUnsubscribed) {
      return;
    }

    if (!inApply) {
      onChange(path.concat(changePath, property), value, previous);
      return;
    }

    if (
      inApply &&
      applyPrevious &&
      previous !== undefined &&
      value !== undefined &&
      property !== 'length'
      ) {
      let item = applyPrevious;

      if (changePath !== applyPath) {
        changePath = path.after(changePath, applyPath);

        path.walk(changePath, (key) => {
          item[key] = shallowClone(item[key]);
          item = item[key];
        });
      }

      item[property] = previous;
    }

    changed = true;
  };

  const getOwnPropertyDescriptor = (target, property) => {
    let props = propCache !== null && propCache.get(target);

    if (props) {
      props = props.get(property);
    }

    if (props) {
      return props;
    }

    props = new Map();
    propCache.set(target, props);

    let prop = props.get(property);

    if (!prop) {
      prop = Reflect.getOwnPropertyDescriptor(target, property);
      props.set(property, prop);
    }

    return prop;
  };

  const invalidateCachedDescriptor = (target, property) => {
    const props = propCache ? propCache.get(target) : undefined;

    if (props) {
      props.delete(property);
    }
  };

  const buildProxy = (value, path) => {
    if (isUnsubscribed) {
      return value;
    }

    pathCache.set(value, path);

    let proxy = proxyCache.get(value);

    if (proxy === undefined) {
      proxy = new Proxy(value, handler);
      proxyCache.set(value, proxy);
    }

    return proxy;
  };

  const unsubscribe = (target) => {
    isUnsubscribed = true;
    propCache = null;
    pathCache = null;
    proxyCache = null;

    return target;
  };

  const ignoreProperty = (property) => {
    return (
      isUnsubscribed ||
      (options.ignoreSymbols === true && isSymbol(property)) ||
      (options.ignoreUnderscores === true && property.charAt(0) === '_') ||
      (options.ignoreKeys !== undefined &&
        options.ignoreKeys.includes(property))
    );
  };

  const handler = {
    get(target, property, receiver) {
      if (property === proxyTarget || property === TARGET) {
        return target;
      }

      if (
        property === UNSUBSCRIBE &&
        pathCache !== null &&
        pathCache.get(target) === ''
      ) {
        return unsubscribe(target);
      }

      const value = Reflect.get(target, property, receiver);
      if (
        isPrimitive(value) ||
        isBuiltinWithoutMutableMethods(value) ||
        property === 'constructor' ||
        options.isShallow === true ||
        ignoreProperty(property)
      ) {
        return value;
      }

      // Preserve invariants
      const descriptor = getOwnPropertyDescriptor(target, property);
      if (descriptor && !descriptor.configurable) {
        if (descriptor.set && !descriptor.get) {
          return undefined;
        }

        if (descriptor.writable === false) {
          return value;
        }
      }

      return buildProxy(value, path.concat(pathCache.get(target), property));
    },

    set(target, property, value, receiver) {
      if (value && value[proxyTarget] !== undefined) {
        value = value[proxyTarget];
      }

      const ignore = ignoreProperty(property);
      const previous = ignore ? null : Reflect.get(target, property, receiver);
      const isChanged = !(property in target) || !equals(previous, value);
      let result = true;

      if (isChanged) {
        result = Reflect.set(target[proxyTarget] || target, property, value);

        if (!ignore && result) {
          handleChange(pathCache.get(target), property, previous, value);
        }
      }

      return result;
    },

    defineProperty(target, property, descriptor) {
      let result = true;

      if (
        !isSameDescriptor(
          descriptor,
          getOwnPropertyDescriptor(target, property)
        )
      ) {
        result = Reflect.defineProperty(target, property, descriptor);

        if (result && !ignoreProperty(property) && !isSameDescriptor()) {
          invalidateCachedDescriptor(target, property);

          handleChange(
            pathCache.get(target),
            property,
            undefined,
            descriptor.value
          );
        }
      }

      return result;
    },

    deleteProperty(target, property) {
      if (!Reflect.has(target, property)) {
        return true;
      }

      const ignore = ignoreProperty(property);
      const previous = ignore ? null : Reflect.get(target, property);
      const result = Reflect.deleteProperty(target, property);

      if (!ignore && result) {
        invalidateCachedDescriptor(target, property);

        handleChange(pathCache.get(target), property, previous);
      }

      return result;
    },

    apply(target, thisArg, argumentsList) {
      const compare = isBuiltinWithMutableMethods(thisArg);

      if (compare) {
        thisArg = thisArg[proxyTarget];
      }

      if (!inApply) {
        inApply = true;

        if (compare) {
          applyPrevious = thisArg.valueOf();
        }

        if (isArray(thisArg) || toString.call(thisArg) === '[object Object]') {
          applyPrevious = shallowClone(thisArg[proxyTarget]);
        }

        applyPath = path.initial(pathCache.get(target));

        const result = Reflect.apply(target, thisArg, argumentsList);

        inApply = false;

        if (changed || (compare && !equals(applyPrevious, thisArg.valueOf()))) {
          handleChange(
            applyPath,
            '',
            applyPrevious,
            thisArg[proxyTarget] || thisArg
          );
          applyPrevious = null;
          changed = false;
        }

        return result;
      }

      return Reflect.apply(target, thisArg, argumentsList);
    },
  };

  const proxy = buildProxy(object, options.pathAsArray === true ? [] : '');
  onChange = onChange.bind(proxy);

  return proxy;
};

onChange.target = (proxy) => proxy[TARGET] || proxy;
onChange.unsubscribe = (proxy) => proxy[UNSUBSCRIBE] || proxy;

module.exports = onChange;
