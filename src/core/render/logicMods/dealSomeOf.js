import { getCache, isSchemaMatched } from "../../../utils";
import { schemaMerge } from "../../../utils";

export default function(schema, someOf, allOf, cache, valuePath, value, rootSchema, cacheUpdate) {
    let schemaList = null;

    if (someOf) {
        const scmLen = someOf.length;
        if (someOf.length === 1) {
            schemaMerge(schema, someOf[0]);
        } else if (scmLen > 1) {
            let { activeSchemaIndex, activeSchemaForce } = getCache(cache, "valuePath", valuePath);
            schemaList = someOf.map((it, ind) => {
                // todo deep merge schema
                const valid = isSchemaMatched(value, schemaMerge({}, schema, it), rootSchema);
                return {
                    schema: it,
                    valid,
                    selected: activeSchemaForce ? ind === activeSchemaIndex : valid && ind === activeSchemaIndex,
                };
            });
            if (Number.isInteger(activeSchemaIndex)) {
                if (!schemaList[activeSchemaIndex].selected) {
                    let newIndex = schemaList.findIndex(it => it.valid);
                    newIndex = newIndex === -1 ? activeSchemaIndex : newIndex;
                    if (activeSchemaIndex !== newIndex) {
                        activeSchemaIndex = newIndex;
                        cacheUpdate("valuePath", valuePath, { activeSchemaIndex: activeSchemaIndex });
                    }
                }
            } else {
                activeSchemaIndex = schemaList.findIndex(it => it.valid);
                activeSchemaIndex = activeSchemaIndex === -1 ? 0 : activeSchemaIndex;
                cacheUpdate("valuePath", valuePath, { activeSchemaIndex: activeSchemaIndex });
            }
            if (activeSchemaForce) {
                cacheUpdate("valuePath", valuePath, { activeSchemaForce: false });
            }
            schemaList[activeSchemaIndex].selected = true;
            schemaMerge(schema, someOf[activeSchemaIndex]);
        }
    } else if (allOf) {
        schema = schemaMerge(schema, ...allOf);
    }
    return { schema, schemaList };
}
