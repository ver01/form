module.exports = {
    schema: {
        title: "Widgets",
        type: "object",
        properties: {
            stringFormats: {
                type: "object",
                title: "String formats",
                properties: {
                    email: {
                        type: "string",
                        format: "email",
                    },
                    uri: {
                        type: "string",
                        format: "uri",
                    },
                },
            },
            boolean: {
                type: "object",
                title: "Boolean field",
                properties: {
                    default: {
                        type: "boolean",
                        title: "switch (default)",
                        description: "This is the switch-description",
                    },
                    checkbox: {
                        type: "boolean",
                        title: "checkbox (default)",
                        description: "This is the checkbox-description",
                        $vf_opt: {
                            widget: "checkbox",
                        },
                    },
                    radio: {
                        type: "boolean",
                        title: "radio buttons",
                        description: "This is the radio-description",
                        $vf_opt: {
                            widget: "radio",
                        },
                    },
                    select: {
                        type: "boolean",
                        title: "select box",
                        description: "This is the select-description",
                        $vf_opt: {
                            widget: "select",
                        },
                    },
                },
            },
            string: {
                type: "object",
                title: "String field",
                properties: {
                    default: {
                        type: "string",
                        title: "text input (default)",
                    },
                    textarea: {
                        type: "string",
                        title: "textarea",
                        $vf_opt: {
                            widget: "textarea",
                        },
                    },
                },
            },
            secret: {
                type: "string",
                default: "I'm a hidden string.",
                $vf_opt: {
                    widget: "hidden",
                },
            },
            disabled: {
                type: "string",
                title: "A disabled field",
                default: "I am disabled.",
                $vf_opt: {
                    option: {
                        disabled: true,
                    },
                },
            },
            readonly: {
                type: "string",
                title: "A readonly field",
                default: "I am read-only.",
                $vf_opt: {
                    option: {
                        readonly: true,
                    },
                },
            },
            widgetOptions: {
                title: "Custom widget with options",
                type: "string",
                default: "I am yellow",
                $vf_opt: {
                    props: {
                        style: {
                            backgroundColor: "yellow",
                        },
                    },
                },
            },
            selectWidgetOptions: {
                title: "Custom select widget with options",
                description: "(color red) need decleard in theme file first",
                type: "string",
                enum: ["foo", "bar"],
                enumNames: ["Foo", "Bar"],
                $vf_opt: {
                    props: {
                        style: {
                            color: "red",
                        },
                    },
                },
            },
        },
    },
    defaultValue: {
        stringFormats: {
            email: "chuck@norris.net",
            uri: "http://chucknorris.com/",
        },
        boolean: {
            default: true,
            checkbox: true,
            radio: true,
            select: true,
        },
        string: {
            default: "Hello...",
            textarea: "... World",
        },
        secret: "I'm a hidden string.",
    },
};
