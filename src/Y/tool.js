
export const isDef = v => v !== undefined && v !== null

export const isUndef = v => !isDef(v)

export const isUndefined = v => v === undefined

export const isNull = v => v === null

export const inArray = (item, arr) => arr.includes(item)

export const isWindow = (v) => v && v == v.window;

export const isFalse = v => v === false

export const isTrue = v => v === true

export const noop = () => {}

export const isDocument = (node) => node && node.nodeType === 9;

export const isElement = node => node && node.nodeType === 1