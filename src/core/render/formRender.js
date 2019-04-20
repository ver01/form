import { handleRef, handleXofAndValue, handleValidator } from "../../schemaUtils";
import { getByPath } from "../../utils";
import { getWidget } from "../tools";
import RootRender from "./root";
import ControlRender from "./control";

const ThemeCache = { components: {}, validators: {}, registerWidgets: {} };

const FormRender = function(options, bypassSchemaHandle = false, isRoot = false) {
    const { rootRawReadonlySchema, rootRuntimeSchema, runtimeSchema, parentRuntimeSchema, widgetForChild } = options;

    if (!bypassSchemaHandle) {
        handleRef(rootRuntimeSchema, rootRawReadonlySchema);
        handleXofAndValue(options);
    }

    if (!isRoot) {
        handleValidator(options, ThemeCache);
    }

    const { widget } = getWidget(
        isRoot ? ThemeCache.components.root : ThemeCache.components[runtimeSchema.type],
        runtimeSchema,
        parentRuntimeSchema,
        widgetForChild
    );

    options.schemaOption = getByPath(runtimeSchema, "$vf_ext/option") || {};

    if (isRoot) {
        RootRender(widget, options);
    } else {
        const { widget: controlWidget } = getWidget(ThemeCache.components.control);
        ControlRender(controlWidget, widget, options);
    }
};

FormRender.ThemeCache = ThemeCache;

export default FormRender;
