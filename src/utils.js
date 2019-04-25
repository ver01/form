import { isArrayLikeObject, isPlainObject, isUndefined, isEqual, isEqualWith } from "./vendor/lodash";

export function getCache(cache, type, key) {
    return (cache[type] && cache[type][key]) || {};
}

export function setCache(cache, type, key, value) {
    cache[type] || (cache[type] = {});
    cache[type][key] || (cache[type][key] = {});
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

export function getByPath(obj = {}, path = "") {
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
}

export function getValueUpdateTree(oldV, newV) {
    let update = false;
    let children = [];
    if (isPlainObject(oldV)) {
        if (isPlainObject(newV)) {
            children = Object.keys(oldV).map(key => {
                const ret = getValueUpdateTree(oldV[key], newV[key]);
                update = update || ret.update;
                return { key, ...ret };
            });
        } else {
            children = Object.keys(oldV).map(key => {
                const ret = getValueUpdateTree(oldV[key]);
                update = update || ret.update;
                return { key, ...ret };
            });
        }
        if (update) {
            children.map(it => (it.update = true));
        }
        return {
            children,
            update,
        };
    } else if (isArrayLikeObject(oldV)) {
        if (isArrayLikeObject(newV)) {
            const newVLen = newV.length;
            const oldVLen = oldV.length;
            update = newVLen !== oldVLen;
            for (let ind = 0; ind < oldVLen; ind++) {
                const ret =
                    ind < newVLen ? getValueUpdateTree(oldV[ind], newV[ind]) : getValueUpdateTree(oldV[ind], undefined);
                update = update || ret.update;
                children[ind] = {
                    key: ind,
                    ...ret,
                };
            }
        } else {
            for (let ind = 0; ind < oldV.length; ind++) {
                const ret = getValueUpdateTree(oldV[ind], undefined);
                update = update || ret.update;
                children[ind] = {
                    key: ind,
                    ...ret,
                };
            }
        }
        if (update) {
            children.map(it => (it.update = true));
        }
        return {
            children,
            update,
        };
    }
    return {
        update: !(oldV === newV),
    };
}

const compare = (newV, oldV) => {
    if (typeof newV === "function") {
        if (typeof oldV === "function") {
            return newV.toString() === oldV.toString();
        }
        return false;
    } else if (isPlainObject(newV)) {
        if (isPlainObject(oldV)) {
            const keys = Object.keys(newV);
            return !keys.some(key => !isEqualWithFunction(newV[key], oldV[key], compare));
        }
        return false;
    } else if (isArrayLikeObject(newV)) {
        if (isArrayLikeObject(oldV)) {
            return !newV.some((v, ind) => !isEqualWithFunction(v, oldV[ind], compare));
        }
        return false;
    }
    return isEqual(newV, oldV);
};

export function isEqualWithFunction(newOther, other) {
    return isEqualWith(newOther, other, compare);
}
