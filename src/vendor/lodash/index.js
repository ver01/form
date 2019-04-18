import deepClone from "./deepClone";
import isPlainObject from "./isPlainObject";
import isArrayLikeObject from "./isArrayLikeObject";
import baseIsEqual from "./.internal/baseIsEqual";
import isEqualWith from "./isEqualWith";

const isEqual = baseIsEqual;
const isUndefined = value => value === undefined;

export { deepClone, isPlainObject, isArrayLikeObject, isEqual, isEqualWith, isUndefined };
