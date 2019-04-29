import React, { Component } from "react";
import FormRender from "../render/formRender";
import CtrlFormView from "./ctrlFormView";
import dsRebuilder from "../render/dsRebuilder";
import { deepClone, isEqual } from "../../vendor/lodash";

export default class Form extends Component {
    constructor(props) {
        super(props);
        this.changeList = [];
        this.rootRuntimeError = {};
        this.rootControlCache = { valuePath: {} };
    }

    formUpdate() {
        this.forceUpdate();
    }

    componentWillUpdate() {
        this.updating = true;
    }

    componentDidUpdate() {
        this.updating = false;
        if (this.changeList.length) {
            const value = this.changeList.pop();
            this.changeList = [];
            this.onChange(value);
        }
    }

    onChange(value) {
        if (this.updating !== false) {
            this.changeList.push(value);
            return;
        }

        this.props.onChange(value);
    }

    componentWillReceiveProps(nextProps) {
        this.rootRuntimeError = {};
        if (nextProps.shouldUpdate.filter(it => it !== "rootRawReadonlyValue").length) {
            this.rootControlCache = { valuePath: {} };
        }
    }

    render() {
        this.rootRuntimeError = {};

        const { onChange, rootRawReadonlyValue, rootRawReadonlySchema, formProps, formOption, debug } = this.props;

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
                underControl: true,
                valuePath: "#",

                runtimeSchema: rootRuntimeSchema,
                runtimeValueNode: { node: rootRuntimeValueObj, key: "root" },
                parentRuntimeSchema: {},
                parentRuntimeValue: undefined,
                childEditor: null,
                handle: {
                    onChange,
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

        if (!isEqual(rootRuntimeValueObj.root, inValueSnapshot)) {
            this.onChange(rootRuntimeValueObj.root);
        }

        return <CtrlFormView dataSource={dataSource} />;
    }
}