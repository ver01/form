import { Component } from "react";
import PropTypes from "prop-types";
import FormRender from "./render";
import { deepClone, isEqual, isEqualWith } from "../vendor/lodash";
import { getValueChange } from "../utils";

const defaultSchema = null;
const defaultOption = {};
const defaultChange = {
    schema: false,
    value: false,
    option: false,
    other: false,
    underControl: false,
    pathUpdate: false,
};

export default class Form extends Component {
    static defaultProps = {
        schema: defaultSchema,
        option: defaultOption,
    };

    constructor(props) {
        super(props);

        const { schema = defaultSchema, option = defaultOption, value, defaultValue } = props;
        const keys = Object.keys(props);
        let underControl = keys.includes("value") || !keys.includes("defaultValue") || undefined;

        this.state = {
            schema,
            option,
            value: underControl ? deepClone(value) : deepClone(defaultValue),
            underControl,
            cache: {},
        };

        this.change = { ...defaultChange };
        this.changeList = [];
        this.updating = true;
        props.debug && console.log("%c%s", "color:blue", "==== by init");
    }

    componentWillReceiveProps(nextProps) {
        this.change = { ...defaultChange };

        const {
            value: newValue,
            defaultValue: newDefaultValue,
            schema: newSchema = defaultSchema,
            option: newOption = defaultOption,
            ...newOther
        } = nextProps;
        const { value, defaultValue, schema = defaultSchema, option = defaultOption, ...other } = this.props;

        const newState = {};

        // schema change?
        if (!isEqual(newSchema, schema)) {
            newState.schema = newSchema;
            this.change.schema = true;
            this.change.underControl = true;
            this.change.value = true;
        }

        if (typeof nextProps.value !== "undefined") {
            newState.underControl = true;
            if (this.state.underControl !== true) {
                this.change.underControl = true;
            }
        } else if (typeof nextProps.defaultValue !== "undefined") {
            newState.underControl = false;
            if (this.state.underControl !== false) {
                this.change.underControl = true;
            }
        }
        if (!this.change.underControl) {
            delete newState.underControl;
        } else {
            this.viewValue = undefined; // refresh component control mode;
        }

        // option Change?
        if (!isEqual(newOption, option)) {
            this.change.option = true;
            newState.option = newOption;
        }

        // value change
        if (this.change.schema) {
            // new Form
            newState.value = newState.underControl ? newValue : newDefaultValue;
        } else if (Object.keys(newState).includes("underControl") ? newState.underControl : this.state.underControl) {
            // underControl
            if (!isEqual(this.state.value, newValue)) {
                newState.value = newValue;
                this.change.value = true;
            }
        } else if (this.change.underControl) {
            // underControl is unkonw && first recieve defaultValue
            newState.value = newState.underControl ? newValue : newDefaultValue;
            this.change.value = true;
        }

        if (Object.keys(newState).length) {
            if (this.change.value) {
                newState.value = deepClone(newState.value);
            }
            if (this.change.schema) {
                newState.cache = {
                    ...this.state.cache,
                    valuePath: {},
                };
            }
            this.setState(newState);
        }

        if (!isEqual(newOther, other)) {
            this.change.other = isEqualWith(newOption, other, (newV, oldV) => {
                if (typeof newV === "function") {
                    if (typeof oldV === "function") {
                        return newV.toString() === oldV.toString();
                    } else {
                        return false;
                    }
                } else {
                    return isEqual(newV, oldV);
                }
            });
        }

        // forceupdate
        if (this.updatePath) {
            this.change.pathUpdate = true;
        }
    }

    shouldComponentUpdate(nextProps) {
        if (nextProps.debug) {
            const renderReason = `${Object.keys(this.change)
                .filter(key => this.change[key])
                .join(",")}`;
            if (renderReason) {
                console.log("%c%s", "color:blue", `==== by ${renderReason}`);
            }
        }
        const change = Object.keys(this.change).some(key => this.change[key]);
        this.change = { ...defaultChange };
        return change;
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
        const { value, equaled, updatePath } = obj;
        if (this.updating) {
            this.changeList.push(obj);
            return;
        }
        if (equaled === true) {
            return;
        }
        if (equaled === false || !isEqual(value, this.state.value)) {
            this.props.onChange && this.props.onChange(deepClone(value));
            if (!this.state.underControl) {
                this.state.value = deepClone(value); // not trigger update, just save value
                if (updatePath) {
                    this.updatePath =
                        updatePath
                            .split("/")
                            .slice(0, -1)
                            .join("/") || "#";
                    this.forceUpdate();
                }
            }
        }
    }

    cacheUpdate(type, key, obj, forceUpdate = false) {
        if (this.state.cache[type][key]) {
            Object.assign(this.state.cache[type][key], obj);
        } else {
            this.state.cache[type][key] = { ...obj };
        }
        if (forceUpdate) {
            this.forceUpdate();
        }
    }

    cacheRemove(type, key, forceUpdate = false) {
        if (this.state.cache[type][key]) {
            delete this.state.cache[type][key];
            if (forceUpdate) {
                this.forceUpdate();
            }
        }
    }

    render() {
        const { value, underControl, schema, cache } = this.state;

        const valueChangeTree = getValueChange(this.viewValue, value);
        this.props.debug && console.info("==== render ====", this.viewValue, value, valueChangeTree);
        this.viewValue = deepClone(value);

        const form = FormRender({
            underControl,
            schema: deepClone(schema),
            value: this.viewValue,
            onChange: (value, opt) => this.onChange({ value, ...opt }),
            // runtime Value
            runtime: {
                valueParent: this,
                valueKey: "viewValue",
            },
            // control
            isRoot: true,
            globalKey: 0,
            valuePath: "#",
            // rootOpt
            formOption: this.props.option,
            formProps: this.props,
            // render Ctrl
            changeTree: valueChangeTree,
            updatePath: this.updatePath,
            cache,
            cacheUpdate: this.cacheUpdate.bind(this),
            cacheRemove: this.cacheRemove.bind(this),
            ...(this.props.debug
                ? {
                      debug: {
                          path: "#",
                          inLoop: false,
                      },
                  }
                : {}),
        });

        if (typeof this.state.value === "undefined") {
            // no trigger onChange when schema generator value with no value input
            this.state.value = this.viewValue;
        } else if (!isEqual(this.viewValue, this.state.value)) {
            this.onChange({ value: this.viewValue, equaled: false });
        }
        this.updatePath = "";
        return form;
    }
}
if (process.env.NODE_ENV !== "production") {
    Form.propTypes = {
        schema: PropTypes.any,
        value: PropTypes.any,
        defaultValue: PropTypes.any,
        validators: PropTypes.object,
        onChange: PropTypes.func,
        onHandle: PropTypes.func, // export handle
        option: PropTypes.object.isRequired,
    };
}
