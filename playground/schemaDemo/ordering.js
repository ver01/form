module.exports = {
    schema: {
        title: "A registration form",
        type: "object",
        required: ["firstName", "lastName"],
        $vf_ext: {
            option: { order: ["firstName", "lastName", "*", "password"] },
        },
        properties: {
            password: {
                type: "string",
                title: "Password",
                $vf_ext: {
                    widget: "password",
                },
            },
            lastName: {
                type: "string",
                title: "Last name",
            },
            bio: {
                type: "string",
                title: "Bio",
                $vf_ext: {
                    widget: "textarea",
                },
            },
            firstName: {
                type: "string",
                title: "First name",
            },
            age: {
                type: "integer",
                title: "Age",
            },
        },
    },
    defaultValue: {
        firstName: "Chuck",
        lastName: "Norris",
        age: 75,
        bio: "Roundhouse kicking asses since 1940",
        password: "noneed",
    },
};
