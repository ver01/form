import { getNodeValue } from "../../utils";
import { getEditor } from "../tools";
import handleValidator from "../validator";
import ItemRender from "./item";

const ObjectReapeaterRender = (widget, options, editors) => {
    const { runtimeSchema, domIndex, runtimeValueNode, schemaOption, valuePath, debug, debugObj } = options;
    const { properties = {} } = runtimeSchema;
    const value = getNodeValue(runtimeValueNode);

    if (debug) {
        debugObj.path = `${debugObj.path}/Array`;
        console.log("%c%s %cValue:%o", "color:green", debugObj.path, "color:blue", runtimeValueNode);
    }

    let keys = Object.keys(properties);
    const { order = [] } = schemaOption;
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

    let localIndex = domIndex;
    for (let index = 0; index < keys.length; index++) {
        const objectKey = keys[index];
        const subSchema = properties[objectKey];
        const subValue = (value || {})[objectKey];
        const newValuePath = `${valuePath}/${objectKey}`;
        handleValidator({
            ...options,
            runtimeValue: subValue,
            parentRuntimeSchema: runtimeSchema,
            runtimeSchema: subSchema,
            objectKey,
            arrayIndex: null,
            parentRuntimeValue: value,
            valuePath: newValuePath,
        });
        ItemRender(widget, {
            ...options,
            runtimeValueNode: { node: value, key: objectKey },
            runtimeSchema: subSchema,
            handle: {
                onChange: (val, opt) => {
                    options.handle.onChange(Object.assign(value, { [objectKey]: val }), opt);
                },
            },
            objectKey,
            arrayIndex: null,
            parentRuntimeSchema: runtimeSchema,
            parentRuntimeValue: value,
            valuePath: newValuePath,
            domIndex: localIndex,
            // using for custom object child widgetShcema
            childEditor: getEditor(editors, objectKey),
            debug: debug ? { path: `${debugObj.path}[${objectKey}]` } : null,
        });
    }
};
export default ObjectReapeaterRender;
