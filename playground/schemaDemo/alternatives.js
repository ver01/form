module.exports = {
    schema: {
        definitions: {
            Color: {
                title: "Color",
                type: "string",
                anyOf: [
                    {
                        type: "string",
                        enum: ["#ff0000"],
                        title: "Red",
                    },
                    {
                        type: "string",
                        enum: ["#00ff00"],
                        title: "Green",
                    },
                    {
                        type: "string",
                        enum: ["#0000ff"],
                        title: "Blue",
                    },
                ],
                $vf_opt: {
                    widget: "color",
                },
            },
            Toggle: {
                title: "Toggle",
                type: "boolean",
                oneOf: [
                    {
                        title: "Enable",
                        const: true,
                    },
                    {
                        title: "Disable",
                        const: false,
                    },
                ],
                $vf_opt: {
                    widget: "radio",
                },
            },
        },
        title: "Image editor",
        type: "object",
        required: ["currentColor", "colorMask", "blendMode"],
        properties: {
            currentColor: {
                $ref: "#/definitions/Color",
                title: "Brush color",
            },
            colorMask: {
                type: "array",
                uniqueItems: true,
                items: {
                    $ref: "#/definitions/Color",
                },
                title: "Color mask",
            },
            toggleMask: {
                title: "Apply color mask",
                $ref: "#/definitions/Toggle",
            },
            colorPalette: {
                type: "array",
                title: "Color palette",
                items: {
                    $ref: "#/definitions/Color",
                },
            },
            blendMode: {
                title: "Blend mode",
                type: "string",
                enum: ["screen", "multiply", "overlay"],
                enumNames: ["Screen", "Multiply", "Overlay"],
                $vf_opt: {
                    option: {
                        enumDisabled: [{ value: "multiply" }], // highest priority match value > index > label
                        // enumDisabled: [{ index: 1 }],
                        // enumDisabled: [{ label: "Multiply" }],
                    },
                },
            },
        },
    },
    defaultValue: {
        currentColor: "#00ff00",
        colorMask: ["#0000ff"],
        colorPalette: ["#ff0000"],
        blendMode: "screen",
    },
};
