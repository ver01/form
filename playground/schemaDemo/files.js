module.exports = {
    schema: {
        title: "Files",
        type: "object",
        properties: {
            file: {
                type: "string",
                title: "Single file",
                $vf_opt: {
                    widget: "uploader",
                },
            },
            file2: {
                type: "string",
                title: "Single file(with default value)",
                $vf_opt: {
                    widget: "uploader",
                },
            },
            files: {
                type: "array",
                title: "Multiple files",
                items: {
                    type: "string",
                },
                $vf_opt: {
                    widget: "uploader",
                },
            },
        },
    },
    defaultValue: {
        file2:
            '{"uid":"rc-upload-1551289510108-3","lastModified":1549523727083,"lastModifiedDate":"2019-02-07T07:15:27.083Z","name":"bundle.js","size":7905105,"type":"text/javascript","percent":100,"originFileObj":{"uid":"rc-upload-1551289510108-3"},"status":"done","response":""}',
    },
};
