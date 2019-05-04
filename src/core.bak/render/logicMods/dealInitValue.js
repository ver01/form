import { initValue } from "../../../utils";

export default function(options, copySchema) {
    const { value, rootSchema, runtime } = options;

    options.value = initValue(value, copySchema, rootSchema);
    if (typeof options.value !== "undefined") {
        runtime.valueParent[runtime.valueKey] = options.value;
    }
}
