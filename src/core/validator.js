import { getByPath } from "../utils";
import { isArrayLikeObject, isPlainObject, isUndefined } from "../vendor/lodash";

const handleValidator = (options, ThemeCache) => {
    const {
        runtimeValue,
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
        runtimeValue.length < runtimeSchema.minLength
    ) {
        errorsPush(minLength({ value: runtimeValue, ruleValue: runtimeSchema.minLength, schema: runtimeSchema }));
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
                if (!runtimeValue) {
                    errorsPush(required({ value: runtimeValue, ruleValue: true, schema: runtimeSchema }));
                }
                break;
            }
            default:
                if (isUndefined(runtimeValue)) {
                    errorsPush(required({ value: runtimeValue, ruleValue: true, schema: runtimeSchema }));
                }
                break;
        }
    }

    // type check
    if (!isUndefined(valueType)) {
        switch (runtimeSchema.type) {
            case "string": {
                if (valueType !== "string") {
                    errorsPush(
                        typeofValidate({ value: runtimeValue, ruleValue: runtimeSchema.type, schema: runtimeSchema })
                    );
                }
                break;
            }
            case "number": {
                if (valueType !== "number") {
                    errorsPush(
                        typeofValidate({ value: runtimeValue, ruleValue: runtimeSchema.type, schema: runtimeSchema })
                    );
                }
                break;
            }
            case "integer": {
                if (valueType !== "number" || !Number.isInteger(runtimeValue)) {
                    errorsPush(
                        typeofValidate({ value: runtimeValue, ruleValue: runtimeSchema.type, schema: runtimeSchema })
                    );
                }
                break;
            }
            case "boolean": {
                if (valueType !== "boolean") {
                    errorsPush(
                        typeofValidate({ value: runtimeValue, ruleValue: runtimeSchema.type, schema: runtimeSchema })
                    );
                }
                break;
            }
            case "null": {
                if (runtimeValue !== null) {
                    errorsPush(
                        typeofValidate({ value: runtimeValue, ruleValue: runtimeSchema.type, schema: runtimeSchema })
                    );
                }
                break;
            }
            case "array": {
                if (!isArrayLikeObject(runtimeValue)) {
                    errorsPush(
                        typeofValidate({ value: runtimeValue, ruleValue: runtimeSchema.type, schema: runtimeSchema })
                    );
                }
                break;
            }
            case "object": {
                if (!isPlainObject(runtimeValue)) {
                    errorsPush(
                        typeofValidate({ value: runtimeValue, ruleValue: runtimeSchema.type, schema: runtimeSchema })
                    );
                }
                break;
            }
        }
    }

    // minItems check
    if (
        minItems &&
        Number.isInteger(runtimeSchema.minItems) &&
        isArrayLikeObject(runtimeValue) &&
        runtimeValue.length < runtimeSchema.minItems
    ) {
        errorsPush(minItems({ value: runtimeValue, ruleValue: runtimeSchema.minItems, schema: runtimeSchema }));
    }

    // maxItems check
    if (
        maxItems &&
        Number.isInteger(runtimeSchema.maxItems) &&
        isArrayLikeObject(runtimeValue) &&
        runtimeValue.length > runtimeSchema.maxItems
    ) {
        errorsPush(maxItems({ value: runtimeValue, ruleValue: runtimeSchema.maxItems, schema: runtimeSchema }));
    }

    // minimum check
    if (minimum && ["number", "integer"].includes(runtimeSchema.type)) {
        const num = Number(runtimeSchema.minimum);
        if (!Number.isNaN(num) && runtimeValue < num) {
            errorsPush(minimum({ value: runtimeValue, ruleValue: num, schema: runtimeSchema }));
        }
    }

    // maximum check
    if (maximum && ["number", "integer"].includes(runtimeSchema.type)) {
        const num = Number(runtimeSchema.maximum);
        if (!Number.isNaN(num) && runtimeValue > num) {
            errorsPush(maximum({ value: runtimeValue, ruleValue: num, schema: runtimeSchema }));
        }
    }

    // multipleOf check
    if (multipleOf && ["number", "integer"].includes(runtimeSchema.type)) {
        const num = Number(runtimeSchema.multipleOf);
        if (!Number.isNaN(num)) {
            if (runtimeValue % num !== 0) {
                errorsPush(multipleOf({ value: runtimeValue, ruleValue: num, schema: runtimeSchema }));
            }
        }
    }

    // string format check
    if (format && runtimeSchema.type === "string" && !isUndefined(runtimeSchema.format)) {
        switch (runtimeSchema.format) {
            case "email":
                {
                    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                    if (runtimeValue && !re.test(String(runtimeValue).toLowerCase())) {
                        errorsPush(
                            format({ value: runtimeValue, ruleValue: runtimeSchema.format, schema: runtimeSchema })
                        );
                    }
                }
                break;
            case "uri":
                {
                    const re = /^[-a-zA-Z0-9@:%_+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_+.~#?&//=]*)?$/;
                    if (runtimeValue && !re.test(String(runtimeValue).toLowerCase())) {
                        errorsPush(
                            format({ value: runtimeValue, ruleValue: runtimeSchema.format, schema: runtimeSchema })
                        );
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
        if (!ret.test(runtimeValue)) {
            errorsPush(pattern({ value: runtimeValue, ruleValue: runtimeSchema.pattern, schema: runtimeSchema }));
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
        const cmp = JSON.stringify(runtimeValue);
        for (let i = 0; i < arrayIndex; i++) {
            if (cmp === JSON.stringify(parentRuntimeValue[i])) {
                errorsPush(uniqueItems({ value: runtimeValue, ruleValue: i + 1, schema: runtimeSchema }));
            }
        }
    }
    // dependencies check
    if (
        dependencies &&
        parentType === "object" &&
        isPlainObject(parentRuntimeSchema.dependencies) &&
        isPlainObject(parentRuntimeValue) &&
        ((valueType === "string" && !runtimeValue) || isUndefined(runtimeValue))
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
                    value: runtimeValue,
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
        const validatorSchema = getByPath(parentRuntimeSchema, "$vf_ext/validate") || {};
        const types = Object.keys(validatorSchema);
        types.map(type => {
            if (typeof formProps.validators[type] === "function") {
                errorsPush(
                    formProps.validators[type]({
                        value: runtimeValue,
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
