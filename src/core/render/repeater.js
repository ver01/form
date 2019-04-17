import { isArrayLikeObject, isPlainObject, deepClone } from "../../vendor/lodash";
import { getEditor } from "../tools";
import { getItemSchema, getByPath, getCache } from "../../utils";
import { leafs } from "./base";
import Validator from "../validator";

const itemRender = (widget, coreOpt, formRender) => {
    const { globalKey } = coreOpt;

    if (widget.mode === "editorHolder") {
        const { onChange } = coreOpt.handle; // remove other handler
        const child = formRender({ ...coreOpt, handle: { onChange } });
        return leafs(widget, coreOpt, child, globalKey, { holder: true });
    }

    let localKey = globalKey;
    let nodeChildren = [];
    const loopLen = (widget.children || []).length || 0;
    for (let index = 0; index < loopLen; index++) {
        const child = widget.children[index];
        const subNodes = itemRender(child, { ...coreOpt, globalKey: localKey }, formRender);
        if (isArrayLikeObject(subNodes)) {
            localKey += subNodes.length;
            nodeChildren = nodeChildren.concat(subNodes);
        } else {
            localKey++;
            nodeChildren.push(subNodes);
        }
    }

    return leafs(widget, coreOpt, nodeChildren, globalKey);
};

const arrayReapeater = (widget, coreOpt, editors, formRender) => {
    const {
        underControl,
        schema,
        globalKey,
        value,
        rootSchema,
        rootValue,
        updatePath,
        formProps,
        valuePath,
        changeTree = {},
        runtime,
        cache,
        cacheUpdate,
        cacheRemove,
        debug,
    } = coreOpt;
    const { ThemeCache } = formRender;
    if (debug) {
        debug.path = `${debug.path}/Array`;
        console.log(
            "%c%s %cChange:%o %cValue:%o",
            "color:green",
            debug.path,
            "color:blue",
            changeTree,
            "color:blue",
            value
        );
    }

    let children = [];
    let localKey = globalKey;

    if (isArrayLikeObject(value)) {
        const schemaItemsLen = isArrayLikeObject(schema.items) ? schema.items.length : 0;
        const arrayLength = value.length;
        const extOption = {
            orderable: true,
            addable: true,
            removable: true,
            ...(getByPath(schema, "$vf_ext/option") || {}),
        };

        const changeTreeChildrenLen = isArrayLikeObject(changeTree.children) ? changeTree.children.length : 0;
        for (let arrayIndex = 0; arrayIndex < arrayLength; arrayIndex++) {
            const subValue = value[arrayIndex];
            const arrayIndexNext = arrayIndex + 1;
            const arrayIndexPrev = arrayIndex - 1;
            const itemSchema = getItemSchema(schema, arrayIndex, rootSchema);
            const { type: itemType } = itemSchema;
            const newValuePath = `${valuePath}/${arrayIndex}`;
            const node = itemRender(
                widget,
                {
                    ...coreOpt,
                    changeTree: arrayIndex < changeTreeChildrenLen ? changeTree.children[arrayIndex] : {},
                    value: subValue,
                    isArray: itemType === "array",
                    isObject: itemType === "object",
                    schema: deepClone(itemSchema),
                    parentSchema: schema,
                    parentValue: value,
                    objectKey: null,
                    arrayIndex,
                    valuePath: newValuePath,
                    forceUpdate: updatePath && newValuePath.startsWith(updatePath),
                    globalKey: localKey,
                    handle: {
                        canMoveUp: extOption.orderable && arrayIndex > schemaItemsLen && arrayIndex !== 0,
                        canMoveDown:
                            extOption.orderable && arrayIndexNext > schemaItemsLen && arrayIndexNext !== arrayLength,
                        canRemove:
                            extOption.removable &&
                            arrayIndexNext > schemaItemsLen &&
                            (!Number.isInteger(schema.minItems) || schema.minItems < arrayLength),
                        canAppend:
                            extOption.appendable &&
                            (!Number.isInteger(schema.maxItems) || schema.maxItems > arrayLength),
                        onChange: (val, opt) => {
                            const data = underControl ? deepClone(value) : value;
                            data[arrayIndex] = val;
                            coreOpt.handle.onChange(data, opt);
                        },
                        moveUp: () => {
                            const data = underControl ? deepClone(value) : value;
                            if (arrayIndex === 0) {
                                return;
                            }

                            // schema
                            const a = getCache(cache, "valuePath", `${valuePath}/${arrayIndex}`);
                            const b = getCache(cache, "valuePath", `${valuePath}/${arrayIndexPrev}`);
                            if (a) {
                                cacheRemove("valuePath", `${valuePath}/${arrayIndexPrev}`);
                                cacheUpdate("valuePath", `${valuePath}/${arrayIndexPrev}`, deepClone(a));
                            }
                            if (b) {
                                cacheRemove("valuePath", `${valuePath}/${arrayIndex}`);
                                cacheUpdate("valuePath", `${valuePath}/${arrayIndex}`, deepClone(b));
                            }

                            // value
                            const temp = data[arrayIndex];
                            data[arrayIndex] = data[arrayIndexPrev];
                            data[arrayIndexPrev] = temp;
                            coreOpt.handle.onChange(data, { updatePath: coreOpt.valuePath });
                        },
                        moveDown: () => {
                            const data = underControl ? deepClone(value) : value;
                            if (arrayIndex === data.length - 1) {
                                return;
                            }

                            // schema
                            const a = getCache(cache, "valuePath", `${valuePath}/${arrayIndex}`);
                            const b = getCache(cache, "valuePath", `${valuePath}/${arrayIndexNext}`);
                            if (a) {
                                cacheRemove("valuePath", `${valuePath}/${arrayIndexNext}`);
                                cacheUpdate("valuePath", `${valuePath}/${arrayIndexNext}`, deepClone(a));
                            }
                            if (b) {
                                cacheRemove("valuePath", `${valuePath}/${arrayIndex}`);
                                cacheUpdate("valuePath", `${valuePath}/${arrayIndex}`, deepClone(b));
                            }

                            // value
                            const temp = data[arrayIndex];
                            data[arrayIndex] = data[arrayIndexNext];
                            data[arrayIndexNext] = temp;
                            coreOpt.handle.onChange(data, { updatePath: coreOpt.valuePath });
                        },
                        remove: () => {
                            // schema
                            for (let i = arrayIndex + 1; i < len; i++) {
                                const obj = getCache(cache, "valuePath", `${valuePath}/${i}`);
                                cacheRemove("valuePath", `${valuePath}/${i - 1}`);
                                if (obj) {
                                    cacheUpdate("valuePath", `${valuePath}/${i - 1}`, obj);
                                }
                            }
                            // value
                            const data = underControl ? deepClone(value) : value;
                            data.splice(arrayIndex, 1);
                            const len = value.length;
                            coreOpt.handle.onChange(data, { updatePath: coreOpt.valuePath });
                        },
                    },
                    errorObj: Validator.verify(
                        {
                            value: subValue,
                            rootValue,
                            rootSchema,
                            parentSchema: schema,
                            schema: itemSchema,
                            objectKey: null,
                            formProps,
                            arrayIndex,
                            parentValue: value,
                        },
                        ThemeCache
                    ),
                    extOption,
                    // using for custom array child widgetShcema
                    childEditor: getEditor(editors, arrayIndex),
                    runtime: {
                        ...runtime,
                        valueParent: runtime.valueParent[runtime.valueKey],
                        valueKey: arrayIndex,
                    },
                    debug: debug ? { path: `${debug.path}[${arrayIndex}]` } : null,
                },
                formRender
            );
            if (isArrayLikeObject(node)) {
                localKey += node.length;
                children = children.concat(node);
            } else {
                localKey++;
                children.push(node);
            }
        }
    }

    return children;
};

