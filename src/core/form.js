import React, { Component } from "react";
import FormRender from "./render/formRender";
import FormView from "./formView";
import dsRebuilder from "./render/dsRebuilder";
import { deepClone, isEqual, isUndefined, isEqualWith, isPlainObject, isArrayLikeObject } from "../vendor/lodash";

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

        const { value, defaultValue, schema = {}, option = {}, debug = false } = props;
        let underControl = isUndefined(value) ? (isUndefined(defaultValue) ? null : false) : true;

        this.state = {
            underControl,
            rootRawReadonlySchema: schema,
            rootRawReadonlyValue: underControl ? value : defaultValue,
            formOption: option,
        };

        this.rootRuntimeSchema = deepClone(schema); // Generate By Render
        this.rootRuntimeValueObj = { root: underControl ? deepClone(value) : deepClone(defaultValue) }; // Generate By Render
        this.rootRuntimeCache = {};
        this.rootUpdateTree = {};
        this.rootControlCache = { valuePath: {} };

        this.viewValueObj = { root: undefined };

        if (debug) {
            console.log("%c%s", "color:blue", "■ init ==========================================================");
            console.log("%c%s %o", "color:#999999", "Value: ", this.state.rootRawReadonlyValue);
            console.log("%c%s %o", "color:#999999", "Schema: ", this.state.rootRawReadonlySchema);
        }

        this.shouldUpdate = false;

        this.changeList = [];
        this.updating = true;
    }

    componentWillReceiveProps(nextProps) {
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

        // formOption
        if (!isEqual(newOption, option)) {
            newState.formOption = newOption;
            this.shouldUpdate = true;
        }

        // formProps
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
            console.log("%c%s", "color:blue", `■ ${change} ==========================================================`);
            console.log("%c%s %o", "color:#999999", "Value: ", this.state.rootRawReadonlyValue);
            console.log("%c%s %o", "color:#999999", "Schema: ", this.state.rootRawReadonlySchema);
        }
        this.shouldUpdate = false;

        // to boolean
        return !!change;
    }

    componentWillUpdate() {
        this.updating = true;
    }

    componentDidUpdate() {
        this.updating = false;
        const obj = this.changeList.pop();
        if (obj) {
            this.changeList = [];
            this.onChange(obj);
        }
    }

    onChange(obj) {
        const { value } = obj;
        if (this.updating) {
            this.changeList.push(obj);
            return;
        }

        const { debug, onChange } = this.props;
        debug &&
            console.log(
                "%c%s%o",
                "color:red",
                "■ onChange ==========================================================",
                value
            );
        onChange && onChange(deepClone(value));
    }

    formUpdate(action) {
        this.shouldUpdate = action;
        this.forceUpdate();
    }

    render() {
        this.rootRuntimeError = {};
        // this.rootRenderTree = getValueChange(this.viewValueObj.root, this.rootRuntimeValueObj.root);

        const { underControl, rootRawReadonlySchema, rootRawReadonlyValue, formOption } = this.state;
        const { rootRuntimeSchema, rootRuntimeValueObj, rootRuntimeError, props: formProps, rootControlCache } = this;

        let dataSource = {};

        const THE_ROOT = true;
        const NOT_BYPASS_SCHEMA_HANDLE = false;

        const { debug } = this.props;
        if (debug) {
            console.log("%c%s", "color:#666666", "■ render ========================================================");
            console.log("%c%s %o", "color:#999999", "UnderControl: ", `${this.state.underControl}`);
            console.log("%c%s %o", "color:#999999", "ViewValue: ", this.viewValueObj.root);
            console.log("%c%s %o", "color:#999999", "Value: ", rootRuntimeValueObj.root);
            console.log("%c%s %o", "color:#999999", "Schema: ", rootRuntimeSchema);
        }

        if (debug) {
            console.log("%c%s", "color:#666666", "■ formRender =====================================================");
        }

        FormRender(
            {
                rootRawReadonlySchema,
                rootRuntimeSchema,
                rootRawReadonlyValue,
                rootRuntimeValue: rootRuntimeValueObj.root,
                rootRuntimeError,
                formProps,
                formOption,
                rootControlCache,
                dataSource,
                underControl,
                valuePath: "#",

                runtimeSchema: rootRuntimeSchema,
                runtimeValueNode: { node: rootRuntimeValueObj, key: "root" },
                parentRuntimeSchema: {},
                parentRuntimeValue: undefined,
                childEditor: null,
                handle: {
                    onChange: (value, option) => this.onChange({ value, option }),
                },
                objectKey: null,
                arrayIndex: null,

                formUpdate: this.formUpdate.bind(this),

                debug,
                debugObj: {
                    path: "#",
                },
            },
            NOT_BYPASS_SCHEMA_HANDLE,
            THE_ROOT
        );

        dataSource = dsRebuilder(dataSource);

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
            this.onChange({ value: this.rootRuntimeValueObj.root });
            this.viewValueObj.root = deepClone(this.rootRuntimeValueObj.root);
        }

        return <FormView dataSource={dataSource} />;
    }
}
