import { getNodeValue } from "../../utils";
import { scmGetProps, scmGetPropsMaker } from "../tools";

const dsMaker = (dataSource, widget, options, debugInfo) => {
    const value = getNodeValue(options.runtimeValueNode);
    const { debug, underControl } = options;

    debug && console.log("%c%s: %O %o", "color: #999", `[${debugInfo.caller}]`, widget.component, value);

    dataSource.component = widget.component;
    if (underControl) {
        dataSource.props = scmGetProps(widget, options);
    } else {
        const { valueUpdateTree } = options;
        dataSource.propsMaker = scmGetPropsMaker(widget, options);
        dataSource.update = valueUpdateTree.update;
    }
};

export default dsMaker;
