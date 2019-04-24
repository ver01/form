module.exports = {
    schema: {
        definitions: {
            Thing: {
                type: "object",
                properties: {
                    name: {
                        type: "string",
                        default: "Default name",
                    },
                },
            },
        },
        type: "object",
        properties: {
            listOfStrings: {
                type: "array",
                title: "A list of strings",
                items: {
                    type: "string",
                    default: "bazinga",
                },
            },
            multipleChoicesList: {
                type: "array",
                title: "A multiple choices list",
                items: {
                    type: "string",
                    enum: ["foo", "bar", "fuzz", "qux"],
                },
                uniqueItems: true,
            },
            fixedItemsList: {
                type: "array",
                title: "A list of fixed items",
                items: [
                    {
                        title: "A string value",
                        type: "string",
                        default: "lorem ipsum",
                        $vf_opt: {
                            widget: "textarea",
                        },
                    },
                    {
                        title: "a boolean value",
                        type: "boolean",
                        $vf_opt: {
                            widget: "select",
                        },
                    },
                ],
                additionalItems: {
                    title: "Additional item",
                    type: "number",
                    $vf_opt: {
                        widget: "updown",
                    },
                },
            },
            minItemsList: {
                type: "array",
                title: "A list with a minimal number of items",
                minItems: 3,
                items: {
                    $ref: "#/definitions/Thing",
                },
            },
            defaultsAndMinItems: {
                type: "array",
                title: "List and item level defaults",
                minItems: 5,
                default: ["carp", "trout", "bream"],
                items: {
                    type: "string",
                    default: "unidentified",
                },
            },
            nestedList: {
                type: "array",
                title: "Nested list",
                items: {
                    type: "array",
                    title: "Inner list",
                    items: {
                        type: "string",
                        default: "lorem ipsum",
                    },
                },
            },
            unorderable: {
                title: "Unorderable items",
                type: "array",
                items: {
                    type: "string",
                    default: "lorem ipsum",
                },
                $vf_opt: {
                    option: {
                        orderable: false,
                    },
                },
            },
            unremovable: {
                title: "Unremovable items",
                type: "array",
                items: {
                    type: "string",
                    default: "lorem ipsum",
                },
                $vf_opt: {
                    option: {
                        removable: false,
                    },
                },
            },
            noToolbar: {
                title: "No add, remove and order buttons",
                type: "array",
                items: {
                    type: "string",
                    default: "lorem ipsum",
                },
                $vf_opt: {
                    option: {
                        appendable: false,
                        orderable: false,
                        removable: false,
                    },
                },
            },
            fixedNoToolbar: {
                title: "Fixed array without buttons",
                type: "array",
                items: [
                    {
                        title: "A number",
                        type: "number",
                        default: 42,
                    },
                    {
                        title: "A boolean",
                        type: "boolean",
                        default: false,
                    },
                ],
                additionalItems: {
                    title: "A string",
                    type: "string",
                    default: "lorem ipsum",
                },
                $vf_opt: {
                    option: {
                        appendable: false,
                        orderable: false,
                        removable: false,
                    },
                },
            },
        },
    },
    defaultValue: {
        listOfStrings: ["foo", "bar"],
        multipleChoicesList: ["foo", "bar"],
        fixedItemsList: ["Some text", true, 123],
        nestedList: [["lorem", "ipsum"], ["dolor"]],
        unorderable: ["one", "two"],
        unremovable: ["one", "two"],
        noToolbar: ["one", "two"],
        fixedNoToolbar: [42, true, "additional item one", "additional item two"],
    },
};
