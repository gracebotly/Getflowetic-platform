// shims/node-util-types.js
// Browser-compatible shim for Node.js util/types module
// Used by undici when bundled for browser environments

export const isArrayBuffer = (v) => {
  if (typeof ArrayBuffer === 'undefined') return false;
  return v instanceof ArrayBuffer || 
         Object.prototype.toString.call(v) === '[object ArrayBuffer]';
};

export const isTypedArray = (v) => {
  return ArrayBuffer.isView(v) && !(v instanceof DataView);
};

export const isUint8Array = (v) => v instanceof Uint8Array;
export const isUint8ClampedArray = (v) => v instanceof Uint8ClampedArray;
export const isUint16Array = (v) => v instanceof Uint16Array;
export const isUint32Array = (v) => v instanceof Uint32Array;
export const isInt8Array = (v) => v instanceof Int8Array;
export const isInt16Array = (v) => v instanceof Int16Array;
export const isInt32Array = (v) => v instanceof Int32Array;
export const isFloat32Array = (v) => v instanceof Float32Array;
export const isFloat64Array = (v) => v instanceof Float64Array;
export const isBigInt64Array = (v) => typeof BigInt64Array !== 'undefined' && v instanceof BigInt64Array;
export const isBigUint64Array = (v) => typeof BigUint64Array !== 'undefined' && v instanceof BigUint64Array;

export const isExternal = () => false;
export const isDate = (v) => v instanceof Date;
export const isArgumentsObject = (v) => Object.prototype.toString.call(v) === '[object Arguments]';
export const isGeneratorFunction = (v) => {
  const str = Function.prototype.toString.call(v);
  return str.includes('function*') || str.includes('function *');
};
export const isGeneratorObject = (v) => {
  return v && typeof v.next === 'function' && typeof v.throw === 'function';
};
export const isAsyncFunction = (v) => {
  const str = Function.prototype.toString.call(v);
  return str.includes('async function') || str.includes('async ');
};
export const isPromise = (v) => v instanceof Promise;
export const isRegExp = (v) => v instanceof RegExp;