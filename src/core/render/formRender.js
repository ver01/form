import { handleRef, handleXofAndValue } from "../../schemaUtils";
import handleValidator from "../validator";
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

    const widgetObj = getWidget(
        isRoot ? ThemeCache.components.root : ThemeCache.components[runtimeSchema.type],
        runtimeSchema,
        parentRuntimeSchema,
        widgetForChild
    );
    const { widget = {}, widgetName = "", widgetData } = widgetObj || {};
    const { formatter = null, normalizer = null } = widget;

    Object.assign(options, {
        schemaOption: getByPath(runtimeSchema, "$vf_opt/option") || {},
        isArray: runtimeSchema.type === "array",
        isObject: runtimeSchema.type === "object",
    });
    Object.assign(options, {
        widgetName,
        widgetData,
        formatter,
        normalizer,
    });

    if (isRoot) {
        RootRender(widget, options);
    } else {
        const controlWidgetObj = getWidget(ThemeCache.components.control);
        ControlRender(controlWidgetObj, widget, options, ThemeCache);
    }
    return { childFormRenderOptions: options };
};

FormRender.ThemeCache = ThemeCache;

export default FormRender;
