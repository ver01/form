import { getByPath, getNodeValue, setNodeValue } from "../utils";
import { isArrayLikeObject, isPlainObject } from "../vendor/lodash";
import FormRender from "./render/formRender";
import nativeTheme from "@ver01/form-theme-native";

export const register = function(theme, cache) {
    // 清空cache
    Object.keys(cache).map(key => {
        delete cache[key];
    });

    Object.assign(cache, { components: {}, validators: {}, registerWidgets: {} }, nativeTheme, theme);
};

const optionMapping = options => {
    const {
        rootRuntimeSchema,
        rootRuntimeValue,
        rootRuntimeError,
        formProps,
        formOption,
        schemaOption,
        runtimeSchema,
        runtimeValueNode,
        parentRuntimeSchema,
        parentRuntimeValue,
        objectKey,
        arrayIndex,
        formatter,
        normalizer,
        debug,
        handle: { canAppend, canMoveUp, canMoveDown, canRemove, append, moveUp, moveDown, remove, schemaSelect },
        valuePath,
        widgetData,
        widgetName,
        schemaList,
        childFormRenderOptions,
    } = options;

    let hasSchemaControl = childFormRenderOptions && childFormRenderOptions.schemaList ? true : false;

    let {
        handle: { onChange },
    } = options;

    let value = getNodeValue(runtimeValueNode);
    if (typeof formatter === "function") {
        value = formatter(value);
    }
    if (typeof normalizer === "function") {
        const rawOnchage = onChange;
        onChange = val => rawOnchage(normalizer(val));
    }

    const { errorObj = null } = rootRuntimeError[valuePath] || {};

    return {
        rootSchema: rootRuntimeSchema,
        rootValue: rootRuntimeValue,
        rootError: rootRuntimeError,
        errorObj,
        formProps,
        formOption,
        schemaOption,
        schema: runtimeSchema,
        value,
        parentSchema: parentRuntimeSchema,
        parentValue: parentRuntimeValue,
        handle: {
            hasSchemaControl,
            schemaSelect,
            onChange,
            canAppend,
            canMoveUp,
            canMoveDown,
            canRemove,
            append,
            moveUp,
            moveDown,
            remove,
        },
        objectKey,
        arrayIndex,
        widgetData,
        widgetName,
        schemaList,
        debug,
    };
};

export const scmGetProps = (widget, options) => {
    const { runtimeSchema = {} } = options;
    const { props = {}, propsMixinList = [] } = widget;

    const nodeProps = { ...props };

    if (propsMixinList.length) {
        const tempProps = getByPath(runtimeSchema, "$vf_opt/props") || {};
        Object.keys(tempProps)
            .filter(it => propsMixinList.includes(it))
            .map(key => (nodeProps[key] = tempProps[key]));
    }
    const getProps = pIn => {
        if (isPlainObject(pIn)) {
            const pOut = {};
            Object.keys(pIn).map(key => {
                // reserved prefix '$vf' in (Theme Props Section)
                const matchs = key.match(/^\$vf_(.*)$/);
                if (matchs && matchs[1]) {
                    // when match switch function only
                    if (typeof pIn[key] === "function") {
                        pOut[matchs[1]] = pIn[key](optionMapping(options));
                    } else {
                        pOut[matchs[1]] = pIn[key];
                    }
                } else {
                    pOut[key] = getProps(pIn[key]);
                }
            });
            return pOut;
        } else if (isArrayLikeObject(pIn)) {
            const pOut = [];
            pIn.map((it, ind) => {
                pOut[ind] = getProps(it);
            });
            return pOut;
        }
        return pIn;
    };

    return getProps(nodeProps);
};

export const scmGetPropsMaker = (widget, options) => {
    const {
        runtimeValueNode,
        handle: { onChange: rawOnChange },
    } = options;
    return (value, onChange) => {
        setNodeValue(runtimeValueNode, value);
        options.handle.onChange = (val, opt) => {
            onChange(val, opt);
            rawOnChange(val, opt);
        };
        return scmGetProps(widget, options);
    };
};

export const getEditor = (editors, key) => {
    if (!editors) {
        return;
    }

    if (isArrayLikeObject(editors)) {
        const editor =
            editors.find(it => it.editorFor === key) || editors.find(it => typeof it.editorFor === "undefined");
        if (!editor) {
            return;
        }
        return { widget: editor, widgetName: "customEditor", widgetData: null };
    }

    return { widget: editors, widgetName: "customEditor", widgetData: null };
};

export const getWidget = function(node, runtimeSchema, parentRuntimeSchema, widgetForChild) {
    const { ThemeCache } = FormRender;

    const widgetName = getByPath(runtimeSchema, "$vf_opt/widget");
    let widget = widgetName && node.widgets[widgetName];

    if (widget) {
        return { widget, widgetName, widgetData: null };
    }

    widget = widgetName && ThemeCache.registerWidgets[widgetName];
    if (widget) {
        return { widget, widgetName, widgetData: null };
    }

    if (widgetForChild) {
        return widgetForChild;
    }

    if (node) {
        if (isArrayLikeObject(node.getWidget)) {
            let widgetName, widgetData;
            node.getWidget.some(fun => {
                if (typeof fun === "function") {
                    // call custom function need map
                    const ret = fun({ schema: runtimeSchema, parentSchema: parentRuntimeSchema });
                    if (ret) {
                        widgetName = ret.widgetName;
                        widgetData = ret.widgetData;
                        return true;
                    }
                }
            });
            if (widgetName && (widget = node.widgets[widgetName])) {
                return { widget, widgetName, widgetData };
            }
        }
        return { widget: node.widgets.default, widgetName: "default", widgetData: null };
    } else {
        return { widget: { component: null } };
    }
};
