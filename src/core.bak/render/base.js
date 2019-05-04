import React from "react";
import { scmGetProps } from "../tools";
import LeafHoc from "../hoc/leaf";
import { isArrayLikeObject } from "../../vendor/lodash";

export const leafs = (widget, coreOpt, children, key, option = {}) => {
    const { holder = false, caller = "" } = option;
    const { changeTree = {}, debug, forceUpdate } = coreOpt;
    const { hasChange = true } = changeTree;
    const props = {
        propsGenerator: scmGetProps(widget, coreOpt),
        hasChange,
        forceUpdate,
        value: coreOpt.value,
        underControl: coreOpt.underControl,
        key,
        handle: {
            ...coreOpt.handle,
        },
        debug,
    };

    if (holder || widget.children) {
        if (widget.component) {
            return (
                <LeafHoc componet={widget.component} {...props} caller={`H-${caller}`}>
                    {children}
                </LeafHoc>
            );
        }
        return children;
    } else if (widget.component) {
        return <LeafHoc componet={widget.component} {...props} caller={`L-${caller}`} />;
    }

    return null;
};

const BaseRender = function(widget, coreOpt) {
    const { globalKey, debug } = coreOpt;
    if (debug) {
        if (debug.inLoop) {
            debug.inLoop = false;
        } else {
            debug.path = `${debug.path}/Base`;
            console.log(
                "%c%s %cChange:%o %cValue:%o",
                "color:green",
                debug.path,
                "color:blue",
                coreOpt.changeTree,
                "color:blue",
                coreOpt.value
            );
        }
    }

    let localKey = globalKey;
    let nodeChildren = [];
    const loopLen = (widget.children || []).length || 0;
    for (let index = 0; index < loopLen; index++) {
        const child = widget.children[index];
        debug && (debug.inLoop = true);
        const subNodes = BaseRender(child, { ...coreOpt, globalKey: localKey });
        if (isArrayLikeObject(subNodes)) {
            localKey += subNodes.length;
            nodeChildren = nodeChildren.concat(subNodes);
        } else {
            localKey++;
            nodeChildren.push(subNodes);
        }
    }

    return leafs(widget, coreOpt, nodeChildren, globalKey, {
        caller: `Base-${coreOpt.arrayIndex === null ? "" : coreOpt.arrayIndex}${
            coreOpt.objectKey === null ? "" : coreOpt.objectKey
        }`,
    });
};
export default BaseRender;
