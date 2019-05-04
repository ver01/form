import { getNodeValue } from "../../utils";
import dsMaker from "./dsMaker";
import FormRender from "./formRender";

const RootRender = (widget, options) => {
    const { debug, debugObj, runtimeValueNode, dataSource } = options;
    const BYPASS_SCHEMA_HANDLE = true;
    if (debug) {
        if (debugObj.inLoop) {
            debugObj.inLoop = false;
        } else {
            debugObj.path = `${debugObj.path}/Root`;
            console.log("%c%s %cValue:%o", "color:green", debugObj.path, "color:blue", getNodeValue(runtimeValueNode));
        }
    }

    if (widget.mode === "editorHolder") {
        dataSource.children = [{}];
        FormRender({ ...options, dataSource: dataSource.children[0] }, BYPASS_SCHEMA_HANDLE);
        dsMaker(dataSource, widget, options, { holder: true, caller: "Root" });
    } else {
        const loopLen = (widget.children || []).length || 0;
        dataSource.children = [];
        for (let index = 0; index < loopLen; index++) {
            dataSource.children[index] = {};
            debug && (debugObj.inLoop = true);
            RootRender(widget.children[index], {
                ...options,
                dataSource: dataSource.children[index],
            });
        }

        dsMaker(dataSource, widget, options, { caller: "Root" });
    }
};

export default RootRender;
