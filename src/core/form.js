import React, { Component } from "react";
import CtrlForm from "./mode/ctrlForm";
import UnCtrlForm from "./mode/unCtrlForm";
import { deepClone, isEqual, isUndefined, isNumber } from "../vendor/lodash";
import { isEqualWithFunction } from "../utils";

export default class Form extends Component {
    constructor(props) {
        super(props);

        const { value, defaultValue, schema = {}, option = {}, onChangeDebounce = 0 } = props;
        let underControl = isUndefined(value) ? (isUndefined(defaultValue) ? null : false) : true;

        this.state = {
            underControl,
            rootRawReadonlySchema: schema,
            rootRawReadonlyValue: underControl ? value : defaultValue,
            formOption: option,
            shouldUpdate: ["init"],
            onChangeDebounce,
        };
        this.changeList = [];
        this.inValueSnapshot = deepClone(this.state.rootRawReadonlyValue);
    }

    componentWillReceiveProps(nextProps) {
        const {
            value: newValue,
            defaultValue: newDefaultValue,
            schema: newSchema = null,
            option: newOption = {},
            onChangeDebounce: newOnChangeDebounce,
            ...newOther
        } = nextProps;
        const { value, defaultValue, schema = null, option = {}, onChangeDebounce, ...other } = this.props;
        const newState = {};
        let shouldUpdate = [];

        // underControl, rootRawReadonlyValue
        switch (this.state.underControl) {
            case true:
                if (!isEqual(newValue, value)) {
                    newState.rootRawReadonlyValue = newValue;
                    if (!isEqual(this.inValueSnapshot, newState.rootRawReadonlyValue)) {
                        shouldUpdate.push("rootRawReadonlyValue");
                    }
                }
                break;
            case false:
                if (!isEqual(newDefaultValue, defaultValue)) {
                    newState.rootRawReadonlyValue = newDefaultValue;
                    if (!isEqual(this.inValueSnapshot, newState.rootRawReadonlyValue)) {
                        shouldUpdate.push("rootRawReadonlyValue");
                    }
                }
                break;
            default:
                if (!isUndefined(newValue)) {
                    newState.underControl = true;
                    newState.rootRawReadonlyValue = newValue;
                    if (!isEqual(this.inValueSnapshot, newState.rootRawReadonlyValue)) {
                        shouldUpdate.push("underControl");
                        shouldUpdate.push("rootRawReadonlyValue");
                    }
                } else if (!isUndefined(newDefaultValue)) {
                    newState.underControl = false;
                    newState.rootRawReadonlyValue = newDefaultValue;
                    if (!isEqual(this.inValueSnapshot, newState.rootRawReadonlyValue)) {
                        shouldUpdate.push("underControl");
                        shouldUpdate.push("rootRawReadonlyValue");
                    }
                }
                break;
        }

        // rootRawReadonlySchema
        if (!isEqualWithFunction(newSchema, schema)) {
            newState.rootRawReadonlySchema = newSchema;
            shouldUpdate.push("rootRawReadonlySchema");
        }

        // formOption
        if (!isEqualWithFunction(newOption, option)) {
            newState.formOption = newOption;
            shouldUpdate.push("formOption");
        }

        // formProps
        if (!isEqualWithFunction(newOther, other)) {
            shouldUpdate = true;
            shouldUpdate.push("formProps");
        }

        // onChangeDebounce
        if (isNumber(newOnChangeDebounce) && onChangeDebounce !== newOnChangeDebounce) {
            shouldUpdate.push("onChangeDebounce");
            newState.onChangeDebounce = newOnChangeDebounce;
        }

        if (shouldUpdate.length) {
            newState.shouldUpdate = shouldUpdate;
            this.setState(newState);
        } else {
            this.setState({ shouldUpdate: [] });
        }
    }

    shouldComponentUpdate(nextProps, nextStatus) {
        const { shouldUpdate } = nextStatus;

        return shouldUpdate ? true : false;
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

    onChange(value) {
        if (this.updating !== false) {
            this.changeList.push(value);
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

        if (!this.state.underControl) {
            this.inValueSnapshot = deepClone(value);
        }
        onChange && onChange(deepClone(value));
    }

    render() {
        const {
            underControl,
            rootRawReadonlySchema,
            rootRawReadonlyValue,
            formOption,
            onChangeDebounce,
            shouldUpdate,
        } = this.state;
        const { debug } = this.props;

        if (debug) {
            console.log(
                "%c%s",
                "color:blue",
                `■ ${shouldUpdate.join(",")} ==========================================================`
            );
            console.log("%c%s %o", "color:#999999", "Value: ", rootRawReadonlyValue);
            console.log("%c%s %o", "color:#999999", "Schema: ", rootRawReadonlySchema);
        }

        return underControl ? (
            <CtrlForm
                onChange={this.onChange.bind(this)}
                rootRawReadonlyValue={rootRawReadonlyValue}
                rootRawReadonlySchema={rootRawReadonlySchema}
                formOption={formOption}
                formProps={this.props}
                debug={debug}
                shouldUpdate={shouldUpdate}
            />
        ) : (
            <UnCtrlForm
                onChange={this.onChange.bind(this)}
                rootRawReadonlyValue={rootRawReadonlyValue}
                rootRawReadonlySchema={rootRawReadonlySchema}
                formOption={formOption}
                formProps={this.props}
                debug={debug}
                shouldUpdate={shouldUpdate}
                onChangeDebounce={onChangeDebounce}
            />
        );
    }
}
