import { getByPath } from "../utils";
import { isArrayLikeObject, isPlainObject } from "../vendor/lodash";

export default {
    verify(coreOption, theme) {
        const {
            value,
            rootValue,
            rootSchema,
            parentSchema,
            parentValue,
            schema,
            objectKey,
            formProps,
            arrayIndex,
        } = coreOption;
        const errors = [];
        let errorObj = null;
        const valueType = typeof value;
        const { validators = {} } = theme;
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
        const parentType = parentSchema && parentSchema.type;

        const errorsPush = err => typeof err !== "undefined" && errors.push(err);

        // minLength check
        if (
            minLength &&
            Number.isInteger(schema.minLength) &&
            schema.type === "string" &&
            valueType === "string" &&
            value.length < schema.minLength
        ) {
            errorsPush(minLength({ value, ruleValue: schema.minLength, schema }));
        }

        // require check
        if (
            required &&
            parentType === "object" &&
            isArrayLikeObject(parentSchema.required) &&
            parentSchema.required.includes(objectKey)
        ) {
            switch (schema.type) {
                case "string": {
                    if (!value) {
                        errorsPush(required({ value, ruleValue: true, schema }));
                    }
                    break;
                }
                default:
                    if (typeof value === "undefined") {
                        errorsPush(required({ value, ruleValue: true, schema }));
                    }
                    break;
            }
        }

        // type check
        if (valueType !== "undefined") {
            switch (schema.type) {
                case "string": {
                    if (valueType !== "string") {
                        errorsPush(typeofValidate({ value, ruleValue: schema.type, schema }));
                    }
                    break;
                }
                case "number": {
                    if (valueType !== "number") {
                        errorsPush(typeofValidate({ value, ruleValue: schema.type, schema }));
                    }
                    break;
                }
                case "integer": {
                    if (valueType !== "number" || !Number.isInteger(value)) {
                        errorsPush(typeofValidate({ value, ruleValue: schema.type, schema }));
                    }
                    break;
                }
                case "boolean": {
                    if (valueType !== "boolean") {
                        errorsPush(typeofValidate({ value, ruleValue: schema.type, schema }));
                    }
                    break;
                }
                case "null": {
                    if (value !== null) {
                        errorsPush(typeofValidate({ value, ruleValue: schema.type, schema }));
                    }
                    break;
                }
                case "array": {
                    if (!isArrayLikeObject(value)) {
                        errorsPush(typeofValidate({ value, ruleValue: schema.type, schema }));
                    }
                    break;
                }
                case "object": {
                    if (!isPlainObject(value)) {
                        errorsPush(typeofValidate({ value, ruleValue: schema.type, schema }));
                    }
                    break;
                }
            }
        }

        // minItems check
        if (
            minItems &&
            Number.isInteger(schema.minItems) &&
            isArrayLikeObject(value) &&
            value.length < schema.minItems
        ) {
            errorsPush(minItems({ value, ruleValue: schema.minItems, schema }));
        }

        // maxItems check
        if (
            maxItems &&
            Number.isInteger(schema.maxItems) &&
            isArrayLikeObject(value) &&
            value.length > schema.maxItems
        ) {
            errorsPush(maxItems({ value, ruleValue: schema.maxItems, schema }));
        }

        // minimum check
        if (minimum && ["number", "integer"].includes(schema.type)) {
            const num = Number(schema.minimum);
            if (!Number.isNaN(num) && value < num) {
                errorsPush(minimum({ value, ruleValue: num, schema }));
            }
        }

        // maximum check
        if (maximum && ["number", "integer"].includes(schema.type)) {
            const num = Number(schema.maximum);
            if (!Number.isNaN(num) && value > num) {
                errorsPush(maximum({ value, ruleValue: num, schema }));
            }
        }

        // multipleOf check
        if (multipleOf && ["number", "integer"].includes(schema.type)) {
            const num = Number(schema.multipleOf);
            if (!Number.isNaN(num)) {
                if (value % num !== 0) {
                    errorsPush(multipleOf({ value, ruleValue: num, schema }));
                }
            }
        }

        // string format check
        if (format && schema.type === "string" && typeof schema.format !== "undefined") {
            switch (schema.format) {
                case "email":
                    {
                        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                        if (value && !re.test(String(value).toLowerCase())) {
                            errorsPush(format({ value, ruleValue: schema.format, schema }));
                        }
                    }
                    break;
                case "uri":
                    {
                        const re = /^[-a-zA-Z0-9@:%_+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_+.~#?&//=]*)?$/;
                        if (value && !re.test(String(value).toLowerCase())) {
                            errorsPush(format({ value, ruleValue: schema.format, schema }));
                        }
                    }
                    break;
                default:
                    break;
            }
        }

        // string pattern check
        if (pattern && schema.type === "string" && typeof schema.pattern !== "undefined") {
            const ret = new RegExp(schema.pattern);
            if (!ret.test(value)) {
                errorsPush(pattern({ value, ruleValue: schema.pattern, schema }));
            }
        }

        // uniqueItems check
        if (
            uniqueItems &&
            parentType === "array" &&
            (parentSchema && parentSchema.uniqueItems) === true &&
            isArrayLikeObject(parentValue) &&
            arrayIndex
        ) {
            const cmp = JSON.stringify(value);
            for (let i = 0; i < arrayIndex; i++) {
                if (cmp === JSON.stringify(parentValue[i])) {
                    errorsPush(uniqueItems({ value, ruleValue: i + 1, schema }));
                }
            }
        }
        // dependencies check
        if (
            dependencies &&
            parentType === "object" &&
            isPlainObject(parentSchema.dependencies) &&
            isPlainObject(parentValue) &&
            ((valueType === "string" && !value) || typeof value === "undefined")
        ) {
            const keys = Object.keys(parentSchema.dependencies).filter(
                it =>
                    isArrayLikeObject(parentSchema.dependencies[it]) &&
                    parentSchema.dependencies[it].includes(objectKey)
            );

            const pushErr = key => {
                let title;
                try {
                    title = parentSchema.properties[key].title || key;
                } catch (e) {
                    title = key;
                }
                errorsPush(
                    dependencies({
                        value,
                        ruleValue: title,
                        schema,
                    })
                );
            };
            keys.map(key => {
                const v = parentValue[key];
                if (typeof v === "string") {
                    if (v) {
                        pushErr(key);
                    }
                } else if (typeof v !== "undefined") {
                    pushErr(key);
                }
            });
        }

        // props validators
        if (formProps && formProps.validators) {
            const validatorSchema = getByPath(schema, "$vf_ext/validate") || {};
            const types = Object.keys(validatorSchema);
            types.map(type => {
                if (typeof formProps.validators[type] === "function") {
                    errorsPush(
                        formProps.validators[type]({
                            value,
                            rootValue,
                            rootSchema,
                            parentSchema,
                            schema,
                            ruleName: type,
                            ruleValue: validatorSchema[type],
                            objectKey,
                            arrayIndex,
                        })
                    );
                }
            });
        }

        if (theme.components[schema.type] && theme.components[schema.type].errorObjGenerator && errors.length) {
            errorObj = theme.components[schema.type].errorObjGenerator({ errors });
        }

        return errorObj;
    },
};
