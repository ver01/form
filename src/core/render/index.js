import { handleRef, getByPath, simplifySchema } from "../../utils";
import { getWidget } from "../tools";
import { deepClone, isArrayLikeObject, isPlainObject } from "../../vendor/lodash";
import { dealSomeOf, dealInitValue, dealDependencies } from "./logicMods";

import Validator from "../validator";

import RootRender from "./root";
import ControlRender from "./control";

const ThemeCache = { components: {}, validators: {}, registerWidgets: {} };

const FormRender = function(options) {
    // **** init isRoot, valuePath, control
    const { isRoot, valuePath, underControl, changeTree, cache, cacheUpdate, cacheRemove, debug, runtime } = options;
    if (debug) {
        debug.path = `${debug.path}/Form`;
        console.log(
            "%c%s %cChange:%o %cValue:%o",
            "color:green",
            debug.path,
            "color:blue",
            changeTree,
            "color:blue",
            options.value
        );
    }

    // **** init rootSchema
    if (isRoot) {
        // when root fork schema & value
        if (options.schema === null || typeof options.schema === "undefined") {
            return null;
        }
        options.rootSchema = deepClone(options.schema);
    }
    const { rootSchema } = options;

    // * will overwrite options.schema
    handleRef(options.schema, rootSchema);

    // **** init schema, schemaList, value
    // params init
    let schema = options.schema;
    let schemaList = null;
    let isRawSchema = true;
    if (!isRoot) {
        let ret = null;
        let isSchemaChange = true;
        const getLocalSchema = scm => {
            if (isRawSchema) {
                isRawSchema = false;
                return deepClone(scm);
            } else {
                return scm;
            }
        };

        while (isSchemaChange) {
            // someOf part
            if (isRawSchema || isSchemaChange) {
                isSchemaChange = false;

                if (isArrayLikeObject(schema.oneOf)) {
                    schema = getLocalSchema(schema);
                    isSchemaChange = true;
                    ret = dealSomeOf(
                        schema,
                        schema.oneOf,
                        null,
                        cache,
                        valuePath,
                        options.value,
                        rootSchema,
                        cacheUpdate
                    );
                } else if (isArrayLikeObject(schema.anyOf)) {
                    schema = getLocalSchema(schema);
                    isSchemaChange = true;
                    ret = dealSomeOf(
                        schema,
                        schema.anyOf,
                        null,
                        cache,
                        valuePath,
                        options.value,
                        rootSchema,
                        cacheUpdate
                    );
                } else if (isArrayLikeObject(schema.allOf)) {
                    schema = getLocalSchema(schema);
                    isSchemaChange = true;
                    ret = dealSomeOf(
                        schema,
                        null,
                        schema.allOf,
                        cache,
                        valuePath,
                        options.value,
                        rootSchema,
                        cacheUpdate
                    );
                }
                if (isSchemaChange) {
                    schema = ret.schema;
                    schemaList = ret.schemaList;
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
                    schema = getLocalSchema(schema);
                    isSchemaChange = true;
                    ret = dealDependencies(schema, options.value);
                }

                if (isSchemaChange) {
                    schema = ret.schema;

                    // **** simplify schema & update value;
                    simplifySchema(schema);
                    dealInitValue(options, schema);
                }
            }
        }
    }

    // schema no change need update value
    if (isRawSchema) {
        simplifySchema(schema);
        dealInitValue(options, schema);
    }

    const rootValue = isRoot ? options.value : options.rootValue;

    // **** init parentSchema, childEditor, widget, widgetName, widgetData
    const { parentSchema, childEditor } = options;
    const { widget, widgetName, widgetData } = getWidget(
        isRoot ? ThemeCache.components.root : ThemeCache.components[schema.type],
        ThemeCache,
        schema,
        parentSchema,
        childEditor
    );
    delete options.childEditor; // delete after using

    // **** init objectKey, arrayIndex, parentValue, globalKey, formProps, handle
    const { objectKey = null, arrayIndex = null, parentValue, globalKey, formProps, formOption } = options;
    options.handle = {
        ...(options.handle || {}),
        onChange: (isRoot ? options.onChange : options.handle.onChange) || (() => {}),
    };
    const { handle } = options;

    // **** init onChange
    const { onChange: rawOnchage } = handle;

    // **** init type
    const { type } = schema;

    // validator before transform
    const errorObj =
        options.errorObj ||
        Validator.verify(
            {
                value: options.value,
                rootValue,
                rootSchema,
                parentSchema,
                parentValue,
                schema,
                objectKey,
                formProps,
                arrayIndex,
            },
            ThemeCache
        );

    // value transform
    if (typeof widget.formatter === "function") {
        options.value = widget.formatter(options.value);
    }
    if (typeof widget.normalizer === "function") {
        options.handle.onChange = val => rawOnchage(widget.normalizer(val));
    }

    // **** init value, extOption
    const { value } = options;
    const { onChange } = handle;
    const extOption = getByPath(schema, "$vf_ext/option") || {};

    // ------------------------
    // |    isRoot, schema, rootSchema, value, parentSchema, childEditor, widget, widgetName, widgetData
    // |    objectKey, arrayIndex, parentValue, globalKey, formProps, rootValue, type, errorObj, value, onChange
    // |    option
    // ------------------------

    const coreOpt = {
        underControl,
        isRoot,
        valuePath,
        schema,
        value,
        arrayIndex,
        objectKey,
        isArray: type === "array",
        isObject: type === "object",
        handle: {
            onChange,
        },
        parentSchema,
        schemaList,
        parentValue,
        rootSchema,
        rootValue,
        errorObj,
        widget,
        widgetName,
        widgetData,
        globalKey,
        formProps,
        formOption,
        extOption,
        changeTree,
        runtime,
        cache,
        cacheUpdate,
        cacheRemove,
        debug,
    };

    // ------------------------
    // |    start render
    // ------------------------

    // root
    if (isRoot) {
        return RootRender(widget, { ...coreOpt, isRoot: false }, FormRender);
    }

    const { widget: controlWidget } = getWidget(ThemeCache.components.control);
    return ControlRender(controlWidget, widget, coreOpt, FormRender);
};

FormRender.ThemeCache = ThemeCache;

export default FormRender;
