module.exports = {
    schema: {
        type: "object",
        properties: {
            age: {
                type: "integer",
                title: "Age",
            },
            items: {
                type: "array",
                items: {
                    type: "object",
                    anyOf: [
                        {
                            properties: {
                                foo: {
                                    title: "Foo",
                                    type: "string",
                                },
                            },
                        },
                        {
                            properties: {
                                bar: {
                                    title: "Bar",
                                    type: "string",
                                },
                            },
                        },
                    ],
                },
            },
        },
        anyOf: [
            {
                title: "First method of identification",
                properties: {
                    firstName: {
                        type: "string",
                        title: "First name",
                        default: "Chuck",
                    },
                    lastName: {
                        type: "string",
                        title: "Last name",
                    },
                },
            },
            {
                title: "Second method of identification",
                properties: {
                    idCode: {
                        type: "string",
                        title: "ID code",
                    },
                },
            },
        ],
    },
    defaultValue: {},
};
