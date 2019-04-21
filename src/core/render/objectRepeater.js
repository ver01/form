import { isArrayLikeObject, isPlainObject, deepClone } from "../../vendor/lodash";
import { getEditor } from "../tools";
import Validator from "../validator";
import ItemRender from "./item";

const ObjectReapeaterRender = (widget, options, editors) => {
    const {
        underControl,
        schema,
        globalKey,
        value,
        schemaOption,
        rootValue,
        formProps,
        updatePath,
        rootSchema,
        valuePath,
        changeTree = {},
        runtime,
        debug,
    } = options;
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
            options.value
        );
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

    let localKey = globalKey;
    let children = [];
    const changeTreeChildren = isPlainObject(changeTree.children) ? changeTree.children : {};
    for (let index = 0; index < keys.length; index++) {
        const objectKey = keys[index];
        const subSchema = properties[objectKey];
        const subValue = (value || {})[objectKey];
        const newValuePath = `${valuePath}/${objectKey}`;
        const node = ItemRender(widget, {
            ...options,
            changeTree: changeTreeChildren[objectKey],
            value: subValue,
            schema: subSchema,
            handle: {
                onChange: (val, opt) => {
                    const data = underControl ? deepClone(value) : value;
                    options.handle.onChange(Object.assign(data, { [objectKey]: val }), opt);
                },
            },
            objectKey,
            arrayIndex: null,
            parentSchema: schema,
            parentValue: value,
            valuePath: newValuePath,
            forceUpdate: updatePath && newValuePath.startsWith(updatePath),
            globalKey: localKey,
            errorObj: Validator.verify({
                value: subValue,
                rootValue,
                rootSchema,
                parentSchema: schema,
                schema: subSchema,
                objectKey,
                formProps,
                arrayIndex: null,
                parentValue: value,
            }),
            // using for custom object child widgetShcema
            childEditor: getEditor(editors, objectKey),
            runtime: {
                ...runtime,
                valueParent: runtime.valueParent[runtime.valueKey],
                valueKey: objectKey,
            },
            debug: debug ? { path: `${debug.path}[${objectKey}]` } : null,
        });
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
export default ObjectReapeaterRender;
