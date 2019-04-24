import React from "react";
import { isUndefined } from "../vendor/lodash";

const FormView = props => {
    const { component: Com, children, props: viewProps } = props.dataSource;
    const childrenDoms = children ? children.map(child => <FormView dataSource={child} key={child.domIndex} />) : null;

    let ret = null;
    if (childrenDoms) {
        if (Com === null) {
            ret = childrenDoms;
        } else if (isUndefined(Com)) {
            ret = <div {...viewProps}>{childrenDoms}</div>;
        } else {
            ret = <Com {...viewProps}>{childrenDoms}</Com>;
        }
    } else {
        if (Com === null) {
            ret = null;
        } else if (isUndefined(Com)) {
            ret = <div {...viewProps} />;
        } else {
            ret = <Com {...viewProps} />;
        }
    }
    return ret;
};

export default FormView;
