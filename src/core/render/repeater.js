import ArrayReapeaterRender from "./arrayRepeater";
import ObjectReapeaterRender from "./objectRepeater";

const RepeaterRender = (widget, options, ThemeCache) => {
    const { isArray, isObject } = options;
    const { editor = null, repeater = {} } = widget;
    if (isArray) {
        ArrayReapeaterRender(repeater, options, editor, ThemeCache);
    }
    if (isObject) {
        ObjectReapeaterRender(repeater, options, editor, ThemeCache);
    }
};

export default RepeaterRender;
