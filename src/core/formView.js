import React, { Component } from "react";
import { isUndefined, deepClone, isEqual } from "../vendor/lodash";

export default class FormView extends Component {
    constructor(props) {
        super(props);
        const { dataSource } = props;
        const { underControl, value } = dataSource;
        if (!underControl) {
            this.state = { value: deepClone(value) };
        }
    }

    componentWillReceiveProps(nextProps) {
        const { dataSource } = this.props;
        const { dataSource: nextDataSource } = nextProps;
        const { underControl, value } = dataSource;
        const { underControl: nextUnderControl, value: nextValue } = nextDataSource;

        if (underControl && !nextUnderControl) {
            this.state.value = deepClone(nextValue);
        }

        if (!underControl) {
            if (!isEqual(value, nextValue)) {
                this.state.value = deepClone(nextValue);
            }
        }
    }

    render() {
        const { dataSource } = this.props;
        const { component: Com, children, underControl } = dataSource;

        console.info("feat", this.state && this.state.value);

        const childrenDoms = children
            ? children.map(child => <FormView dataSource={child} key={child.domIndex} />)
            : null;

        if (underControl) {
            const { props: viewProps } = dataSource;
            if (childrenDoms) {
                if (Com === null) {
                    return childrenDoms;
                } else if (isUndefined(Com)) {
                    return <div {...viewProps}>{childrenDoms}</div>;
                }
                return <Com {...viewProps}>{childrenDoms}</Com>;
            }
            if (Com === null) {
                return null;
            } else if (isUndefined(Com)) {
                return <div {...viewProps} />;
            }
            return <Com {...viewProps} />;
        } else {
            const { propsMaker } = dataSource;
            const viewProps = propsMaker(this.state.value, value => this.setState({ value }));
            if (childrenDoms) {
                if (Com === null) {
                    return childrenDoms;
                } else if (isUndefined(Com)) {
                    return <div {...viewProps}>{childrenDoms}</div>;
                }
                return <Com {...viewProps}>{childrenDoms}</Com>;
            }
            if (Com === null) {
                return null;
            } else if (isUndefined(Com)) {
                return <div {...viewProps} />;
            }
            return <Com {...viewProps} />;
        }
    }
}
