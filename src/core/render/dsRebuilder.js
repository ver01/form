const dsRebuilder = dataSource => {
    if (dataSource.children && dataSource.children.length === 0) {
        delete dataSource.children;
    }

    if (dataSource.children) {
        dataSource.children = [].concat(
            ...dataSource.children.map(child => {
                const ret = dsRebuilder(child);
                if (ret instanceof Array) {
                    return ret;
                }
                return [ret];
            })
        );
        if (!dataSource.children.length) {
            delete dataSource.children;
        } else {
            dataSource.children.map((it, ind) => {
                it.domIndex = ind;
            });
        }
    }

    if (dataSource.component === null) {
        return dataSource.children || [];
    }

    return dataSource;
};

export default dsRebuilder;
