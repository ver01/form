import { leafs } from "./base";
import { isArrayLikeObject } from "../../vendor/lodash";

const RootRender = (widget, coreOpt, formRender) => {
    const { globalKey, debug } = coreOpt;
    if (debug) {
        debug.path = `${debug.path}/Root`;
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

    if (widget.mode === "editorHolder") {
        const { onChange } = coreOpt.handle; // remove other handler
        const child = formRender({ ...coreOpt, handle: { onChange } });
        return leafs(widget, coreOpt, child, globalKey, { holder: true, caller: "Root" });
    }

    let localKey = globalKey;
    let nodeChildren = [];
    const loopLen = (widget.children || []).length || 0;
    for (let index = 0; index < loopLen; index++) {
        const child = widget.children[index];
        const subNodes = RootRender(child, { ...coreOpt, globalKey: localKey }, formRender);
        if (isArrayLikeObject(subNodes)) {
            localKey += subNodes.length;
            nodeChildren = nodeChildren.concat(subNodes);
        } else {
            localKey++;
            nodeChildren.push(subNodes);
        }
    }

    return leafs(widget, coreOpt, nodeChildren, globalKey, { caller: "Root" });
};

export default RootRender;
