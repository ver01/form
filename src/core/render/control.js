import { setCache, getDefault, getNodeValue } from "../../utils";
import { getItemSchema } from "../../schemaUtils";
import ContainerRender from "./container";
import BaseRender from "./base";
import dsMaker from "./dsMaker";

const ControlRender = (controlWidgetObj, widget, options, ThemeCache) => {
    const { widget: controlWidget, ...widgetObjOthers } = controlWidgetObj;
    const { rootControlCache } = options;
    const {
        runtimeValueNode,
        runtimeSchema,
        valuePath,
        rootRuntimeSchema,
        debug,
        debugObj,
        dataSource,
        handle,
        formUpdate,
        schemaList,
    } = options;

    const value = getNodeValue(runtimeValueNode);

    if (debug) {
        if (debugObj.inLoop) {
            debugObj.inLoop = false;
        } else {
            debugObj.path = `${debugObj.path}/Control`;
            console.log("%c%s %cValue:%o", "color:green", debugObj.path, "color:blue", value);
        }
    }

    if (schemaList) {
        handle.schemaSelect = index => {
            const int = typeof index === "string" ? parseInt(index, 10) : index;
            setCache(rootControlCache, "valuePath", valuePath, { activeSchemaIndex: int, activeSchemaForce: true });
            formUpdate("schemaSelect");
        };
    }

    if (controlWidget.mode === "editorHolder") {
        dataSource.children = [{}];
        switch (runtimeSchema.type) {
            case "object":
                ContainerRender(
                    widget,
                    {
                        ...options,
                        dataSource: dataSource.children[0],
                    },
                    ThemeCache
                );
                break;
            case "array": {
                Object.assign(handle, {
                    canAppend:
                        !(options.schemaOption.appendable === false) &&
                        (!Number.isInteger(runtimeSchema.maxItems) || runtimeSchema.maxItems > (value || []).length),
                    append: () => {
                        const ret = value || [];
                        ret.push(
                            getDefault({
                                runtimeSchema: getItemSchema(runtimeSchema, ret.length, rootRuntimeSchema),
                            })
                        );
                        handle.onChange(ret, { updatePath: options.valuePath, formUpdate: "append" });
                    },
                });
                ContainerRender(
                    widget,
                    {
                        ...options,
                        dataSource: dataSource.children[0],
                    },
                    ThemeCache
                );
                break;
            }
            default:
                BaseRender(widget, {
                    ...options,
                    dataSource: dataSource.children[0],
                });
                break;
        }
        dsMaker(
            dataSource,
            controlWidget,
            { ...options, ...widgetObjOthers },
            {
                holder: true,
                caller: "Control",
            }
        );
    } else {
        const loopLen = (controlWidget.children || []).length || 0;
        dataSource.children = [];
        for (let index = 0; index < loopLen; index++) {
            dataSource.children[index] = {};
            debug && (debugObj.inLoop = true);
            ControlRender(
                { widget: controlWidget.children[index], ...widgetObjOthers },
                widget,
                {
                    ...options,
                    dataSource: dataSource.children[index],
                },
                ThemeCache
            );
        }
        dsMaker(dataSource, controlWidget, { ...options, ...widgetObjOthers }, { caller: "Control" });
    }
};

export default ControlRender;
