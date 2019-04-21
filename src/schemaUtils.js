import { isArrayLikeObject, isPlainObject, isUndefined, deepClone } from "./vendor/lodash";
import { dealSomeOf, dealDependencies } from "./core/render/logicMods";
import { getNodeValue, setNodeValue, setCache } from "./utils";

export const simplifySchema = runtimeSchema => {
    runtimeSchema.items && simplifySchema(runtimeSchema.items);
    if (runtimeSchema.enum && runtimeSchema.enum.length === 1) {
        runtimeSchema.const = runtimeSchema.enum[0];
        delete runtimeSchema.enum;
    }
};

export function getValueByAbsolutePath(value, absoluteSchemaPath) {
    if (!value || typeof absoluteSchemaPath !== "string") {
        return null;
    }
    const paths = absoluteSchemaPath.split("/");
    if (paths[0]) {
        // only absolute path support
        return null;
    }
    let v = value;
    for (let index = 1; index < paths.length; index++) {
        let path = paths[index];
        if (path === "properties") {
            index++;
            if (index >= paths.length) {
                return null;
            }
            path = paths[index];
            if (path && value[path]) {
                v = value;
            } else {
                return null;
            }
        }
    }
    return v;
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
export function handleRef(runtimeSchema, rootRawReadonlySchema, deep = 1) {
    if (deep < 0) {
        return;
    }
    if (runtimeSchema["$ref"]) {
        const refDefine = getSchemaByPath(rootRawReadonlySchema, runtimeSchema["$ref"]);
        const keys = Object.keys(refDefine);
        keys.map(key => {
            if (typeof runtimeSchema[key] === "undefined") {
                runtimeSchema[key] = refDefine[key];
            }
        });
        delete runtimeSchema["$ref"];
    }
    if (runtimeSchema.properties) {
        const keys = Object.keys(runtimeSchema.properties);
        keys.map(key => handleRef(runtimeSchema.properties[key], rootRawReadonlySchema, deep - 1));
    }
    if (runtimeSchema.items) {
        if (isArrayLikeObject(runtimeSchema.items)) {
            runtimeSchema.items.map(it => handleRef(it, rootRawReadonlySchema, deep - 1));
        } else {
            handleRef(runtimeSchema.items, rootRawReadonlySchema, deep - 1);
        }
    }
}

export function handleXofAndValue(options) {
    const { runtimeSchema, rootControlCache, valuePath, runtimeValueNode, rootRawReadonlySchema } = options;

    // **** init runtimeSchema, schemaList, runtimeValueNode
    // params init
    let schemaList = null;
    let isRawSchema = true;
    let isSchemaChange = true;

    while (isSchemaChange) {
        // someOf part
        if (isRawSchema || isSchemaChange) {
            isSchemaChange = false;

            if (isArrayLikeObject(runtimeSchema.oneOf)) {
                isRawSchema = false;
                isSchemaChange = true;
                schemaList = dealSomeOf(
                    runtimeSchema,
                    runtimeSchema.oneOf,
                    null,
                    rootControlCache,
                    valuePath,
                    runtimeValueNode,
                    rootRawReadonlySchema
                );
            } else if (isArrayLikeObject(runtimeSchema.anyOf)) {
                isRawSchema = false;
                isSchemaChange = true;
                schemaList = dealSomeOf(
                    runtimeSchema,
                    runtimeSchema.anyOf,
                    null,
                    rootControlCache,
                    valuePath,
                    runtimeValueNode,
                    rootRawReadonlySchema
                );
            } else if (isArrayLikeObject(runtimeSchema.allOf)) {
                isRawSchema = false;
                isSchemaChange = true;
                schemaList = dealSomeOf(
                    runtimeSchema,
                    null,
                    runtimeSchema.allOf,
                    rootControlCache,
                    valuePath,
                    runtimeValueNode,
                    rootRawReadonlySchema
                );
            }
            if (isSchemaChange) {
                delete runtimeSchema.oneOf;
                delete runtimeSchema.anyOf;
                delete runtimeSchema.allOf;

                // **** simplify schema & update value;
                simplifySchema(runtimeSchema);
                initValue(options);
            }
        }

        // dependencies part
        if (isRawSchema || isSchemaChange) {
            isSchemaChange = false;

            if (isPlainObject(runtimeSchema.dependencies)) {
                isRawSchema = false;
                isSchemaChange = true;
                dealDependencies(runtimeSchema, options.value);
            }

            if (isSchemaChange) {
                // **** simplify runtimeSchema & update value;
                simplifySchema(runtimeSchema);
                initValue(options);
            }
        }
    }

    // schema no change need update value
    if (isRawSchema) {
        simplifySchema(runtimeSchema);
        initValue(options);
    }
    if (schemaList) {
        setCache(rootControlCache, "valuePath", valuePath, { schemaList });
    }
}

export function getItemSchema(runtimeSchema, index, rootRawReadonlySchema) {
    handleRef(runtimeSchema, rootRawReadonlySchema);
    const { items, additionalItems } = runtimeSchema;
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

export function isSchemaMatched(value, runtimeSchema, rootRawReadonlySchema) {
    const typeOfVal = typeof value;
    if (typeOfVal === "undefined") {
        return true;
    }
    if (runtimeSchema.hasOwnProperty("const")) {
        return JSON.stringify(value) === JSON.stringify(runtimeSchema.const);
    }
    if (isArrayLikeObject(runtimeSchema.enum) && runtimeSchema.enum.length === 1) {
        return JSON.stringify(value) === JSON.stringify(runtimeSchema.enum[0]);
    }
    // just check type
    switch (runtimeSchema.type) {
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
                    const itSchema = getItemSchema(runtimeSchema, ind, rootRawReadonlySchema);
                    handleRef(itSchema, rootRawReadonlySchema);
                    return !isSchemaMatched(it, itSchema, rootRawReadonlySchema);
                });
            }
            return false;
        case "object":
            if (isPlainObject(value)) {
                const keys = Object.keys(runtimeSchema.properties || {});
                return !keys.some(key => {
                    if (typeof value[key] !== "undefined") {
                        const itSchema = runtimeSchema.properties[key];
                        handleRef(itSchema, rootRawReadonlySchema);
                        return !isSchemaMatched(value[key], itSchema, rootRawReadonlySchema);
                    }
                    return true;
                });
            }
            return false;
        default:
            return false;
    }
}

