module.exports = {
    schema: {
        title: "custom",
        type: "object",
        properties: {
            localisation: {
                title: "A localisation form",
                type: "object",
                required: ["lat", "lon"],
                properties: {
                    lat: {
                        type: "number",
                    },
                    lon: {
                        type: "number",
                    },
                },
                $vf_opt: {
                    widget: "localisation",
                },
            },
            "rc-color-picker": {
                type: "array",
                title: "Custom component 2 - By load theme",
                description:
                    "import rc-color-picker in theme file 'src/themes/antd.js' [import + components.string.widgets.color]",
                items: {
                    type: "string",
                    title: "Color picker",
                    default: "#151ce6",
                    $vf_opt: {
                        widget: "color",
                    },
                },
            },
        },
    },
    defaultValue: {
        localisation: {
            lat: 123,
            lon: 456,
        },
        "rc-color-picker": ["#009933", "#df5757"],
    },
};
