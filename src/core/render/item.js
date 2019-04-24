import FormRender from "./formRender";
import dsMaker from "./dsMaker";

const ItemRender = (widget, options, renderList = [], isRoot = true) => {
    const { dataSource, debug, debugObj } = options;
    let maker;

    if (widget.mode === "editorHolder") {
        const { onChange } = options.handle; // remove other handler
        dataSource.children = [{}];

        const { childFormRenderOptions } = FormRender({
            ...options,
            dataSource: dataSource.children[0],
            handle: { onChange },
        });
        while ((maker = renderList.pop())) {
            maker(childFormRenderOptions);
        }
        dsMaker(
            dataSource,
            widget,
            { ...options, childFormRenderOptions },
            {
                holder: true,
                caller: "Item",
            }
        );
        return { childFormRenderOptions };
    } else {
        let childFormRenderOptions = null;
        dataSource.children = [];
        const loopLen = (widget.children || []).length || 0;
        for (let index = 0; index < loopLen; index++) {
            dataSource.children[index] = {};
            debug && (debugObj.inLoop = true);
            const ret = ItemRender(
                widget.children[index],
                {
                    ...options,
                    dataSource: dataSource.children[index],
                },
                renderList,
                false
            );
            if (ret.childFormRenderOptions) {
                childFormRenderOptions = ret.childFormRenderOptions;
                while ((maker = renderList.pop())) {
                    maker(childFormRenderOptions);
                }
            }
        }
        if (isRoot) {
            while ((maker = renderList.pop())) {
                maker(childFormRenderOptions);
            }
            dsMaker(
                dataSource,
                widget,
                { ...options, ...(childFormRenderOptions ? { childFormRenderOptions } : {}) },
                { caller: "Item" }
            );
        } else {
            renderList.push(childFormRenderOptions =>
                dsMaker(dataSource, widget, { ...options, childFormRenderOptions }, { caller: "Item" })
            );
        }
        return { childFormRenderOptions };
    }
};

export default ItemRender;
