import { getCache, setCache, getNodeValue } from "../../../utils";
import { isSchemaMatched, schemaMerge } from "../../../schemaUtils";

export default function(
    runtimeSchema,
    someOf,
    allOf,
    rootControlCache,
    valuePath,
    runtimeValueNode,
    rootRawReadonlySchema
) {
    let schemaList = null;

    if (someOf) {
        const scmLen = someOf.length;
        if (someOf.length === 1) {
            schemaMerge(runtimeSchema, someOf[0]);
        } else if (scmLen > 1) {
            let { activeSchemaIndex, activeSchemaForce } = getCache(rootControlCache, "valuePath", valuePath);
            schemaList = someOf.map((it, ind) => {
                // todo deep merge runtimeSchema
                const valid = isSchemaMatched(
                    getNodeValue(runtimeValueNode),
                    schemaMerge({}, runtimeSchema, it),
                    rootRawReadonlySchema
                );
                return {
                    schema: it, // for control widget user define (runtimeSchema => displayed as schema)
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
                        setCache(rootControlCache, "valuePath", valuePath, { activeSchemaIndex: activeSchemaIndex });
                    }
                }
            } else {
                activeSchemaIndex = schemaList.findIndex(it => it.valid);
                activeSchemaIndex = activeSchemaIndex === -1 ? 0 : activeSchemaIndex;
                setCache(rootControlCache, "valuePath", valuePath, { activeSchemaIndex: activeSchemaIndex });
            }
            if (activeSchemaForce) {
                setCache(rootControlCache, "valuePath", valuePath, { activeSchemaForce: false });
            }
            schemaList[activeSchemaIndex].selected = true;
            schemaMerge(runtimeSchema, someOf[activeSchemaIndex]);
        }
    } else if (allOf) {
        schemaMerge(runtimeSchema, ...allOf);
    }
    return schemaList;
}
