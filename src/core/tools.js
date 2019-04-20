import { getByPath } from "../utils";
import { isArrayLikeObject, isPlainObject } from "../vendor/lodash";
import FormRender from "./render/formRender";

export const register = function(theme, cache) {
    Object.keys(theme).map(key => {
        cache[key] = theme[key];
    });
};

const optionMapping = (widget, option) => {
    // if (typeof widget.formatter === "function") {
    //     options.value = widget.formatter(options.value);
    // }
    // if (typeof widget.normalizer === "function") {
    //     options.handle.onChange = (val, opt) => rawOnchage(widget.normalizer(val), opt);
    // }
    const {
        handle: { onChange },
    } = option;
    return {
        handle: {
            onChange,
        },
    };
};

export const scmGetProps = (widget, options) => {
    const { runtimeSchema = {} } = options;
    const { props = {}, propsMixinList = [] } = widget;

    const nodeProps = { ...props };

    if (propsMixinList.length) {
        const tempProps = getByPath(runtimeSchema, "$vf_ext/props") || {};
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
                        pOut[matchs[1]] = pIn[key](optionMapping(widget, options));
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

    const widgetName = getByPath(runtimeSchema, "$vf_ext/widget");
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

    if (isArrayLikeObject(node.getWidget)) {
        let widgetName, widgetData;
        node.getWidget.some(fun => {
            if (typeof fun === "function") {
                const ret = fun({ runtimeSchema, parentRuntimeSchema });
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
};
