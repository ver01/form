import { getNodeValue } from "../../utils";
import { scmGetProps, scmGetPropsMaker } from "../tools";

const dsMaker = (dataSource, widget, options, debugInfo) => {
    const value = getNodeValue(options.runtimeValueNode);
    const { debug, underControl } = options;

    debug && console.log("%c%s: %O %o", "color: #999", `[${debugInfo.caller}]`, widget.component, value);

    dataSource.component = widget.component;
    dataSource.value = value;
    dataSource.underControl = underControl;
    if (underControl) {
        dataSource.props = scmGetProps(widget, options);
    } else {
        dataSource.propsMaker = scmGetPropsMaker(widget, options);
    }
};

export default dsMaker;
