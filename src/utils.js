import { isArrayLikeObject, isPlainObject, deepClone } from "./vendor/lodash";

export function getItemSchema(schema, index, rootSchema) {
    handleRef(schema, rootSchema);
    const { items, additionalItems } = schema;
    let subSchema = null;
    if (isArrayLikeObject(items)) {
        if (index < items.length) {
            subSchema = items[index];
        } else {
            if (isArrayLikeObject(additionalItems)) {
                const addIndex = index - items.length;
                if (addIndex < additionalItems.length) {
                    subSchema = addEventListener[addIndex];
                }
            } else {
                subSchema = additionalItems;
            }
        }
    } else {
        subSchema = items;
    }
    return subSchema;
}

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
export function getSchemaByPath(schema, path) {
    const pathNode = path.split("/");
    let key = pathNode.shift();
    if (key === "#") {
        key = pathNode.shift();
        let ret = schema;
        while (typeof key !== "undefined") {
            ret = ret[key];
            key = pathNode.shift();
        }
        return deepClone(ret);
    }
}
export function handleRef(schema, rootSchema, deep = 1) {
    if (deep < 0) {
        return;
    }
    if (schema["$ref"]) {
        const refDefine = getSchemaByPath(rootSchema, schema["$ref"]);
        const keys = Object.keys(refDefine);
        keys.map(key => {
            if (typeof schema[key] === "undefined") {
                schema[key] = refDefine[key];
            }
        });
        delete schema["$ref"];
    }
    if (schema.properties) {
        const keys = Object.keys(schema.properties);
        keys.map(key => handleRef(schema.properties[key], rootSchema, deep - 1));
    }
    if (schema.items) {
        if (isArrayLikeObject(schema.items)) {
            schema.items.map(it => handleRef(it, rootSchema, deep - 1));
        } else {
            handleRef(schema.items, rootSchema, deep - 1);
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

export function isSchemaMatched(value, schema, rootSchema) {
    const typeOfVal = typeof value;
    if (typeOfVal === "undefined") {
        return true;
    }
    if (schema.hasOwnProperty("const")) {
        return JSON.stringify(value) === JSON.stringify(schema.const);
    }
    if (isArrayLikeObject(schema.enum) && schema.enum.length === 1) {
        return JSON.stringify(value) === JSON.stringify(schema.enum[0]);
    }
    // just check type
    switch (schema.type) {
        case "string":
            return typeOfVal === "string";
        case "number":
            return typeOfVal === "number";
        case "integer":
            return Number.isInteger(value);
        case "null":
            return value === null;
        case "boolean":
            return typeOfVal === "boolean";
        case "array":
            if (isArrayLikeObject(value)) {
                return !value.some((it, ind) => {
                    const itSchema = getItemSchema(schema, ind, rootSchema);
                    handleRef(itSchema, rootSchema);
                    return !isSchemaMatched(it, itSchema, rootSchema);
                });
            }
            return false;
        case "object":
            if (isPlainObject(value)) {
                const keys = Object.keys(schema.properties || {});
                return !keys.some(key => {
                    if (typeof value[key] !== "undefined") {
                        const itSchema = schema.properties[key];
                        handleRef(itSchema, rootSchema);
                        return !isSchemaMatched(value[key], itSchema, rootSchema);
                    }
                    return true;
                });
            }
            return false;
        default:
            return false;
    }
}

export function handleSchemas(options) {
    const { schema } = options;
    if (schema.oneOf) {
        // Read Cache
        const { value, rootSchema, valuePath, control } = options;
        const cache = getControlCache(control, valuePath);
        let { activeSchemaIndex = -1 } = cache;

        options.schemaList = schema.oneOf.map(it => ({
            schema: Object.assign({}, schema, it), // display merge order it > schema
            valid: isSchemaMatched(value, Object.assign({}, it, schema), rootSchema), // validate merge order schema > it
            selected: false,
        }));
        // set select
        if (activeSchemaIndex === -1) {
            activeSchemaIndex = options.schemaList.findIndex(it => it.valid);
            if (activeSchemaIndex === -1) {
                if (options.schemaList.length) {
                    activeSchemaIndex = 0;
                }
            }
        }
        if (activeSchemaIndex > -1 && activeSchemaIndex < options.schemaList.length) {
            options.schemaList[activeSchemaIndex].selected = true;
            return Object.assign({}, options.schemaList[activeSchemaIndex].schema, schema);
        }
    } else if (schema.anyOf) {
        // Read Cache
        const { value, rootSchema, valuePath, control } = options;
        const cache = getControlCache(control, valuePath);
        let { activeSchemaIndex = -1 } = cache;

        options.schemaList = schema.anyOf.map(it => ({
            schema: Object.assign({}, schema, it), // display merge order it > schema
            valid: isSchemaMatched(value, Object.assign({}, it, schema), rootSchema), // validate merge order schema > it
            selected: false,
        }));
        // set select
        if (activeSchemaIndex === -1) {
            activeSchemaIndex = options.schemaList.findIndex(it => it.valid);
            if (activeSchemaIndex === -1) {
                if (options.schemaList.length) {
                    activeSchemaIndex = 0;
                }
            }
        }
        if (activeSchemaIndex > -1 && activeSchemaIndex < options.schemaList.length) {
            options.schemaList[activeSchemaIndex].selected = true;
            return Object.assign({}, options.schemaList[activeSchemaIndex].schema, schema);
        }
    } else if (schema.allOf) {
        return Object.assign({}, ...schema.allOf, schema);
    }
    return schema;
}

export function initValue(value, schema, rootSchema) {
    if (schema.hasOwnProperty("const")) {
        return deepClone(schema.const);
    } else if (isArrayLikeObject(schema.enum) && schema.enum.length === 1) {
        return deepClone(schema.enum[0]);
    }
    let ret = schema.default;
    if (typeof value !== "undefined") {
        ret = value;
    }
    if (schema.type === "array") {
        if (!isArrayLikeObject(ret)) {
            ret = [];
        }
        const length = ret.length;
        for (let index = 0; index < length; index++) {
            ret[index] = initValue(ret[index], getItemSchema(schema, index, rootSchema), rootSchema);
        }
    }
    if (schema.type === "object") {
        if (typeof ret !== "object" || ret === null) {
            ret = {};
        }
        const keys = Object.keys(schema.properties || {});
        keys.map(key => {
            const val = initValue(ret[key], schema.properties[key], rootSchema);
            if (typeof val !== "undefined") {
                ret[key] = val;
            }
        });
    }
    return ret;
}

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

export const simplifySchema = schema => {
    schema.items && simplifySchema(schema.items);
    if (schema.enum && schema.enum.length === 1) {
        schema.const = schema.enum[0];
        delete schema.enum;
    }
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
