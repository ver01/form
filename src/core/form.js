import React, { Component } from "react";
import FormRender from "./render/formRender";
import FormView from "./render/formView";
import { deepClone, isEqual, isUndefined, isEqualWith, isPlainObject, isArrayLikeObject } from "../vendor/lodash";
import { getValueChange } from "../utils";

const compare = (newV, oldV) => {
    if (typeof newV === "function") {
        if (typeof oldV === "function") {
            return newV.toString() === oldV.toString();
        }
        return false;
    } else if (isPlainObject(newV)) {
        if (isPlainObject(oldV)) {
            const keys = Object.keys(newV);
            return !keys.some(key => !isEqualWithDeep(newV[key], oldV[key], compare));
        }
        return false;
    } else if (isArrayLikeObject(newV)) {
        if (isArrayLikeObject(oldV)) {
            return !newV.some((v, ind) => !isEqualWithDeep(v, oldV[ind], compare));
        }
        return false;
    }
    return isEqual(newV, oldV);
};
const isEqualWithDeep = (newOther, other) => isEqualWith(newOther, other, compare);

export default class Form extends Component {
    constructor(props) {
        super(props);

        const { value, defaultValue, schema = null, option = {}, debug = false } = props;
        let underControl = isUndefined(value) ? (isUndefined(defaultValue) ? null : false) : true;

        this.state = {
            underControl,
            rootRawReadonlySchema: schema,
            rootRawReadonlyValue: underControl ? value : defaultValue,
            rootOption: option,
        };

        this.rootRuntimeSchema = deepClone(schema); // Generate By Render
        this.rootRuntimeValueObj = { root: underControl ? deepClone(value) : deepClone(defaultValue) }; // Generate By Render
        this.rootRuntimeCache = {};
        this.rootUpdateTree = {};
        this.rootControlCache = { valuePath: {} };

        this.viewValueObj = { root: undefined };

        this.shouldUpdate = "init";

        debug && console.log("%c%s", "color:blue", `==== by ${this.shouldUpdate}`);
    }

    componentWillReceiveProps(nextProps) {
        this.shouldUpdate = false;

        const {
            value: newValue,
            defaultValue: newDefaultValue,
            schema: newSchema = null,
            option: newOption = {},
            ...newOther
        } = nextProps;
        const { value, defaultValue, schema = null, option = {}, ...other } = this.props;
        const newState = {};

        // underControl, rootRawReadonlyValue
        switch (this.state.underControl) {
            case true:
                if (!isEqual(newValue, value)) {
                    newState.rootRawReadonlyValue = newValue;
                    if (!isEqual(newState.rootRawReadonlyValue, this.viewValueObj.root)) {
                        this.shouldUpdate = true;
                        this.rootRuntimeValueObj = { root: deepClone(newValue) };
                        this.viewValueObj = { root: deepClone(newValue) };
                    }
                }
                break;
            case false:
                if (!isEqual(newDefaultValue, defaultValue)) {
                    newState.rootRawReadonlyValue = newDefaultValue;
                    if (!isEqual(newState.rootRawReadonlyValue, this.viewValueObj.root)) {
                        this.shouldUpdate = true;
                        this.rootRuntimeValueObj = { root: deepClone(newDefaultValue) };
                        this.viewValueObj = { root: deepClone(newDefaultValue) };
                    }
                }
                break;
            default:
                if (!isUndefined(newValue)) {
                    newState.underControl = true;
                    newState.rootRawReadonlyValue = newValue;
                    if (!isEqual(newState.rootRawReadonlyValue, this.viewValueObj.root)) {
                        this.shouldUpdate = true;
                        this.rootRuntimeValueObj = { root: deepClone(newValue) };
                        this.viewValueObj = { root: deepClone(newValue) };
                    }
                } else if (!isUndefined(defaultValue)) {
                    newState.underControl = false;
                    newState.rootRawReadonlyValue = newDefaultValue;
                    if (!isEqual(newState.rootRawReadonlyValue, this.viewValueObj.root)) {
                        this.shouldUpdate = true;
                        this.rootRuntimeValueObj = { root: deepClone(newDefaultValue) };
                        this.viewValueObj = { root: deepClone(newDefaultValue) };
                    }
                }
                break;
        }

        // rootRawReadonlySchema
        if (!isEqual(newSchema, schema)) {
            newState.rootRawReadonlySchema = newSchema;
            this.shouldUpdate = true;
            this.rootRuntimeSchema = deepClone(newSchema);
        }

        // rootOption
        if (!isEqual(newOption, option)) {
            newState.rootOption = newOption;
            this.shouldUpdate = true;
        }

        // rootProps
        if (!isEqualWithDeep(newOther, other)) {
            this.shouldUpdate = true;
        }

        const changeKeys = Object.keys(newState);

        if (changeKeys.length) {
            this.setState(newState);
        }
        if (this.shouldUpdate) {
            this.shouldUpdate = changeKeys.join(", ");
        }
    }

    shouldComponentUpdate(nextProps) {
        const change = this.shouldUpdate;
        if (nextProps.debug && change) {
            console.log("%c%s", "color:blue", `==== by ${change}`);
        }
        this.shouldUpdate = false;

        // to boolean
        return !!change;
    }

    render() {
        const { debug } = this.props;
        debug &&
            console.log(
                "%s%c%s%s%o",
                "render: underControl(",
                `color:${
                    this.state.underControl === true ? "blue" : this.state.underControl === false ? "green" : "red"
                }`,
                `${this.state.underControl}`,
                ")",
                this.rootRuntimeValueObj.root,
                this.viewValueObj.root
            );

        this.rootRuntimeError = {};
        this.rootRenderTree = getValueChange(this.viewValueObj.root, this.rootRuntimeValueObj.root);

        const { underControl, rootRawReadonlySchema, rootRawReadonlyValue, rootOption } = this.state;
        const {
            rootRuntimeSchema,
            rootRuntimeValueObj,
            rootRuntimeError,
            props: rootProps,
            rootControlCache,
            rootRenderTree,
        } = this;

        const dataSource = {};

        FormRender({
            rootRawReadonlySchema,
            rootRuntimeSchema,
            rootRawReadonlyValue,
            rootRuntimeValue: rootRuntimeValueObj.root,
            rootRuntimeError,
            rootProps,
            rootOption,
            rootControlCache,
            rootRenderTree,
            debug,
            dataSource,
            valuePath: "#",

            schema: rootRuntimeSchema,
            valueNode: { node: rootRuntimeValueObj, key: "root" },
        });

        debug && console.info("dataSource", dataSource);

        switch (underControl) {
            case true:
                break;
            case false:
                break;
            default:
                break;
        }

        if (!isEqual(this.rootRuntimeValueObj.root, this.viewValueObj.root)) {
            this.viewValueObj.root = deepClone(this.rootRuntimeValueObj.root);
        }

        return <FormView dataSource={dataSource} />;
    }
}
