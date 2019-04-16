export function getValueByAbsolutePath(value, absoluteSchemaPath) {
    if (!value || typeof absoluteSchemaPath !== "string") {
        return null;
    }
    const paths = absoluteSchemaPath.split("/");
    if (paths[0]) {
        // only absolute path support
        return null;
    }
    let v = value;
    for (let index = 1; index < paths.length; index++) {
        let path = paths[index];
        if (path === "properties") {
            index++;
            if (index >= paths.length) {
                return null;
            }
            path = paths[index];
            if (path && value[path]) {
                v = value;
            } else {
                return null;
            }
        }
    }
    return v;
}
