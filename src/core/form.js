import React, { Component } from "react";
import FormRender from "./render/formRender";
import FormView from "./formView";
import dsRebuilder from "./render/dsRebuilder";
import { deepClone, isEqual, isUndefined } from "../vendor/lodash";
import { isEqualWithFunction, getValueUpdateTree } from "../utils";

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
        this.updateTreeObj = {};
        this.rootControlCache = { valuePath: {} };
        this.dataSource = {};

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
        this.updateTreeObj = {};

        // underControl, rootRawReadonlyValue
        switch (this.state.underControl) {
            case true:
                if (!isEqual(newValue, value)) {
                    newState.rootRawReadonlyValue = newValue;
                    this.updateTreeObj = getValueUpdateTree(this.viewValueObj.root, newState.rootRawReadonlyValue);
                    if (this.updateTreeObj.update) {
                        this.shouldUpdate = true;
                        this.rootRuntimeValueObj = { root: deepClone(newValue) };
                        this.viewValueObj = { root: deepClone(newValue) };
                    }
                }
                break;
            case false:
                if (!isEqual(newDefaultValue, defaultValue)) {
                    newState.rootRawReadonlyValue = newDefaultValue;
                    this.updateTreeObj = getValueUpdateTree(this.viewValueObj.root, newState.rootRawReadonlyValue);
                    if (this.updateTreeObj.update) {
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
                    this.updateTreeObj = getValueUpdateTree(this.viewValueObj.root, newState.rootRawReadonlyValue);
                    if (this.updateTreeObj.update) {
                        this.shouldUpdate = true;
                        this.rootRuntimeValueObj = { root: deepClone(newValue) };
                        this.viewValueObj = { root: deepClone(newValue) };
                    }
                } else if (!isUndefined(defaultValue)) {
                    newState.underControl = false;
                    newState.rootRawReadonlyValue = newDefaultValue;
                    this.updateTreeObj = getValueUpdateTree(this.viewValueObj.root, newState.rootRawReadonlyValue);
                    if (this.updateTreeObj.update) {
                        this.shouldUpdate = true;
                        this.rootRuntimeValueObj = { root: deepClone(newDefaultValue) };
                        this.viewValueObj = { root: deepClone(newDefaultValue) };
                    }
                }
                break;
        }

        // rootRawReadonlySchema
        if (!isEqualWithFunction(newSchema, schema)) {
            newState.rootRawReadonlySchema = newSchema;
            this.shouldUpdate = true;
            this.rootRuntimeSchema = deepClone(newSchema);
        }

        // formOption
        if (!isEqualWithFunction(newOption, option)) {
            newState.formOption = newOption;
            this.shouldUpdate = true;
        }

        // formProps
        if (!isEqualWithFunction(newOther, other)) {
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

        if (change && change !== "rootRawReadonlyValue") {
            // rebuild dataSource
            this.dataSource = {};
        }

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

        const { underControl, rootRawReadonlySchema, rootRawReadonlyValue, formOption } = this.state;
        const { rootRuntimeSchema, rootRuntimeValueObj, rootRuntimeError, props: formProps, rootControlCache } = this;

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
                dataSource: this.dataSource,
                underControl,
                valuePath: "#",

                updateTreeObj: this.updateTreeObj,

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

        this.dataSource = dsRebuilder(this.dataSource);

        debug && console.info("dataSource", this.dataSource);

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

        return <FormView dataSource={this.dataSource} />;
    }
}
