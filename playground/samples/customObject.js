module.exports = {
    schema: {
        type: "object",
        properties: {
            customAll: {
                title: "custom all",
                type: "object",
                properties: {
                    firstName: {
                        type: "string",
                        title: "First name",
                    },
                    lastName: {
                        type: "string",
                        title: "Last name",
                    },
                    age: {
                        type: "integer",
                        title: "Age",
                    },
                    bio: {
                        type: "string",
                        title: "Bio",
                    },
                    password: {
                        type: "string",
                        title: "Password",
                        minLength: 3,
                    },
                    telephone: {
                        type: "string",
                        title: "Telephone",
                        minLength: 10,
                    },
                },
                $vf_ext: {
                    widget: "custom-object",
                },
            },
            customPartly: {
                title: "custom partly",
                type: "object",
                properties: {
                    firstName: {
                        type: "string",
                        title: "First name",
                    },
                    "lastName(custom)": {
                        type: "string",
                        title: "Last name",
                    },
                    age: {
                        type: "integer",
                        title: "Age",
                    },
                    "bio(custom)": {
                        type: "string",
                        title: "Bio",
                    },
                    password: {
                        type: "string",
                        title: "Password",
                        minLength: 3,
                    },
                    telephone: {
                        type: "string",
                        title: "Telephone",
                        minLength: 10,
                    },
                },
                $vf_ext: {
                    widget: "custom-object-partly",
                },
            },
        },
    },
    defaultValue: {
        customAll: {
            firstName: "Chuck",
            lastName: "Norris",
            age: 75,
            bio: "Roundhouse kicking asses since 1940",
            password: "noneed",
        },
        customPartly: {
            firstName: "Chuck",
            lastName: "Norris",
            age: 75,
            bio: "Roundhouse kicking asses since 1940",
            password: "noneed",
        },
    },
};
