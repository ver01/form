module.exports = {
    schema: {
        title: "A registration form",
        description: "A simple form example.",
        type: "object",
        required: ["firstName", "lastName"],
        properties: {
            firstName: {
                type: "string",
                title: "First name",
                default: "Chuck",
                $vf_ext: {
                    props: {
                        autoFocus: true,
                    },
                },
            },
            lastName: {
                type: "string",
                title: "Last name",
            },
            age: {
                type: "integer",
                title: "Age of person",
                description: "(earthian year)",
            },
            bio: {
                type: "string",
                title: "Bio",
                $vf_ext: {
                    widget: "textarea",
                },
            },
            password: {
                type: "string",
                title: "Password",
                description: "Hint: Make it strong!",
                minLength: 3,
                $vf_ext: {
                    widget: "password",
                },
            },
        },
    },
    defaultValue: {
        lastName: "Norris",
        age: 75,
        bio: "Roundhouse kicking asses since 1940",
        password: "noneed",
    },
};
