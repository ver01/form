import React, { Component } from "react";
import FormRender from "../render/formRender";
import UnCtrlFormView from "./unCtrlFormView";
import dsRebuilder from "../render/dsRebuilder";
import { deepClone, isEqual, debounce } from "../../vendor/lodash";
import { getValueUpdateTree } from "../../utils";

export default class Form extends Component {
    constructor(props) {
        super(props);
        this.state = {
            rootRawReadonlyValue: deepClone(props.rootRawReadonlyValue),
            rootRawReadonlySchema: props.rootRawReadonlySchema,
        };
        this.updateReason = "";
        this.changeList = [];
        this.rootRuntimeError = {};
        this.rootControlCache = { valuePath: {} };
        this.onChangeDebounced = debounce(this.onChangeCall, props.onChangeDebounce);
        this.lastViewValue = undefined;
        this.valueUpdateTree = getValueUpdateTree(this.state.rootRawReadonlyValue, undefined);
    }

    formUpdate(action) {
        this.updateReason = action;
        this.forceUpdate();
    }

    componentWillUpdate() {
        this.updating = true;
    }

    componentDidUpdate() {
        this.updating = false;
        const value = this.changeList.pop();
        if (value) {
            this.changeList = [];
            this.onChange(value);
        }
    }

    onChangeCall(value) {
        if (this.updating) {
            this.changeList.push(value);
            return;
        }

        this.updateReason = "onChange";
        this.setState({
            rootRawReadonlyValue: deepClone(value),
        });
        this.props.onChange(value);
    }

    onChange(value) {
        this.onChangeDebounced(value);
    }

    componentWillReceiveProps(nextProps) {
        this.rootRuntimeError = {};
        if (this.updateReason) {
            switch (this.updateReason) {
                case "onChange":
                    this.valueUpdateTree = getValueUpdateTree(this.state.rootRawReadonlyValue, this.lastViewValue);
                    break;
                default:
                    this.valueUpdateTree = getValueUpdateTree(this.state.rootRawReadonlyValue, undefined);
                    break;
            }
            // inside component change
            this.updateReason = "";
        } else {
            // outside component change
            if (nextProps.shouldUpdate.includes("onChangeDebounced")) {
                this.onChangeDebounced = debounce(this.onChangeCall, nextProps.onChangeDebounce);
            }
            if (nextProps.shouldUpdate.includes("rootRawReadonlyValue")) {
                this.setState({
                    rootRawReadonlyValue: deepClone(nextProps.rootRawReadonlyValue),
                });
            }
            if (nextProps.shouldUpdate.includes("rootRawReadonlySchema")) {
                this.setState({
                    rootRawReadonlySchema: nextProps.rootRawReadonlySchema,
                });
            }
            if (
                nextProps.shouldUpdate.filter(it => !["rootRawReadonlyValue", "onChangeDebounced"].includes(it)).length
            ) {
                this.rootControlCache = { valuePath: {} };
            }
        }
    }

    render() {
        this.rootRuntimeError = {};

        const { formProps, formOption, debug } = this.props;
        const { rootRawReadonlyValue, rootRawReadonlySchema } = this.state;

        const THE_ROOT = true;
        const NOT_BYPASS_SCHEMA_HANDLE = false;

        let dataSource = {};

        const inValueSnapshot = deepClone(rootRawReadonlyValue);
        const rootRuntimeSchema = deepClone(rootRawReadonlySchema);
        const rootRuntimeValueObj = { root: deepClone(rootRawReadonlyValue) };

        FormRender(
            {
                rootRawReadonlySchema,
                rootRuntimeSchema,
                rootRawReadonlyValue,
                rootRuntimeValue: rootRuntimeValueObj.root,
                rootRuntimeError: this.rootRuntimeError,
                formProps,
                formOption,
                rootControlCache: this.rootControlCache,
                dataSource,
                underControl: false,
                valuePath: "#",

                runtimeSchema: rootRuntimeSchema,
                runtimeValueNode: { node: rootRuntimeValueObj, key: "root" },
                parentRuntimeSchema: {},
                parentRuntimeValue: undefined,
                childEditor: null,
                handle: {
                    onChange: this.onChange.bind(this),
                },
                objectKey: null,
                arrayIndex: null,

                formUpdate: this.formUpdate.bind(this),
                valueUpdateTree: this.valueUpdateTree,

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

        if (!isEqual(rootRuntimeValueObj.root, inValueSnapshot)) {
            this.onChange(rootRuntimeValueObj.root);
        }

        this.lastViewValue = deepClone(rootRuntimeValueObj.root);

        return <UnCtrlFormView dataSource={dataSource} />;
    }
}
