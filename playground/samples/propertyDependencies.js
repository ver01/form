module.exports = {
    schema: {
        title: "Property dependencies",
        type: "object",
        properties: {
            unidirectional: {
                title: "Unidirectional",
                src: "https://spacetelescope.github.io/understanding-json-schema/reference/object.html#dependencies",
                type: "object",
                properties: {
                    name: {
                        title: "Name",
                        type: "string",
                    },
                    credit_card: {
                        title: "Credit Card",
                        type: "number",
                        description: "If you enter anything here then billing_address will become required.",
                    },
                    billing_address: {
                        title: "Billing Address",
                        type: "string",
                        description: "It’s okay to have a billing address without a credit card number.",
                    },
                },
                required: ["name"],
                dependencies: {
                    credit_card: ["billing_address"],
                },
            },
            bidirectional: {
                title: "Bidirectional",
                src: "https://spacetelescope.github.io/understanding-json-schema/reference/object.html#dependencies",
                description:
                    "Dependencies are not bidirectional, you can, of course, define the bidirectional dependencies explicitly.",
                type: "object",
                properties: {
                    name: {
                        type: "string",
                        title: "Name",
                    },
                    credit_card: {
                        type: "number",
                        description: "If you enter anything here then billing_address will become required.",
                        title: "Credit Card",
                    },
                    billing_address: {
                        type: "string",
                        description: "If you enter anything here then credit_card will become required.",
                        title: "Billing Address",
                    },
                },
                required: ["name"],
                dependencies: {
                    credit_card: ["billing_address"],
                    billing_address: ["credit_card"],
                },
            },
        },
    },
    defaultValue: {
        unidirectional: {
            name: "Tim",
        },
        bidirectional: {
            name: "Jill",
        },
    },
};
