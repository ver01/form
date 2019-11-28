import React from "react";
import Form from "./core/form";
import FormRender from "./core/render/formRender";
import { register } from "./core/tools";

Form.load = (widgetName, widget) => (FormRender.ThemeCache.registerWidgets[widgetName] = widget);
Form.quickLoad = (widgetName, widgetComponent) =>
    (FormRender.ThemeCache.registerWidgets[widgetName] = {
        component: widgetComponent,
        props: {
            $vf_value: ({ value }) => value,
            $vf_onChange: ({ handle }) => handle.onChange,
        },
    });

export const core = {
    loadTheme: theme => register(theme, FormRender.ThemeCache),
};

export const Controlled = props => {
    const { defaultValue, ...others } = props;
    return <Form {...others} />;
};

export const Uncontrolled = props => {
    const { value, ...others } = props;
    return <Form {...others} />;
};

export default Form;
