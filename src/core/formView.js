import React, { Component } from "react";
import { isUndefined } from "../vendor/lodash";

export default class FormView extends Component {
    render() {
        const { dataSource } = this.props;
        const { component: Com, children, props: viewProps } = dataSource;
        const childrenDoms = children
            ? children.map(child => <FormView dataSource={child} key={child.domIndex} />)
            : null;

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
