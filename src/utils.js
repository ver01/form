import { isArrayLikeObject, isPlainObject } from "./vendor/lodash";
import { isUndefined } from "./vendor/lodash";

export function getCache(cache, type, key) {
    return (cache[type] && cache[type][key]) || {};
}

export function setCache(cache, type, key, value) {
    cache[type] || (cache[type] = {});
    Object.assign(cache[type][key], value);
}

export function deleteCache(cache, type, key) {
    cache[type] && delete cache[type][key];
}

export function getNodeValue(node) {
    return node.node ? node.node[node.key] : undefined;
}

export function setNodeValue(node, value) {
    node.node && (node.node[node.key] = value);
}

export function getDefault(options) {
    const { runtimeSchema } = options;
    if (runtimeSchema) {
        if (!isUndefined(runtimeSchema.const)) {
            return runtimeSchema.const;
        } else if (runtimeSchema.default) {
            return runtimeSchema.default;
        } else if (isArrayLikeObject(runtimeSchema.oneOf) && runtimeSchema.oneOf[0]) {
            const a = runtimeSchema;
            const b = runtimeSchema.oneOf[0];
            const { oneOf, ...others } = Object.assign({}, a, b);
            return getDefault({ runtimeSchema: others });
        } else if (runtimeSchema.anyOf) {
            const a = runtimeSchema;
            const b = runtimeSchema.anyOf[0];
            const { anyOf, ...others } = Object.assign({}, a, b);
            return getDefault({ runtimeSchema: others });
        } else if (runtimeSchema.allOf) {
            const { allOf, ...others } = Object.assign({}, runtimeSchema, ...runtimeSchema.allOf);
            return getDefault({ runtimeSchema: others });
        } else {
            switch (runtimeSchema.type) {
                case "string": {
                    return "";
                }
                case "number": {
                    return 0;
                }
                case "integer": {
                    return 0;
                }
                case "null": {
                    return null;
                }
                case "array": {
                    return [];
                }
                case "boolean": {
                    return false;
                }
                case "object": {
                    const result = {};
                    if (runtimeSchema.properties) {
                        const keys = Object.keys(runtimeSchema.properties);
                        if (keys.length) {
                            keys.map(key => {
                                result[key] = getDefault({
                                    runtimeSchema: runtimeSchema.properties[key],
                                });
                            });
                        }
                    }
                    return result;
                }
                default: {
                    return undefined;
                }
            }
        }
    }
}

export const getControlCache = (control, valuePath) => {
    const ps = valuePath.split("/");
    let node = control;
    ps.slice(1).some(it => {
        if (node.children[it]) {
            node = node.children[it];
            return false;
        }
        node = null;
        return true;
    });
    return node ? node.cache : {};
};

export const getByPath = (obj = {}, path = "") => {
    const pathArr = path.split("/").filter(it => it);
    let ret = obj;
    for (let index = 0; index < pathArr.length; index++) {
        const p = pathArr[index];
        ret = ret[p];
        if (ret === undefined) {
            return;
        }
    }
    return ret;
};

export const getValueChange = (oldV, newV, node = {}) => {
    if (isPlainObject(oldV)) {
        node.children = {};
        if (isPlainObject(newV)) {
            node.hasChange = false;
            Object.keys(oldV).map(key => {
                node.children[key] = {};
                const { hasChange } = getValueChange(oldV[key], newV[key], node.children[key]);
                node.hasChange = node.hasChange || hasChange;
            });
        } else {
            node.hasChange = true;
            Object.keys(oldV).map(key => {
                node.children[key] = {};
                getValueChange(oldV[key], undefined, node.children[key]);
            });
        }
    } else if (isArrayLikeObject(oldV)) {
        node.children = [];
        if (isArrayLikeObject(newV)) {
            const newVLen = newV.length;
            const oldVLen = oldV.length;
            if (oldVLen === newVLen) {
                node.hasChange = false;
                for (let ind = 0; ind < newVLen; ind++) {
                    node.children[ind] = {};
                    const { hasChange } = getValueChange(oldV[ind], newV[ind], node.children[ind]);
                    node.hasChange = node.hasChange || hasChange;
                }
            } else {
                node.hasChange = true;
                for (let ind = 0; ind < oldVLen; ind++) {
                    node.children[ind] = {};
                    if (ind < newVLen) {
                        getValueChange(oldV[ind], newV[ind], node.children[ind]);
                    } else {
                        getValueChange(oldV[ind], undefined, node.children[ind]);
                    }
                    node.children[ind].hasChange = true; // for array control render update
                }
            }
        } else {
            node.hasChange = true;
            for (let ind = 0; ind < oldV.length; ind++) {
                node.children[ind] = {};
                getValueChange(oldV[ind], undefined, node.children[ind]);
            }
        }
    } else {
        node.hasChange = !(oldV === newV);
    }
    return node;
};
