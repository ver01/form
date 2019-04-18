import { handleRef, handleXofAndValue } from "../../schemaUtils";
import { getWidget } from "../tools";
import RootRender from "./root";

const ThemeCache = { components: {}, validators: {}, registerWidgets: {} };

const FormRender = function(options, passBySchemaHandle = false) {
    const { rootRawReadonlySchema, rootRuntimeSchema } = options;

    if (!passBySchemaHandle) {
        handleRef(rootRuntimeSchema, rootRawReadonlySchema);
        handleXofAndValue(options);
    }

    const { widget } = getWidget(ThemeCache.components.root, ThemeCache, rootRuntimeSchema);

    return RootRender(widget, options, this.ThemeCache);
};

FormRender.ThemeCache = ThemeCache;

export default FormRender;
