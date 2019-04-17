import React, { Component } from "react";

// const temp = {
//     propsGenerator: scmGetProps(widget, coreOpt),
//     hasChange: hasChange,
//     value: coreOpt.value,
//     underControl: coreOpt.underControl,
//     componet: widget.component,
//     children: children,
// };

export default class LeafHoc extends Component {
    constructor(props) {
        super(props);
        this.state = {
            value: props.value,
            underControl: props.underControl,
        };
        // console.log("%c%s %s: %o", "color: #999", `[${this.props.caller}]`, "init", props.value);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.underControl === true || this.props.underControl !== nextProps.underControl) {
            this.setState({ value: nextProps.value, underControl: nextProps.underControl });
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        // only when value change call render;
        if (this.props.children || this.state.value !== nextState.value) {
            return true;
        } else if (nextProps.underControl === true || this.props.underControl !== nextProps.underControl) {
            return nextProps.hasChange; // has children must update
        }
        return false;
    }

    leafUpdate(value) {
        if (!this.state.underControl && value !== this.state.value) {
            this.setState({
                value,
            });
        }
        this.props.handle.onChange(value);
    }

    render() {
        const { componet: Com, propsGenerator, children, debug } = this.props;
        debug &&
            console.log(
                "%c%s %s: %O %o %o",
                "color: #999",
                `[${this.props.caller}]`,
                "render",
                Com,
                this.state.value,
                this.props.hasChange
            );
        if (children) {
            return (
                <Com
                    {...propsGenerator({
                        value: this.state.value,
                        leafUpdate: this.leafUpdate.bind(this),
                    })}
                >
                    {children}
                </Com>
            );
        }
        return (
            <Com
                {...propsGenerator({
                    value: this.state.value,
                    leafUpdate: this.leafUpdate.bind(this),
                })}
            />
        );
    }
}
