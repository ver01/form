import { getNodeValue } from "../../utils";
import { scmGetProps } from "../tools";

const dsMaker = (dataSource, widget, options, debugInfo) => {
    // todo (noChange logic passby below code)
    options.debug &&
        console.log(
            "%c%s: %O %o",
            "color: #999",
            `[${debugInfo.caller}]`,
            widget.component,
            getNodeValue(options.runtimeValueNode)
        );
    dataSource.component = widget.component;
    dataSource.props = scmGetProps(widget, options);
    dataSource.underControl = options.underControl;
};

export default dsMaker;
