module.exports = {
    schema: {
        title: "Custom validation",
        description:
            "This form defines custom validation rules checking that the two passwords match. [by Schema: $vf_ext.validate.passEqualTo & Props: validators ]",
        type: "object",
        properties: {
            pass1: {
                title: "Password",
                type: "string",
                minLength: 3,
                $vf_ext: {
                    widget: "password",
                },
            },
            pass2: {
                title: "Repeat password",
                type: "string",
                minLength: 3,
                $vf_ext: {
                    widget: "password",
                    validate: {
                        passEqualTo: "pass1",
                    },
                },
            },
            age: {
                title: "Age",
                type: "number",
                minimum: 18,
            },
        },
    },
    defaultValue: {},
};
