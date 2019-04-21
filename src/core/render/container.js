import { getNodeValue } from "../../utils";
import RepeaterRender from "./repeater";
import dsMaker from "./dsMaker";

const containerRender = (widget, options, ThemeCache) => {
    const { domIndex, debug, debugObj, runtimeValueNode, dataSource } = options;
    if (debug) {
        if (debugObj.inLoop) {
            debugObj.inLoop = false;
        } else {
            debugObj.path = `${debugObj.path}/Container`;
            console.log("%c%s %cValue:%o", "color:green", debugObj.path, "color:blue", getNodeValue(runtimeValueNode));
        }
    }
    if (widget.mode === "repeaterHolder") {
        RepeaterRender(widget, options, ThemeCache);
        dsMaker(dataSource, widget, options, { holder: true, caller: "Container" });
    } else {
        dataSource.children = [];
        let localIndex = domIndex;
        const loopLen = (widget.children || []).length || 0;
        for (let index = 0; index < loopLen; index++) {
            dataSource.children[index] = {};
            debug && (debugObj.inLoop = true);
            containerRender(
                widget.children[index],
                {
                    ...options,
                    dataSource: dataSource.children[index],
                    domIndex: localIndex,
                },
                ThemeCache
            );
            localIndex += dataSource.children[index].domLength;
        }

        dsMaker(dataSource, widget, options, { caller: "Container" });
    }
};

export default containerRender;
