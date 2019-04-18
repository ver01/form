import Form from "./core/form";
import FormRender from "./core/render/formRender";
import { register } from "./core/tools";

Form.loadTheme = theme => register(theme, FormRender.ThemeCache);
Form.load = (widgetName, widget) => (FormRender.ThemeCache.registerWidgets[widgetName] = widget);
Form.quickLoad = (widgetName, widgetComponent) =>
    (FormRender.ThemeCache.registerWidgets[widgetName] = {
        component: widgetComponent,
        props: {
            $vf_value: ({ value }) => value,
            $vf_onChange: ({ handle }) => handle.onChange,
        },
    });

export default Form;
