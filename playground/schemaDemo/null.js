module.exports = {
    schema: {
        title: "Null field example",
        description: "A short form with a null field",
        type: "object",
        required: ["firstName"],
        properties: {
            helpText: {
                title: "A null field",
                description: "Null fields like this are great for adding extra information",
                type: "null",
            },
            firstName: {
                type: "string",
                title: "A regular string field",
                default: "Chuck",
                $vf_ext: {
                    props: {
                        autoFocus: true,
                    },
                },
            },
        },
    },
    defaultValue: {},
};
