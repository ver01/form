import { setCache, getDefault, getNodeValue } from "../../utils";
import { getItemSchema } from "../../schemaUtils";
import ContainerRender from "./container";
import BaseRender from "./base";
import dsMaker from "./dsMaker";

const ControlRender = (controlWidget, widget, options) => {
    const { rootControlCache } = options;
    const {
        runtimeValueNode,
        runtimeSchema,
        valuePath,
        rootRuntimeSchema,
        debug,
        debugObj,
        dataSource,
        domIndex,
        handle,
        formUpdate,
    } = options;

    const value = getNodeValue(runtimeValueNode);

    if (debug) {
        if (debugObj.inLoop) {
            debugObj.inLoop = false;
        } else {
            debugObj.path = `${debugObj.path}/Control`;
            console.log("%c%s %cValue:%o", "color:green", debugObj.path, "color:blue", runtimeValueNode);
        }
    }

    const schemaSelect = index => {
        const int = typeof index === "string" ? parseInt(index, 10) : index;
        setCache(rootControlCache, "valuePath", valuePath, { activeSchemaIndex: int, activeSchemaForce: true });
        formUpdate("schemaSelect");
    };
    options.handle.schemaSelect = schemaSelect;

    if (controlWidget.mode === "editorHolder") {
        switch (runtimeSchema.type) {
            case "object":
                ContainerRender(widget, options);
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
                        options.handle.onChange(ret, { updatePath: options.valuePath });
                    },
                });
                ContainerRender(widget, options);
                break;
            }
            default:
                BaseRender(widget, options);
                break;
        }
        dsMaker(dataSource, controlWidget, options, {
            holder: true,
            caller: "Control",
        });
    } else {
        dataSource.children = [];
        let localIndex = domIndex;
        const loopLen = (controlWidget.children || []).length || 0;
        for (let index = 0; index < loopLen; index++) {
            debug && (debugObj.inLoop = true);
            options.domIndex = localIndex;
            dataSource.children[index] = {};
            ControlRender(controlWidget.children[index], widget, options);
            localIndex += dataSource.children[index].domLength;
        }

        dsMaker(dataSource, controlWidget, options, { caller: "Root" });
    }
};

export default ControlRender;
