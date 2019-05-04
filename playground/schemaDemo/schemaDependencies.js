module.exports = {
    schema: {
        title: "Schema dependencies",
        type: "object",
        properties: {
            simple: {
                src: "https://spacetelescope.github.io/understanding-json-schema/reference/object.html#dependencies",
                title: "Simple",
                type: "object",
                properties: {
                    name: {
                        type: "string",
                        title: "Name",
                    },
                    credit_card: {
                        title: "Credit Card",
                        type: "number",
                        description:
                            "If you enter anything here then billing_address will be dynamically added to the form.",
                    },
                },
                required: ["name"],
                dependencies: {
                    credit_card: {
                        properties: {
                            billing_address: {
                                type: "string",
                                title: "Billing Address",
                            },
                        },
                        required: ["billing_address"],
                    },
                },
            },
            conditional: {
                title: "Conditional",
                $ref: "#/definitions/person",
            },
            arrayOfConditionals: {
                title: "Array of conditionals",
                type: "array",
                items: {
                    $ref: "#/definitions/person",
                },
            },
            fixedArrayOfConditionals: {
                title: "Fixed array of conditionals",
                type: "array",
                items: [
                    {
                        title: "Primary person",
                        $ref: "#/definitions/person",
                    },
                ],
                additionalItems: {
                    title: "Additional person",
                    $ref: "#/definitions/person",
                },
            },
        },
        definitions: {
            person: {
                title: "Person",
                type: "object",
                properties: {
                    "Do you have any pets?": {
                        type: "string",
                        title: "Do you have any pets?",
                        enum: ["No", "Yes: One", "Yes: More than one"],
                        default: "No",
                    },
                },
                required: ["Do you have any pets?"],
                dependencies: {
                    "Do you have any pets?": {
                        oneOf: [
                            {
                                title: "No Pets",
                                properties: {
                                    "Do you have any pets?": {
                                        enum: ["No"],
                                    },
                                },
                            },
                            {
                                title: "One Pets",
                                properties: {
                                    "Do you have any pets?": {
                                        enum: ["Yes: One"],
                                    },
                                    "How old is your pet?": {
                                        title: "How old is your pet?",
                                        type: "number",
                                    },
                                },
                                required: ["How old is your pet?"],
                            },
                            {
                                title: "More than one Pets",
                                properties: {
                                    "Do you have any pets?": {
                                        enum: ["Yes: More than one"],
                                    },
                                    "Do you want to get rid of any?": {
                                        title: "Do you want to get rid of any?",
                                        type: "boolean",
                                        $vf_opt: {
                                            widget: "radio",
                                        },
                                    },
                                },
                                required: ["Do you want to get rid of any?"],
                            },
                        ],
                    },
                },
            },
        },
    },
    defaultValue: {
        simple: {
            name: "Randy",
        },
        conditional: {
            "Do you have any pets?": "No",
        },
        arrayOfConditionals: [
            {
                "Do you have any pets?": "Yes: One",
                "How old is your pet?": 5,
            },
            {
                "Do you have any pets?": "Yes: More than one",
                "Do you want to get rid of any?": false,
            },
        ],
        fixedArrayOfConditionals: [
            {
                "Do you have any pets?": "No",
            },
            {
                "Do you have any pets?": "Yes: One",
                "How old is your pet?": 6,
            },
            {
                "Do you have any pets?": "Yes: More than one",
                "Do you want to get rid of any?": true,
            },
        ],
    },
};
