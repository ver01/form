import { isArrayLikeObject } from "../../vendor/lodash";
import { getEditor } from "../tools";
import { getItemSchema, getByPath, getCache, setCache, deleteCache, getNodeValue } from "../../utils";
import handleValidator from "../validator";
import ItemRender from "./item";

const ArrayReapeaterRender = (widget, options, editors, ThemeCache) => {
    const {
        runtimeSchema,
        domIndex,
        runtimeValueNode,
        rootRuntimeSchema,
        rootControlCache,
        valuePath,
        dataSource,
        runtime,
        debugObj,
        debug,
    } = options;

    const value = getNodeValue(runtimeValueNode);
    if (!isArrayLikeObject(value)) {
        return;
    }

    if (debug) {
        debugObj.path = `${debugObj.path}/Array`;
        console.log("%c%s %cValue:%o", "color:green", debugObj.path, "color:blue", runtimeValueNode);
    }

    dataSource.children = [];
    let localIndex = domIndex;

    const schemaItemsLen = isArrayLikeObject(runtimeSchema.items) ? runtimeSchema.items.length : 0;
    const arrayLength = value.length;
    const schemaOption = {
        orderable: true,
        addable: true,
        removable: true,
        ...(getByPath(runtimeSchema, "$vf_ext/option") || {}),
    };

    for (let arrayIndex = 0; arrayIndex < arrayLength; arrayIndex++) {
        const subValue = value[arrayIndex];
        const arrayIndexNext = arrayIndex + 1;
        const arrayIndexPrev = arrayIndex - 1;
        const itemSchema = getItemSchema(runtimeSchema, arrayIndex, rootRuntimeSchema);
        const { type: itemType } = itemSchema;
        handleValidator(
            {
                ...options,
                runtimeValue: subValue,
                parentRuntimeSchema: runtimeSchema,
                parentRuntimeValue: value,
                runtimeSchema: itemSchema,
                valuePath: `${valuePath}/${arrayIndex}`,
                objectKey: null,
                arrayIndex,
            },
            ThemeCache
        );
        ItemRender(widget, {
            ...options,
            runtimeValueNode: { node: value, key: arrayIndex },
            isArray: itemType === "array",
            isObject: itemType === "object",
            runtimeSchema: itemSchema,
            parentRuntimeSchema: runtimeSchema,
            parentRuntimeValue: value,
            objectKey: null,
            arrayIndex,
            valuePath: `${valuePath}/${arrayIndex}`,
            domIndex: localIndex,
            handle: {
                canMoveUp: schemaOption.orderable && arrayIndex > schemaItemsLen && arrayIndex !== 0,
                canMoveDown:
                    schemaOption.orderable && arrayIndexNext > schemaItemsLen && arrayIndexNext !== arrayLength,
                canRemove:
                    schemaOption.removable &&
                    arrayIndexNext > schemaItemsLen &&
                    (!Number.isInteger(runtimeSchema.minItems) || runtimeSchema.minItems < arrayLength),
                canAppend:
                    schemaOption.appendable &&
                    (!Number.isInteger(runtimeSchema.maxItems) || runtimeSchema.maxItems > arrayLength),
                onChange: (val, opt) => {
                    value[arrayIndex] = val;
                    options.handle.onChange(value, opt);
                },
                moveUp: () => {
                    if (arrayIndex === 0) {
                        return;
                    }

                    // schema
                    const a = getCache(rootControlCache, "valuePath", `${valuePath}/${arrayIndex}`);
                    const b = getCache(rootControlCache, "valuePath", `${valuePath}/${arrayIndexPrev}`);
                    if (a) {
                        deleteCache(rootControlCache, "valuePath", `${valuePath}/${arrayIndexPrev}`);
                        setCache(rootControlCache, "valuePath", `${valuePath}/${arrayIndexPrev}`, a);
                    }
                    if (b) {
                        deleteCache(rootControlCache, "valuePath", `${valuePath}/${arrayIndex}`);
                        setCache(rootControlCache, "valuePath", `${valuePath}/${arrayIndex}`, b);
                    }

                    // value
                    const temp = value[arrayIndex];
                    value[arrayIndex] = value[arrayIndexPrev];
                    value[arrayIndexPrev] = temp;
                    options.handle.onChange(value);
                },
                moveDown: () => {
                    if (arrayIndex === value.length - 1) {
                        return;
                    }

                    // schema
                    const a = getCache(rootControlCache, "valuePath", `${valuePath}/${arrayIndex}`);
                    const b = getCache(rootControlCache, "valuePath", `${valuePath}/${arrayIndexNext}`);
                    if (a) {
                        deleteCache(rootControlCache, "valuePath", `${valuePath}/${arrayIndexNext}`);
                        setCache(rootControlCache, "valuePath", `${valuePath}/${arrayIndexNext}`, a);
                    }
                    if (b) {
                        deleteCache(rootControlCache, "valuePath", `${valuePath}/${arrayIndex}`);
                        setCache(rootControlCache, "valuePath", `${valuePath}/${arrayIndex}`, b);
                    }

                    // value
                    const temp = value[arrayIndex];
                    value[arrayIndex] = value[arrayIndexNext];
                    value[arrayIndexNext] = temp;
                    options.handle.onChange(value);
                },
                remove: () => {
                    // schema
                    for (let i = arrayIndex + 1; i < value.length; i++) {
                        const obj = getCache(rootControlCache, "valuePath", `${valuePath}/${i}`);
                        deleteCache(rootControlCache, "valuePath", `${valuePath}/${i - 1}`);
                        if (obj) {
                            setCache(rootControlCache, "valuePath", `${valuePath}/${i - 1}`, obj);
                        }
                    }
                    // value
                    value.splice(arrayIndex, 1);
                    options.handle.onChange(value);
                },
            },
            schemaOption,
            // using for custom array child widgetShcema
            childEditor: getEditor(editors, arrayIndex),
            runtime: {
                ...runtime,
                valueParent: runtime.valueParent[runtime.valueKey],
                valueKey: arrayIndex,
            },
            debug: debug ? { path: `${debugObj.path}[${arrayIndex}]` } : null,
        });
    }
};

export default ArrayReapeaterRender;
