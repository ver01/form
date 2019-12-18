import { isArrayLikeObject, isPlainObject, isUndefined, cloneDeep } from "lodash";
import { dealSomeOf, dealDependencies } from "./core/render/logicMods";
import { getNodeValue, setNodeValue, setCache, getDefault } from "./utils";

export function simplifySchema(runtimeSchema) {
    runtimeSchema.items && simplifySchema(runtimeSchema.items);
    if (runtimeSchema.enum && runtimeSchema.enum.length === 1) {
        runtimeSchema.const = runtimeSchema.enum[0];
        delete runtimeSchema.enum;
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
        return cloneDeep(ret);
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
    if (runtimeSchema.additionalItems) {
        if (isArrayLikeObject(runtimeSchema.additionalItems)) {
            runtimeSchema.additionalItems.map(it => handleRef(it, rootRawReadonlySchema, deep - 1));
        } else {
            handleRef(runtimeSchema.additionalItems, rootRawReadonlySchema, deep - 1);
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
                dealDependencies(runtimeSchema, runtimeValueNode);
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
    }
    initValue(options, true);
    if (schemaList) {
        options.schemaList = schemaList;
        setCache(rootControlCache, "valuePath", valuePath, { schemaList });
    } else {
        delete options.schemaList;
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
    return cloneDeep(subSchema);
}

export function isSchemaMatched(value, runtimeSchema, rootRawReadonlySchema) {
    const typeOfVal = typeof value;
    if (typeOfVal === "undefined") {
        return true;
    }
    if (Object.prototype.hasOwnProperty.call(runtimeSchema, "const")) {
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

export function initValue(options, removeTail = false) {
    const { runtimeSchema, runtimeValueNode } = options;
    let value = getNodeValue(runtimeValueNode);
    if (Object.prototype.hasOwnProperty.call(runtimeSchema, "const")) {
        setNodeValue(runtimeValueNode, cloneDeep(runtimeSchema.const));
    } else if (isArrayLikeObject(runtimeSchema.enum) && runtimeSchema.enum.length === 1) {
        setNodeValue(runtimeValueNode, cloneDeep(runtimeSchema.enum[0]));
    } else if (isUndefined(value) && !isUndefined(runtimeSchema.default)) {
        setNodeValue(runtimeValueNode, cloneDeep(runtimeSchema.default));
    } else {
        if (runtimeSchema.type === "array") {
            if (!isArrayLikeObject(value)) {
                setNodeValue(runtimeValueNode, []);
            }
        } else if (runtimeSchema.type === "object") {
            if (!isPlainObject(value)) {
                setNodeValue(runtimeValueNode, {});
            } else if (removeTail && runtimeSchema.properties) {
                const keys = Object.keys(runtimeSchema.properties);
                Object.keys(value).map(key => !keys.includes(key) && delete value[key]);
            }
        } else if (isUndefined(value)) {
            setNodeValue(runtimeValueNode, getDefault(options));
        }
    }
}

export function schemaMerge(target, ...merges) {
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
}
