import React from "react";

const Div = props => <div {...props}>{props.children}</div>;
const Button = props => <button {...props}>{props.children}</button>;
const Input = props => <input {...props} />;

export const CustomArray = {
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
            component: Div,
            repeater: {
                component: Div,
                children: [
                    {
                        mode: "editorHolder",
                        component: null,
                    },
                    {
                        component: Div,
                        children: [
                            {
                                component: Button,
                                props: {
                                    $vf_onClick: ({ handle }) => handle.moveUp,
                                    $vf_children: ["up"],
                                },
                            },
                            {
                                component: Button,
                                props: {
                                    $vf_onClick: ({ handle }) => handle.moveDown,
                                    $vf_children: ["down"],
                                },
                            },
                            {
                                component: Button,
                                props: {
                                    $vf_onClick: ({ handle }) => handle.remove,
                                    $vf_children: ["delete"],
                                },
                            },
                        ],
                    },
                ],
            },
        },
        {
            component: Div,
            children: [
                {
                    component: Button,
                    props: {
                        $vf_onClick: ({ handle }) => handle.append,
                        $vf_children: ["append"],
                    },
                },
            ],
        },
    ],
};

export const CustomArrayChild = {
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
            component: Div,
            repeater: {
                component: Div,
                children: [
                    {
                        mode: "editorHolder",
                        component: null,
                    },
                    {
                        component: Div,
                        children: [
                            {
                                component: Button,
                                props: {
                                    $vf_onClick: ({ handle }) => handle.moveUp,
                                    $vf_children: ["up"],
                                },
                            },
                            {
                                component: Button,
                                props: {
                                    $vf_onClick: ({ handle }) => handle.moveDown,
                                    $vf_children: ["down"],
                                },
                            },
                            {
                                component: Button,
                                props: {
                                    $vf_onClick: ({ handle }) => handle.remove,
                                    $vf_children: ["remove"],
                                },
                            },
                        ],
                    },
                ],
            },
            editor: {
                component: Input,
                props: {
                    style: { margin: "20px 0" },
                    $vf_value: ({ value }) => value,
                    $vf_onChange: ({ handle }) => ({ target }) => handle.onChange(target.value),
                    placeholder: "customization",
                },
            },
        },
        {
            component: Div,
            children: [
                {
                    component: Button,
                    props: {
                        $vf_onClick: ({ handle }) => handle.append,
                        $vf_children: ["append"],
                    },
                },
            ],
        },
    ],
};

export const CustomArrayChildPartly = {
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
            component: Div,
            repeater: {
                component: Div,
                children: [
                    {
                        mode: "editorHolder",
                        component: null,
                    },
                    {
                        component: Div,
                        children: [
                            {
                                component: Button,
                                props: {
                                    $vf_onClick: ({ handle }) => handle.moveUp,
                                    $vf_children: ["up"],
                                },
                            },
                            {
                                component: Button,
                                props: {
                                    $vf_onClick: ({ handle }) => handle.moveDown,
                                    $vf_children: ["down"],
                                },
                            },
                            {
                                component: Button,
                                props: {
                                    $vf_onClick: ({ handle }) => handle.remove,
                                    $vf_children: ["remove"],
                                },
                            },
                        ],
                    },
                ],
            },
            editor: [
                {
                    component: Input,
                    editorFor: 0, // index start with 0
                    props: {
                        style: { margin: "20px 0" },
                        $vf_value: ({ value }) => value,
                        $vf_onChange: ({ handle }) => ({ target }) => handle.onChange(target.value),
                        placeholder: "customization",
                    },
                },
                {
                    component: Input,
                    editorFor: 2, // index start with 0
                    props: {
                        style: { margin: "20px 0" },
                        $vf_value: ({ value }) => value,
                        $vf_onChange: ({ handle }) => ({ target }) => handle.onChange(target.value),
                        placeholder: "customization",
                    },
                },
            ],
        },
        {
            component: Div,
            children: [
                {
                    component: Button,
                    props: {
                        $vf_onClick: ({ handle }) => handle.append,
                        $vf_children: ["append"],
                    },
                },
            ],
        },
    ],
};
