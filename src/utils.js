import { isArrayLikeObject, isPlainObject, deepClone } from "./vendor/lodash";

export function getCache(cache, type, key) {
    try {
        let ret = cache[type][key];
        return typeof ret === "undefined" ? {} : ret;
    } catch (e) {
        return {};
    }
}

export function getDefault(options) {
    const { schema } = options;
    if (schema) {
        if (schema.default) {
            return schema.default;
        } else if (typeof schema.const !== "undefined") {
            return schema.const;
        } else if (schema.oneOf && schema.oneOf[0]) {
            const a = schema;
            const b = schema.oneOf[0];
            const { oneOf, ...others } = deepClone(Object.assign({}, b, a));
            return getDefault({ schema: { ...others } });
        } else if (schema.anyOf) {
            const a = schema;
            const b = schema.anyOf[0];
            const { anyOf, ...others } = deepClone(Object.assign({}, b, a));
            return getDefault({ schema: { ...others } });
        } else if (schema.allOf) {
            const { anyOf, ...others } = deepClone(Object.assign({}, ...schema.anyOf, schema));
            return getDefault({ schema: { ...others } });
        } else {
            switch (schema.type) {
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
                    if (schema.properties) {
                        const keys = Object.keys(schema.properties);
                        if (keys.length) {
                            keys.map(key => {
                                result[key] = getDefault({
                                    schema: schema.properties[key],
                                });
                            });
                        }
                    }
                    return result;
                }
                default: {
                    return;
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

export const schemaMerge = (target, ...merges) => {
    const merge = (a, b) => {
        const { title: titleA = "", properties: propertiesA = {}, required: requiredA = [] } = a;
        const { title: titleB = "", properties: propertiesB = {}, required: requiredB = [], ...othersB } = b;

        // title
        const newTitle = titleA ? titleA : titleB;

        // properties
        const pAkeys = Object.keys(propertiesA);
        const overWriteProperties = {};
        const appendProperties = {};
        Object.keys(propertiesB).map(key =>
            pAkeys.includes(key)
                ? (overWriteProperties[key] = schemaMerge(propertiesA[key], propertiesB[key]))
                : (appendProperties[key] = propertiesB[key])
        );

        // required
        const appendRequired = [];
        requiredB.map(key => (requiredA.includes(key) ? null : appendRequired.push(key)));

        Object.assign(a, {
            title: newTitle,
            properties: {
                ...propertiesA,
                ...overWriteProperties,
                ...appendProperties,
            },
            required: [...requiredA, ...appendRequired],
            ...othersB,
        });
        return a;
    };
    merges.map(it => merge(target, it));
    return target;
};
