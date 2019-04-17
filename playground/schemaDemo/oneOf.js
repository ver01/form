module.exports = {
    schema: {
        type: "object",
        oneOf: [
            {
                properties: {
                    lorem: {
                        title: "Lorem",
                        type: "string",
                    },
                },
                required: ["lorem"],
            },
            {
                properties: {
                    ipsum: {
                        title: "Ipsum",
                        type: "string",
                    },
                },
                required: ["ipsum"],
            },
        ],
    },
    defaultValue: {},
};
