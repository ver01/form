import { getByPath } from "../utils";
import { isArrayLikeObject, isPlainObject } from "../vendor/lodash";

export const register = function(theme, cache) {
    Object.keys(theme).map(key => {
        cache[key] = theme[key];
    });
};

export const scmGetProps = (widget, coreOpt) => {
    const { schema = {} } = coreOpt;
    const { props = {}, propsMixinList = [] } = widget;

    const nodeProps = { ...props };

    if (propsMixinList.length) {
        const tempProps = getByPath(schema, "$vf_ext/props") || {};
        Object.keys(tempProps)
            .filter(it => propsMixinList.includes(it))
            .map(key => (nodeProps[key] = tempProps[key]));
    }
    return ({ value, onChange: leafOnChange }) => {
        const getProps = pIn => {
            if (isPlainObject(pIn)) {
                const pOut = {};
                Object.keys(pIn).map(key => {
                    // reserved prefix '$vf' in (Theme Props Section)
                    const matchs = key.match(/^\$vf_(.*)$/);
                    if (matchs && matchs[1]) {
                        // when match switch function only
                        if (typeof pIn[key] === "function") {
                            pOut[matchs[1]] = pIn[key]({
                                ...coreOpt,
                                handle: {
                                    ...coreOpt.handle,
                                    onChange: value => {
                                        leafOnChange(value);
                                    },
                                },
                                value,
                            });
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

export const getWidget = function(node, cache, schema, parentSchema, widgetForChild) {
    const widgetName = getByPath(schema, "$vf_ext/widget");
    let widget = widgetName && node.widgets[widgetName];

    if (widget) {
        return { widget, widgetName, widgetData: null };
    }

    widget = widgetName && cache.registerWidgets[widgetName];
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
                const ret = fun({ schema, parentSchema });
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
