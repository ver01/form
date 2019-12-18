import React from "react";
import { isUndefined } from "lodash";

const View = function(props) {
    const { dataSource } = props;
    const { component: Com, children } = dataSource;

    const childrenDoms = children ? children.map(child => <View dataSource={child} key={child.domIndex} />) : null;

    const { props: viewProps } = dataSource;
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
};

export default View;
