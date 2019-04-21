import ArrayReapeaterRender from "./arrayRepeater";
import ObjectReapeaterRender from "./objectRepeater";

const RepeaterRender = (widget, options) => {
    const { isArray, isObject } = options;
    const { editor = null, repeater = {} } = widget;
    if (isArray) {
        ArrayReapeaterRender(repeater, options, editor);
    }
    if (isObject) {
        ObjectReapeaterRender(repeater, options, editor);
    }
};

export default RepeaterRender;
