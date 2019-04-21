import FormRender from "./formRender";
import dsMaker from "./dsMaker";

const ItemRender = (widget, options) => {
    const { domIndex, dataSource, debug, debugObj } = options;

    if (widget.mode === "editorHolder") {
        const { onChange } = options.handle; // remove other handler
        FormRender({ ...options, handle: { onChange } });
        dsMaker(dataSource, widget, options, {
            holder: true,
            caller: "Item",
        });
    } else {
        dataSource.children = [];
        let localIndex = domIndex;
        const loopLen = (widget.children || []).length || 0;
        for (let index = 0; index < loopLen; index++) {
            dataSource.children[index] = {};
            debug && (debugObj.inLoop = true);
            ItemRender(widget.children[index], {
                ...options,
                dataSource: dataSource.children[index],
                domIndex: localIndex,
            });
            localIndex += dataSource.children[index].domLength;
        }
        dsMaker(dataSource, widget, options, { caller: "Item" });
    }
};

export default ItemRender;
