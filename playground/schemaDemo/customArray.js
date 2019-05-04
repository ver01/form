module.exports = {
    schema: {
        type: "object",
        properties: {
            customArray: {
                title: "Custom array (Custom) of strings",
                type: "array",
                items: {
                    type: "string",
                },
                $vf_opt: {
                    widget: "custom-array",
                },
            },
            customArrayAndChild: {
                title: "Custom array (Custom) of strings (Custom)",
                type: "array",
                items: {
                    type: "string",
                },
                $vf_opt: {
                    widget: "custom-array-and-child",
                },
            },
            customArrayAndChildPartly: {
                title: "Custom array (Custom) of strings (Custom Partly)",
                type: "array",
                items: {
                    type: "string",
                },
                $vf_opt: {
                    widget: "custom-array-and-child-partly",
                },
            },
        },
    },
    defaultValue: {
        customArray: ["react", "jsonschema", "form"],
        customArrayAndChild: ["react", "jsonschema", "form"],
        customArrayAndChildPartly: ["react", "jsonschema", "form"],
    },
};