const objectReapeater = (widget, coreOpt, editors, formRender) => {
    const {
        underControl,
        schema,
        globalKey,
        value,
        extOption,
        rootValue,
        formProps,
        updatePath,
        rootSchema,
        valuePath,
        changeTree = {},
        runtime,
        debug,
    } = coreOpt;
    const { ThemeCache } = formRender;
    const { properties = {} } = schema;
    if (debug) {
        debug.path = `${debug.path}/Object`;
        console.log(
            "%c%s %cChange:%o %cValue:%o",
            "color:green",
            debug.path,
            "color:blue",
            changeTree,
            "color:blue",
            coreOpt.value
        );
    }

    let keys = Object.keys(properties);
    const { order = [] } = extOption;
    if (order.length) {
        let after = order.splice(order.indexOf("*"));
        after = after.splice(1);
        keys.sort((a, b) => {
            let Ai = order.indexOf(a);
            if (Ai < 0) {
                Ai = after.indexOf(a);
                Ai = Ai < 0 ? 0 : -1 - Ai;
            } else {
                Ai = order.length - Ai;
            }
            let Bi = order.indexOf(b);
            if (Bi < 0) {
                Bi = after.indexOf(b);
                Bi = Bi < 0 ? 0 : -1 - Bi;
            } else {
                Bi = order.length - Bi;
            }
            return Bi - Ai;
        });
    }

    let localKey = globalKey;
    let children = [];
    const changeTreeChildren = isPlainObject(changeTree.children) ? changeTree.children : {};
    for (let index = 0; index < keys.length; index++) {
        const objectKey = keys[index];
        const subSchema = properties[objectKey];
        const subValue = (value || {})[objectKey];
        const newValuePath = `${valuePath}/${objectKey}`;
        const node = itemRender(
            widget,
            {
                ...coreOpt,
                changeTree: changeTreeChildren[objectKey],
                value: subValue,
                schema: subSchema,
                handle: {
                    onChange: (val, opt) => {
                        const data = underControl ? deepClone(value) : value;
                        coreOpt.handle.onChange(Object.assign(data, { [objectKey]: val }), opt);
                    },
                },
                objectKey,
                arrayIndex: null,
                parentSchema: schema,
                parentValue: value,
                valuePath: newValuePath,
                forceUpdate: updatePath && newValuePath.startsWith(updatePath),
                globalKey: localKey,
                errorObj: Validator.verify(
                    {
                        value: subValue,
                        rootValue,
                        rootSchema,
                        parentSchema: schema,
                        schema: subSchema,
                        objectKey,
                        formProps,
                        arrayIndex: null,
                        parentValue: value,
                    },
                    ThemeCache
                ),
                // using for custom object child widgetShcema
                childEditor: getEditor(editors, objectKey),
                runtime: {
                    ...runtime,
                    valueParent: runtime.valueParent[runtime.valueKey],
                    valueKey: objectKey,
                },
                debug: debug ? { path: `${debug.path}[${objectKey}]` } : null,
            },
            formRender
        );
        if (isArrayLikeObject(node)) {
            localKey += node.length;
            children = children.concat(node);
        } else {
            localKey++;
            children.push(node);
        }
    }

    return children;
};

const RepeaterRender = (widget, coreOpt, formRender) => {
    const { isArray, isObject } = coreOpt;
    const { editor = null, repeater = {} } = widget;
    if (isArray) {
        return arrayReapeater(repeater, coreOpt, editor, formRender);
    }
    if (isObject) {
        return objectReapeater(repeater, coreOpt, editor, formRender);
    }
    return [];
};

export default RepeaterRender;
