import { getByPath, getNodeValue } from "../utils";
import { isArrayLikeObject, isPlainObject, isUndefined } from "../vendor/lodash";

const handleValidator = (options, ThemeCache) => {
    const {
        runtimeValueNode,
        rootRawReadonlyValue,
        rootRuntimeSchema,
        parentRuntimeSchema,
        parentRuntimeValue,
        runtimeSchema,
        rootRuntimeError,
        valuePath,
        formProps,
        objectKey,
        arrayIndex,
    } = options;
    const value = getNodeValue(runtimeValueNode);
    const errors = [];
    let errorObj = null;
    const valueType = typeof value;
    const { validators = {} } = ThemeCache;
    const {
        required,
        typeof: typeofValidate,
        minLength,
        maxItems,
        minItems,
        minimum,
        maximum,
        multipleOf,
        format,
        pattern,
        uniqueItems,
        dependencies,
    } = validators;
    const parentType = parentRuntimeSchema && parentRuntimeSchema.type;

    const errorsPush = err => !isUndefined(err) && errors.push(err);

    // minLength check
    if (
        minLength &&
        Number.isInteger(runtimeSchema.minLength) &&
        runtimeSchema.type === "string" &&
        valueType === "string" &&
        value.length < runtimeSchema.minLength
    ) {
        errorsPush(minLength({ value, ruleValue: runtimeSchema.minLength, schema: runtimeSchema }));
    }

    // require check
    if (
        required &&
        parentType === "object" &&
        isArrayLikeObject(parentRuntimeSchema.required) &&
        parentRuntimeSchema.required.includes(objectKey)
    ) {
        switch (runtimeSchema.type) {
            case "string": {
                if (!value) {
                    errorsPush(required({ value, ruleValue: true, schema: runtimeSchema }));
                }
                break;
            }
            default:
                if (isUndefined(value)) {
                    errorsPush(required({ value, ruleValue: true, schema: runtimeSchema }));
                }
                break;
        }
    }

    // type check
    if (valueType !== "undefined") {
        switch (runtimeSchema.type) {
            case "string": {
                if (valueType !== "string") {
                    errorsPush(typeofValidate({ value, ruleValue: runtimeSchema.type, schema: runtimeSchema }));
                }
                break;
            }
            case "number": {
                if (valueType !== "number") {
                    errorsPush(typeofValidate({ value, ruleValue: runtimeSchema.type, schema: runtimeSchema }));
                }
                break;
            }
            case "integer": {
                if (valueType !== "number" || !Number.isInteger(value)) {
                    errorsPush(typeofValidate({ value, ruleValue: runtimeSchema.type, schema: runtimeSchema }));
                }
                break;
            }
            case "boolean": {
                if (valueType !== "boolean") {
                    errorsPush(typeofValidate({ value, ruleValue: runtimeSchema.type, schema: runtimeSchema }));
                }
                break;
            }
            case "null": {
                if (value !== null) {
                    errorsPush(typeofValidate({ value, ruleValue: runtimeSchema.type, schema: runtimeSchema }));
                }
                break;
            }
            case "array": {
                if (!isArrayLikeObject(value)) {
                    errorsPush(typeofValidate({ value, ruleValue: runtimeSchema.type, schema: runtimeSchema }));
                }
                break;
            }
            case "object": {
                if (!isPlainObject(value)) {
                    errorsPush(typeofValidate({ value, ruleValue: runtimeSchema.type, schema: runtimeSchema }));
                }
                break;
            }
        }
    }

    // minItems check
    if (
        minItems &&
        Number.isInteger(runtimeSchema.minItems) &&
        isArrayLikeObject(value) &&
        value.length < runtimeSchema.minItems
    ) {
        errorsPush(minItems({ value, ruleValue: runtimeSchema.minItems, schema: runtimeSchema }));
    }

    // maxItems check
    if (
        maxItems &&
        Number.isInteger(runtimeSchema.maxItems) &&
        isArrayLikeObject(value) &&
        value.length > runtimeSchema.maxItems
    ) {
        errorsPush(maxItems({ value, ruleValue: runtimeSchema.maxItems, schema: runtimeSchema }));
    }

    // minimum check
    if (minimum && ["number", "integer"].includes(runtimeSchema.type)) {
        const num = Number(runtimeSchema.minimum);
        if (!Number.isNaN(num) && value < num) {
            errorsPush(minimum({ value, ruleValue: num, schema: runtimeSchema }));
        }
    }

    // maximum check
    if (maximum && ["number", "integer"].includes(runtimeSchema.type)) {
        const num = Number(runtimeSchema.maximum);
        if (!Number.isNaN(num) && value > num) {
            errorsPush(maximum({ value, ruleValue: num, schema: runtimeSchema }));
        }
    }

    // multipleOf check
    if (multipleOf && ["number", "integer"].includes(runtimeSchema.type)) {
        const num = Number(runtimeSchema.multipleOf);
        if (!Number.isNaN(num)) {
            if (value % num !== 0) {
                errorsPush(multipleOf({ value, ruleValue: num, schema: runtimeSchema }));
            }
        }
    }

    // string format check
    if (format && runtimeSchema.type === "string" && !isUndefined(runtimeSchema.format)) {
        switch (runtimeSchema.format) {
            case "email":
                {
                    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                    if (value && !re.test(String(value).toLowerCase())) {
                        errorsPush(format({ value, ruleValue: runtimeSchema.format, schema: runtimeSchema }));
                    }
                }
                break;
            case "uri":
                {
                    const re = /^[-a-zA-Z0-9@:%_+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_+.~#?&//=]*)?$/;
                    if (value && !re.test(String(value).toLowerCase())) {
                        errorsPush(format({ value, ruleValue: runtimeSchema.format, schema: runtimeSchema }));
                    }
                }
                break;
            default:
                break;
        }
    }

    // string pattern check
    if (pattern && runtimeSchema.type === "string" && !isUndefined(runtimeSchema.pattern)) {
        const ret = new RegExp(runtimeSchema.pattern);
        if (!ret.test(value)) {
            errorsPush(pattern({ value, ruleValue: runtimeSchema.pattern, schema: runtimeSchema }));
        }
    }

    // uniqueItems check
    if (
        uniqueItems &&
        parentType === "array" &&
        (parentRuntimeSchema && parentRuntimeSchema.uniqueItems) === true &&
        isArrayLikeObject(parentRuntimeValue) &&
        arrayIndex
    ) {
        const cmp = JSON.stringify(value);
        for (let i = 0; i < arrayIndex; i++) {
            if (cmp === JSON.stringify(parentRuntimeValue[i])) {
                errorsPush(uniqueItems({ value, ruleValue: i + 1, schema: runtimeSchema }));
            }
        }
    }
    // dependencies check
    if (
        dependencies &&
        parentType === "object" &&
        isPlainObject(parentRuntimeSchema.dependencies) &&
        isPlainObject(parentRuntimeValue) &&
        ((valueType === "string" && !value) || isUndefined(value))
    ) {
        const keys = Object.keys(parentRuntimeSchema.dependencies).filter(
            it =>
                isArrayLikeObject(parentRuntimeSchema.dependencies[it]) &&
                parentRuntimeSchema.dependencies[it].includes(objectKey)
        );

        const pushErr = key => {
            let title;
            try {
                title = parentRuntimeSchema.properties[key].title || key;
            } catch (e) {
                title = key;
            }
            errorsPush(
                dependencies({
                    value,
                    ruleValue: title,
                    schema: parentRuntimeSchema,
                })
            );
        };
        keys.map(key => {
            const v = parentRuntimeValue[key];
            if (typeof v === "string") {
                if (v) {
                    pushErr(key);
                }
            } else if (!isUndefined(v)) {
                pushErr(key);
            }
        });
    }

    // props validators
    if (formProps && formProps.validators) {
        const validatorSchema = getByPath(runtimeSchema, "$vf_opt/validate") || {};
        const types = Object.keys(validatorSchema);
        types.map(type => {
            if (typeof formProps.validators[type] === "function") {
                errorsPush(
                    formProps.validators[type]({
                        value,
                        rootValue: rootRawReadonlyValue,
                        rootSchema: rootRuntimeSchema,
                        parentSchema: parentRuntimeSchema,
                        schema: runtimeSchema,
                        ruleName: type,
                        ruleValue: validatorSchema[type],
                        objectKey,
                        arrayIndex,
                    })
                );
            }
        });
    }

    if (
        ThemeCache.components[runtimeSchema.type] &&
        ThemeCache.components[runtimeSchema.type].errorObjGenerator &&
        errors.length
    ) {
        errorObj = ThemeCache.components[runtimeSchema.type].errorObjGenerator({ errors });
        rootRuntimeError[valuePath] = errorObj;
    }
};

export default handleValidator;