export function initValue(options) {
    const { runtimeSchema, runtimeValueNode, rootRawReadonlySchema } = options;
    let value = getNodeValue(runtimeValueNode);
    if (runtimeSchema.hasOwnProperty("const")) {
        setNodeValue(runtimeValueNode, deepClone(runtimeSchema.const));
    } else if (isArrayLikeObject(runtimeSchema.enum) && runtimeSchema.enum.length === 1) {
        setNodeValue(runtimeValueNode, deepClone(runtimeSchema.enum[0]));
    } else if (isUndefined(value) && !isUndefined(runtimeSchema.default)) {
        setNodeValue(runtimeValueNode, deepClone(runtimeSchema.default));
    } else {
        if (runtimeSchema.type === "array") {
            if (!isArrayLikeObject(value)) {
                value = [];
                setNodeValue(runtimeValueNode, []);
            }
            const length = value.length;
            for (let index = 0; index < length; index++) {
                initValue({
                    ...options,
                    runtimeValueNode: { node: value, key: index },
                    runtimeSchema: getItemSchema(runtimeSchema, index, rootRawReadonlySchema),
                    rootRawReadonlySchema,
                });
            }
        } else if (runtimeSchema.type === "object") {
            if (!isPlainObject(value)) {
                value = {};
                setNodeValue(runtimeValueNode, {});
            }
            const keys = Object.keys(runtimeSchema.properties || {});
            keys.map(key => {
                if (!isUndefined(value[key])) {
                    initValue({
                        ...options,
                        runtimeValueNode: { node: value, key },
                        runtimeSchema: runtimeSchema.properties[key],
                        rootRawReadonlySchema,
                    });
                }
            });
        }
    }
}

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
