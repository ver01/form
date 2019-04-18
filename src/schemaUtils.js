import { isArrayLikeObject, isPlainObject, deepClone } from "./vendor/lodash";
import { dealSomeOf, dealInitValue, dealDependencies } from "./core/render/logicMods";

export const simplifySchema = schema => {
    schema.items && simplifySchema(schema.items);
    if (schema.enum && schema.enum.length === 1) {
        schema.const = schema.enum[0];
        delete schema.enum;
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

export function handleXofAndValue(options) {
    const { schema, rootControlCache, valuePath, valueNode, rootRawReadonlySchema } = options;

    // **** init schema, schemaList, value
    // params init
    let schemaList = null;
    let isRawSchema = true;
    let isSchemaChange = true;

    while (isSchemaChange) {
        // someOf part
        if (isRawSchema || isSchemaChange) {
            isSchemaChange = false;

            if (isArrayLikeObject(schema.oneOf)) {
                isRawSchema = false;
                isSchemaChange = true;
                schemaList = dealSomeOf(
                    schema,
                    schema.oneOf,
                    null,
                    rootControlCache,
                    valuePath,
                    valueNode,
                    rootRawReadonlySchema
                );
            } else if (isArrayLikeObject(schema.anyOf)) {
                isRawSchema = false;
                isSchemaChange = true;
                schemaList = dealSomeOf(
                    schema,
                    schema.anyOf,
                    null,
                    rootControlCache,
                    valuePath,
                    valueNode,
                    rootRawReadonlySchema
                );
            } else if (isArrayLikeObject(schema.allOf)) {
                isRawSchema = false;
                isSchemaChange = true;
                schemaList = dealSomeOf(
                    schema,
                    null,
                    schema.allOf,
                    rootControlCache,
                    valuePath,
                    valueNode,
                    rootRawReadonlySchema
                );
            }
            if (isSchemaChange) {
                delete schema.oneOf;
                delete schema.anyOf;
                delete schema.allOf;

                // **** simplify schema & update value;
                simplifySchema(schema);
                dealInitValue(options, schema);
            }
        }

        // dependencies part
        if (isRawSchema || isSchemaChange) {
            isSchemaChange = false;

            if (isPlainObject(schema.dependencies)) {
                isRawSchema = false;
                isSchemaChange = true;
                dealDependencies(schema, options.value);
            }

            if (isSchemaChange) {
                // **** simplify schema & update value;
                simplifySchema(schema);
                dealInitValue(options, schema);
            }
        }
    }

    // schema no change need update value
    if (isRawSchema) {
        simplifySchema(schema);
        dealInitValue(options, schema);
    }
    if (schemaList) {
        rootControlCache.valuePath[valuePath].schemaList = schemaList;
    }
}

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
