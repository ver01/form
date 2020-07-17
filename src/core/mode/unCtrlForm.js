import React, { Component } from "react";
import FormRender from "../render/formRender";
import UnCtrlFormView from "./unCtrlFormView";
import dsRebuilder, { dsUpdateAll } from "../render/dsRebuilder";
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
        this.updating = true;
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

    componentDidMount() {
        this.updating = false;
        if (this.changeList.length) {
            const { value, opt } = this.changeList.pop();
            this.changeList = [];
            this.onChange(value, opt);
        }
    }

    componentDidUpdate() {
        this.updating = false;
        if (this.changeList.length) {
            const { value, opt } = this.changeList.pop();
            this.changeList = [];
            this.onChange(value, opt);
        }
    }

    onChangeCall(value, opt) {
        if (this.updating) {
            this.changeList.push({ value, opt });
            return;
        }
        const { formUpdate = "" } = opt || {};

        this.updateReason = formUpdate || "onChange";

        this.setState({
            rootRawReadonlyValue: deepClone(value),
        });
        this.props.onChange(value);
        if (this.props.formProps) {
            const { onValidate } = this.props.formProps;
            if (typeof onValidate === "function") {
                setTimeout((() => {
                    if (Object.keys(this.rootRuntimeError).length) {
                        onValidate(this.rootRuntimeError);
                    } else {
                        onValidate(null);
                    }
                }).bind(this), 300);
            }
        }
    }

    onChange(value, opt) {
        this.onChangeDebounced(value, opt);
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
            if (nextProps.shouldUpdate.includes("onChangeDebounce")) {
                this.onChangeDebounced = debounce(this.onChangeCall, nextProps.onChangeDebounce);
            }
            if (nextProps.shouldUpdate.includes("rootRawReadonlySchema")) {
                this.setState({
                    rootRawReadonlySchema: nextProps.rootRawReadonlySchema,
                });
            }
            if (
                nextProps.shouldUpdate.filter(it => !["rootRawReadonlyValue", "onChangeDebounce"].includes(it)).length
            ) {
                this.rootControlCache = { valuePath: {} };
                this.valueUpdateTree = getValueUpdateTree(nextProps.rootRawReadonlyValue, undefined);
            } else {
                this.valueUpdateTree = getValueUpdateTree(nextProps.rootRawReadonlyValue, this.lastViewValue);
            }
            this.setState({
                rootRawReadonlyValue: deepClone(nextProps.rootRawReadonlyValue),
            });
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (this.updateReason === "onChange") {
            this.valueUpdateTree = getValueUpdateTree(nextState.rootRawReadonlyValue, this.lastViewValue);
            // inside component change
            this.updateReason = "";

            return this.valueUpdateTree.update;
        }
        if (this.updateReason) {
            this.valueUpdateTree = getValueUpdateTree(nextState.rootRawReadonlyValue, undefined);
            this.updateReason = "";
        }
        return true;
    }

    render() {
        this.rootRuntimeError = {};

        const { formProps, formOption, debug, shouldUpdate = [] } = this.props;
        const { rootRawReadonlyValue, rootRawReadonlySchema } = this.state;
        if (this.updateReason) {
            // caused by forceupdate
            this.valueUpdateTree = getValueUpdateTree(rootRawReadonlyValue, undefined);
            // inside component change
            this.updateReason = "";
        }

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
        if (shouldUpdate.includes("rootRawReadonlySchema")) {
            dsUpdateAll(dataSource);
        }

        debug && console.info("dataSource", dataSource);

        if (!isEqual(rootRuntimeValueObj.root, inValueSnapshot)) {
            this.onChange(deepClone(rootRuntimeValueObj.root));
        }

        this.lastViewValue = deepClone(rootRuntimeValueObj.root);

        return <UnCtrlFormView dataSource={dataSource} />;
    }
}
