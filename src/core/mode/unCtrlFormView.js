import React, { Component } from "react";
import { isUndefined, deepClone } from "../../vendor/lodash";

export default class View extends Component {
    constructor(props) {
        super(props);
        this.state = { value: deepClone(props.dataSource.value) };
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.update === true) {
            if (this.state.value !== nextProps.dataSource.value) {
                this.setState({
                    value: deepClone(nextProps.dataSource.value),
                });
            }
        }
    }

    shouldComponentUpdate(nextProps) {
        return nextProps.dataSource.update ? true : false;
    }

    render() {
        const { dataSource } = this.props;
        const { component: Com, children, propsMaker } = dataSource;

        const viewProps = propsMaker(this.state.value, value => this.setState({ value }));
        const childrenDoms = children ? children.map(child => <View dataSource={child} key={child.domIndex} />) : null;

        if (childrenDoms) {
            if (isUndefined(Com)) {
                return <div {...viewProps}>{childrenDoms}</div>;
            }
            return <Com {...viewProps}>{childrenDoms}</Com>;
        }
        if (isUndefined(Com)) {
            return <div {...viewProps} />;
        }
        return <Com {...viewProps} />;
    }
}
