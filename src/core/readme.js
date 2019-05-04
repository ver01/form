export const coreOption = {
    isRoot: true,

    rootValue: {},
    rootSchema: {},

    parentSchema: {},

    value: {},
    schema: {},

    childEditor: {}, // child editor passed by parent

    objectKey: "a",
    arrayIndex: 3,

    handle: {
        onChange: () => {},
        // for array
        canMoveUp: false,
        canMoveDown: false,
        canAppend: false,
        canRemove: false,
        moveUp: () => {},
        moveDown: () => {},
        append: () => {},
        remove: () => {},
        // for control
        hasSchemaControl: true, // child formnode has SchemaList
        schemaList: [{ schema: {}, valid: true, selected: true }], // no control is null
        schemaSelect: ind => {
            /* aform func */
        },
    },

    schemaOption: {
        // read by schema.$vf_opt.option
        // for array:
        orderable: true,
        removable: true,
        appendable: true,
        // for string:
        disabled: false,
        readonly: false,
        fileHandle: () => {}, // ?
        // for object:
        order: ["key_a", "key_b"],
    },

    formProps: {
        validators: {},
    },

    formOption: {},

    errorObj: {
        // custom
    },
};
export const node = {
    props: {},
    propsMixinList: [],
};
export const validator = {
    value: {},
    ruleValue: {},
    schema: {},
};

export const widget = {
    formatter: () => {},
    normalizer: () => {},
};

export const rootControlCache = {
    valuePath: {
        valuePath: {
            activeSchemaIndex: 0,
            activeSchemaForce: true,
        },
    },
};
