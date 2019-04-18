import RepeaterRender from "./repeater";
import { leafs } from "./base";
import { isArrayLikeObject } from "../../vendor/lodash";

const containerRender = (widget, coreOpt, formRender) => {
    const { globalKey, debug } = coreOpt;
    if (debug) {
        if (debug.inLoop) {
            debug.inLoop = false;
        } else {
            debug.path = `${debug.path}/Container`;
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

    if (widget.mode === "repeaterHolder") {
        const children = RepeaterRender(widget, coreOpt, formRender);
        return leafs(widget, coreOpt, children, globalKey, { holder: true, caller: "Container" });
    }

    let localKey = globalKey;
    let nodeChildren = [];
    const loopLen = (widget.children || []).length || 0;
    for (let index = 0; index < loopLen; index++) {
        const child = widget.children[index];
        debug && (debug.inLoop = true);
        const subNodes = containerRender(child, { ...coreOpt, globalKey: localKey }, formRender);
        if (isArrayLikeObject(subNodes)) {
            localKey += subNodes.length;
            nodeChildren = nodeChildren.concat(subNodes);
        } else {
            localKey++;
            nodeChildren.push(subNodes);
        }
    }

    return leafs(widget, coreOpt, nodeChildren, globalKey, { caller: "Container" });
};

export default containerRender;
