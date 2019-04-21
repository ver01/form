import { getNodeValue } from "../../utils";
import dsMaker from "./dsMaker";

const BaseRender = function(widget, options) {
    const { debug, debugObj, runtimeValueNode, domIndex, arrayIndex, objectKey, dataSource } = options;
    if (debug) {
        if (debugObj.inLoop) {
            debugObj.inLoop = false;
        } else {
            debugObj.path = `${debugObj.path}/Base`;
            console.log("%c%s %cValue:%o", "color:green", debugObj.path, "color:blue", getNodeValue(runtimeValueNode));
        }
    }

    dataSource.children = [];
    let localIndex = domIndex;
    const loopLen = (widget.children || []).length || 0;
    for (let index = 0; index < loopLen; index++) {
        dataSource.children[index] = {};
        debug && (debugObj.inLoop = true);
        BaseRender(widget.children[index], {
            ...options,
            dataSource: dataSource.children[index],
            domIndex: localIndex,
        });
        localIndex += dataSource.children[index].domLength;
    }

    dsMaker(dataSource, widget, options, {
        caller: `Base${arrayIndex === null ? "" : `-${arrayIndex}`}${objectKey === null ? "" : `-${objectKey}`}`,
    });
};
export default BaseRender;
