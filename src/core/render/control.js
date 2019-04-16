import { getDefault, getItemSchema } from "../../utils";
import ContainerRender from "./container";
import BaseRender, { leafs } from "./base";
import { isArrayLikeObject, deepClone } from "../../vendor/lodash";

const ControlRender = (controlWidget, widget, coreOpt, formRender) => {
    const { value, schema, valuePath, rootSchema, debug, underControl, globalKey, cacheUpdate } = coreOpt;

    if (debug) {
        if (debug.inLoop) {
            debug.inLoop = false;
        } else {
            debug.path = `${debug.path}/Control`;
            console.log(
                "%c%s %cChange:%o %cValue:%o",
                "color:green",
                debug.path,
                "color:blue",
                coreOpt.changeTree,
                "color:blue",
                coreOpt.value
            );
        }
    }

    const schemaSelect = index => {
        const int = typeof index === "string" ? parseInt(index, 10) : index;
        cacheUpdate("valuePath", valuePath, { activeSchemaIndex: int, activeSchemaForce: true }, true);
    };

    if (controlWidget.mode === "editorHolder") {
        let child = null;
        switch (schema.type) {
            case "object":
                child = ContainerRender(widget, coreOpt, formRender);
                break;
            case "array": {
                Object.assign(coreOpt.handle, {
                    canAppend:
                        !(coreOpt.extOption.appendable === false) &&
                        (!Number.isInteger(schema.maxItems) || schema.maxItems > (value || []).length),
                    append: () => {
                        const data = underControl ? deepClone(value) : value;
                        const ret = data || [];
                        ret.push(
                            getDefault({
                                schema: getItemSchema(schema, ret.length, rootSchema),
                            })
                        );
                        coreOpt.handle.onChange(ret);
                    },
                });
                child = ContainerRender(widget, coreOpt, formRender);
                break;
            }
            default:
                child = BaseRender(widget, coreOpt);
                break;
        }
        return leafs(controlWidget, { ...coreOpt, handle: { ...coreOpt.handle, schemaSelect } }, child, globalKey, {
            holder: true,
            caller: "Control",
        });
    }

    let localKey = globalKey;
    let nodeChildren = [];
    const loopLen = (controlWidget.children || []).length || 0;
    for (let index = 0; index < loopLen; index++) {
        const child = controlWidget.children[index];
        debug && (debug.inLoop = true);
        const subNodes = ControlRender(child, widget, { ...coreOpt, globalKey: localKey }, formRender);
        if (isArrayLikeObject(subNodes)) {
            localKey += subNodes.length;
            nodeChildren = nodeChildren.concat(subNodes);
        } else {
            localKey++;
            nodeChildren.push(subNodes);
        }
    }

    return leafs(controlWidget, { ...coreOpt, handle: { ...coreOpt.handle, schemaSelect } }, nodeChildren, globalKey, {
        caller: "Control",
    });
};

export default ControlRender;
