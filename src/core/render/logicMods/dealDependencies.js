import { isPlainObject, isArrayLikeObject } from "lodash";
import { getNodeValue } from "../../../utils";
import { schemaMerge } from "../../../schemaUtils";

export default function(runtimeSchema, runtimeValueNode) {
    const value = getNodeValue(runtimeValueNode);
    runtimeSchema.dependencies = runtimeSchema.dependencies || {};
    const { dependencies } = runtimeSchema;

    if (runtimeSchema.type === "object" && isPlainObject(dependencies) && isPlainObject(value)) {
        const objKeys = Object.keys(dependencies).filter(key => !isArrayLikeObject(dependencies[key]));
        const matchKeys = objKeys
            .filter(key => Object.keys(value).includes(key))
            .filter(key => {
                const v = value[key];
                if (typeof v === "string") {
                    if (v) {
                        return true;
                    }
                } else if (typeof v !== "undefined") {
                    return true;
                }
                return false;
            });
        matchKeys.map(key => {
            schemaMerge(runtimeSchema, dependencies[key]);
        });
        objKeys.map(key => {
            delete dependencies[key];
        });
    }
}
