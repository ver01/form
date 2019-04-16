module.exports = {
    schema: {
        title: "Date and time widgets",
        type: "object",
        properties: {
            datetime: {
                type: "string",
                format: "date-time",
            },
            date: {
                type: "string",
                format: "date",
            },
            time: {
                type: "string",
                format: "time",
            },
        },
    },
    defaultValue: {},
};
