import deepClone from "./deepClone";
import isPlainObject from "./isPlainObject";
import isArrayLikeObject from "./isArrayLikeObject";
import isObjectLike from "./isObjectLike";
import baseIsEqual from "./internal/baseIsEqual";
import isEqualWith from "./isEqualWith";
import debounce from "./debounce";
import isNumber from "./isNumber";

const isEqual = baseIsEqual;
const isUndefined = value => value === undefined;

export {
    deepClone,
    isPlainObject,
    isArrayLikeObject,
    isEqual,
    isEqualWith,
    isUndefined,
    debounce,
    isObjectLike,
    isNumber,
};
