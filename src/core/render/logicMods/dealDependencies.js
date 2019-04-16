import { isPlainObject, isArrayLikeObject } from "../../../vendor/lodash";
import { schemaMerge } from "../../../utils";

export default function(schema, value) {
    const { dependencies } = schema;
    schema.dependencies = schema.dependencies || {};

    if (schema.type === "object" && isPlainObject(dependencies) && isPlainObject(value)) {
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
            schemaMerge(schema, schema.dependencies[key]);
        });
        objKeys.map(key => {
            delete dependencies[key];
        });
    }
    return { schema };
}
