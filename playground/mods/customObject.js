import React from "react";

const Div = props => <div {...props}>{props.children}</div>;
const Input = props => <input {...props} />;

export const CustomObject = {
    component: Div,
    children: [
        {
            component: props => <h3>{props.title}</h3>,
            props: {
                $vf_title: ({ schema }) => schema.title,
            },
        },
        {
            mode: "repeaterHolder",
            component: null,
            repeater: {
                component: Div,
                children: [
                    {
                        component: props => (
                            <div>
                                <label>{props.title}</label>
                            </div>
                        ),
                        props: {
                            $vf_title: ({ schema }) => schema.title,
                        },
                    },
                    {
                        mode: "editorHolder",
                        component: null,
                    },
                    {
                        component: ({ errors }) => (errors ? errors.message : null),
                        props: {
                            $vf_errors: ({ errorObj }) => errorObj,
                        },
                    },
                ],
            },
            editor: [
                {
                    component: Input,
                    editorFor: "age", // only for integer
                    props: {
                        style: { margin: "20px 0" },
                        $vf_value: ({ value }) => value,
                        $vf_onChange: ({ handle }) => ({ target }) => {
                            if (!Number.isNaN(Number(target.value))) {
                                handle.onChange(Number(target.value));
                            } else {
                                handle.onChange(target.value);
                            }
                        },
                        placeholder: "customization",
                    },
                },
                {
                    component: Input,
                    props: {
                        style: { margin: "20px 0" },
                        $vf_value: ({ value }) => value,
                        $vf_onChange: ({ handle }) => ({ target }) => handle.onChange(target.value),
                        placeholder: "customization",
                    },
                },
            ],
        },
    ],
};

export const CustomObjectPartly = {
    component: Div,
    children: [
        {
            component: props => <h3>{props.title}</h3>,
            props: {
                $vf_title: ({ schema }) => schema.title,
            },
        },
        {
            mode: "repeaterHolder",
            component: null,
            repeater: {
                mode: "editorHolder",
                component: null,
            },
            editor: [
                {
                    component: Div,
                    editorFor: "age", // only for integer
                    children: [
                        {
                            component: props => (
                                <div>
                                    <label>{props.title}</label>
                                </div>
                            ),
                            props: {
                                $vf_title: ({ schema }) => schema.title,
                            },
                        },
                        {
                            component: Input,
                            props: {
                                style: { margin: "20px 0" },
                                $vf_value: ({ value }) => value,
                                $vf_onChange: ({ handle }) => ({ target }) => {
                                    if (!Number.isNaN(Number(target.value))) {
                                        handle.onChange(Number(target.value));
                                    } else {
                                        handle.onChange(target.value);
                                    }
                                },
                                placeholder: "customization",
                            },
                        },
                        {
                            component: ({ errors }) => (errors ? errors.message : null),
                            props: {
                                $vf_errors: ({ errorObj }) => errorObj,
                            },
                        },
                    ],
                },
                {
                    component: Div,
                    editorFor: "bio(custom)", // for specialKey
                    children: [
                        {
                            component: props => (
                                <div>
                                    <label>{props.title}</label>
                                </div>
                            ),
                            props: {
                                $vf_title: ({ schema }) => schema.title,
                            },
                        },
                        {
                            component: Input,
                            props: {
                                style: { margin: "20px 0" },
                                $vf_value: ({ value }) => value,
                                $vf_onChange: ({ handle }) => ({ target }) => handle.onChange(target.value),
                                placeholder: "customization",
                            },
                        },
                    ],
                },
            ],
        },
    ],
};
