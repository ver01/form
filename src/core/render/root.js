import dsMaker from "./dsMaker";
import FormRender from "./formRender";

const RootRender = (widget, options) => {
    const { domIndex, debug, debugObj, runtimeValueNode, dataSource } = options;
    const BYPASS_SCHEMA_HANDLE = true;
    if (debug) {
        debugObj.path = `${debugObj.path}/Root`;
        console.log("%c%s %cValue:%o", "color:green", debugObj.path, "color:blue", runtimeValueNode);
    }

    if (widget.mode === "editorHolder") {
        FormRender(options, BYPASS_SCHEMA_HANDLE);
        dsMaker(dataSource, widget, options, { holder: true, caller: "Root" });
    } else {
        dataSource.children = [];
        let localIndex = domIndex;
        const loopLen = (widget.children || []).length || 0;
        for (let index = 0; index < loopLen; index++) {
            dataSource.children[index] = {};
            RootRender(dataSource.children[index], { ...options, domIndex: localIndex });
            localIndex += dataSource.children[index].domLength;
        }

        dsMaker(dataSource, widget, options, { caller: "Root" });
    }
};

export default RootRender;
