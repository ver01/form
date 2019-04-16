module.exports = {
    schema: {
        type: "object",
        title: "Number fields & widgets",
        properties: {
            number: {
                title: "Number",
                type: "number",
            },
            integer: {
                title: "Integer",
                type: "integer",
            },
            numberEnum: {
                type: "number",
                title: "Number enum",
                enum: [1, 2, 3],
            },
            numberEnumRadio: {
                type: "number",
                title: "Number enum",
                enum: [1, 2, 3],
                $vf_ext: {
                    widget: "radio",
                },
            },
            integerRange: {
                title: "Integer range",
                type: "integer",
                minimum: 42,
                maximum: 100,
                $vf_ext: {
                    widget: "range",
                },
            },
            integerRangeSteps: {
                title: "Integer range (by 10)",
                type: "integer",
                minimum: 50,
                maximum: 100,
                multipleOf: 10,
                $vf_ext: {
                    widget: "range",
                },
            },
        },
    },
    defaultValue: {
        number: 3.14,
        integer: 42,
        numberEnum: 2,
        integerRange: 42,
        integerRangeSteps: 80,
    },
};
