import React, { Component } from "react";
import { render } from "react-dom";
import { UnControlled as CodeMirror } from "react-codemirror2";
import "codemirror/mode/javascript/javascript";

import { getByPath } from "../src/utils";
import { isEqual } from "../src/vendor/lodash";
import { samples } from "./samples";
import Form from "../src";
import antd from "@ver01/form-theme-antd";

import "@ver01/form-theme-antd/lib/index.css";
import "codemirror/lib/codemirror.css";

Form.loadTheme(antd);

const shouldRender = (comp, nextProps, nextState) => {
    const { props, state } = comp;
    return !isEqual(props, nextProps) || !isEqual(state, nextState);
};
class GeoPosition extends Component {
    constructor(props) {
        super(props);
    }

    onChange(name) {
        const { onChange, value } = this.props;
        return event => {
            const newValue = {
                ...value,
                [name]: event.target.value,
            };
            setImmediate(() => onChange(newValue));
        };
    }

    render() {
        const { lat, lon } = this.props.value;
        return (
            <div className="geo" style={{ paddingBottom: "40px" }}>
                <h3>Custom component 1 - By register widget</h3>
                <p>
                    I'm registered as <code>localisation</code> in app.js file. And referenced in
                    <code>schema</code> as the <code>$vf_ext.widget</code> to use for this schema. Custom Component need
                    2 props: <code>props.value</code> and <code>props.onChange</code>
                </p>
                <div className="row">
                    <div className="col-sm-6">
                        <label>Latitude</label>
                        <input
                            className="form-control"
                            type="number"
                            value={lat}
                            step="0.00001"
                            onChange={this.onChange("lat").bind(this)}
                        />
                    </div>
                    <div className="col-sm-6">
                        <label>Longitude</label>
                        <input
                            className="form-control"
                            type="number"
                            value={lon}
                            step="0.00001"
                            onChange={this.onChange("lon").bind(this)}
                        />
                    </div>
                </div>
            </div>
        );
    }
}

const Div = props => <div {...props}>{props.children}</div>;
const Button = props => <button {...props}>{props.children}</button>;
const Input = props => <input {...props} />;

Form.quickLoad("localisation", GeoPosition);

const CustomArray = {
    component: Div,
    children: [
        {
            component: props => <h3>{props.title}</h3>,
            props: {
                $vf_title: ({ schema }) => schema.title,
            },
        },
        {
            mode: "repeaterHolder",
            component: Div,
            repeater: {
                component: Div,
                children: [
                    {
                        mode: "editorHolder",
                        component: null,
                    },
                    {
                        component: Div,
                        children: [
                            {
                                component: Button,
                                props: {
                                    $vf_onClick: ({ handle }) => handle.moveUp,
                                    $vf_children: ["up"],
                                },
                            },
                            {
                                component: Button,
                                props: {
                                    $vf_onClick: ({ handle }) => handle.moveDown,
                                    $vf_children: ["down"],
                                },
                            },
                            {
                                component: Button,
                                props: {
                                    $vf_onClick: ({ handle }) => handle.remove,
                                    $vf_children: ["delete"],
                                },
                            },
                        ],
                    },
                ],
            },
        },
        {
            component: Div,
            children: [
                {
                    component: Button,
                    props: {
                        $vf_onClick: ({ handle }) => handle.append,
                        $vf_children: ["append"],
                    },
                },
            ],
        },
    ],
};

Form.load("custom-array", CustomArray);

const CustomArrayChild = {
    component: Div,
    children: [
        {
            component: props => <h3>{props.title}</h3>,
            props: {
                $vf_title: ({ schema }) => schema.title,
            },
        },
        {
            mode: "repeaterHolder",
            component: Div,
            repeater: {
                component: Div,
                children: [
                    {
                        mode: "editorHolder",
                        component: null,
                    },
                    {
                        component: Div,
                        children: [
                            {
                                component: Button,
                                props: {
                                    $vf_onClick: ({ handle }) => handle.moveUp,
                                    $vf_children: ["up"],
                                },
                            },
                            {
                                component: Button,
                                props: {
                                    $vf_onClick: ({ handle }) => handle.moveDown,
                                    $vf_children: ["down"],
                                },
                            },
                            {
                                component: Button,
                                props: {
                                    $vf_onClick: ({ handle }) => handle.remove,
                                    $vf_children: ["remove"],
                                },
                            },
                        ],
                    },
                ],
            },
            editor: {
                component: Input,
                props: {
                    style: { margin: "20px 0" },
                    $vf_value: ({ value }) => value,
                    $vf_onChange: ({ handle }) => ({ target }) => handle.onChange(target.value),
                    placeholder: "customization",
                },
            },
        },
        {
            component: Div,
            children: [
                {
                    component: Button,
                    props: {
                        $vf_onClick: ({ handle }) => handle.append,
                        $vf_children: ["append"],
                    },
                },
            ],
        },
    ],
};

Form.load("custom-array-and-child", CustomArrayChild);

const CustomArrayChildPartly = {
    component: Div,
    children: [
        {
            component: props => <h3>{props.title}</h3>,
            props: {
                $vf_title: ({ schema }) => schema.title,
            },
        },
        {
            mode: "repeaterHolder",
            component: Div,
            repeater: {
                component: Div,
                children: [
                    {
                        mode: "editorHolder",
                        component: null,
                    },
                    {
                        component: Div,
                        children: [
                            {
                                component: Button,
                                props: {
                                    $vf_onClick: ({ handle }) => handle.moveUp,
                                    $vf_children: ["up"],
                                },
                            },
                            {
                                component: Button,
                                props: {
                                    $vf_onClick: ({ handle }) => handle.moveDown,
                                    $vf_children: ["down"],
                                },
                            },
                            {
                                component: Button,
                                props: {
                                    $vf_onClick: ({ handle }) => handle.remove,
                                    $vf_children: ["remove"],
                                },
                            },
                        ],
                    },
                ],
            },
            editor: [
                {
                    component: Input,
                    editorFor: 0, // index start with 0
                    props: {
                        style: { margin: "20px 0" },
                        $vf_value: ({ value }) => value,
                        $vf_onChange: ({ handle }) => ({ target }) => handle.onChange(target.value),
                        placeholder: "customization",
                    },
                },
                {
                    component: Input,
                    editorFor: 2, // index start with 0
                    props: {
                        style: { margin: "20px 0" },
                        $vf_value: ({ value }) => value,
                        $vf_onChange: ({ handle }) => ({ target }) => handle.onChange(target.value),
                        placeholder: "customization",
                    },
                },
            ],
        },
        {
            component: Div,
            children: [
                {
                    component: Button,
                    props: {
                        $vf_onClick: ({ handle }) => handle.append,
                        $vf_children: ["append"],
                    },
                },
            ],
        },
    ],
};

Form.load("custom-array-and-child-partly", CustomArrayChildPartly);

const CustomObject = {
    component: Div,
    children: [
        {
            component: props => <h3>{props.title}</h3>,
            props: {
                $vf_title: ({ schema }) => schema.title,
            },
        },
        {
            mode: "repeaterHolder",
            component: null,
            repeater: {
                component: Div,
                children: [
                    {
                        component: props => (
                            <div>
                                <label>{props.title}</label>
                            </div>
                        ),
                        props: {
                            $vf_title: ({ schema }) => schema.title,
                        },
                    },
                    {
                        mode: "editorHolder",
                        component: null,
                    },
                    {
                        component: ({ errors }) => (errors ? errors.message : null),
                        props: {
                            $vf_errors: ({ errorObj }) => errorObj,
                        },
                    },
                ],
            },
            editor: [
                {
                    component: Input,
                    editorFor: "age", // only for integer
                    props: {
                        style: { margin: "20px 0" },
                        $vf_value: ({ value }) => value,
                        $vf_onChange: ({ handle }) => ({ target }) => {
                            if (!Number.isNaN(Number(target.value))) {
                                handle.onChange(Number(target.value));
                            } else {
                                handle.onChange(target.value);
                            }
                        },
                        placeholder: "customization",
                    },
                },
                {
                    component: Input,
                    props: {
                        style: { margin: "20px 0" },
                        $vf_value: ({ value }) => value,
                        $vf_onChange: ({ handle }) => ({ target }) => handle.onChange(target.value),
                        placeholder: "customization",
                    },
                },
            ],
        },
    ],
};

Form.load("custom-object", CustomObject);

const CustomObjectPartly = {
    component: Div,
    children: [
        {
            component: props => <h3>{props.title}</h3>,
            props: {
                $vf_title: ({ schema }) => schema.title,
            },
        },
        {
            mode: "repeaterHolder",
            component: null,
            repeater: {
                mode: "editorHolder",
                component: null,
            },
            editor: [
                {
                    component: Div,
                    editorFor: "age", // only for integer
                    children: [
                        {
                            component: props => (
                                <div>
                                    <label>{props.title}</label>
                                </div>
                            ),
                            props: {
                                $vf_title: ({ schema }) => schema.title,
                            },
                        },
                        {
                            component: Input,
                            props: {
                                style: { margin: "20px 0" },
                                $vf_value: ({ value }) => value,
                                $vf_onChange: ({ handle }) => ({ target }) => {
                                    if (!Number.isNaN(Number(target.value))) {
                                        handle.onChange(Number(target.value));
                                    } else {
                                        handle.onChange(target.value);
                                    }
                                },
                                placeholder: "customization",
                            },
                        },
                        {
                            component: ({ errors }) => (errors ? errors.message : null),
                            props: {
                                $vf_errors: ({ errorObj }) => errorObj,
                            },
                        },
                    ],
                },
                {
                    component: Div,
                    editorFor: "bio(custom)", // for specialKey
                    children: [
                        {
                            component: props => (
                                <div>
                                    <label>{props.title}</label>
                                </div>
                            ),
                            props: {
                                $vf_title: ({ schema }) => schema.title,
                            },
                        },
                        {
                            component: Input,
                            props: {
                                style: { margin: "20px 0" },
                                $vf_value: ({ value }) => value,
                                $vf_onChange: ({ handle }) => ({ target }) => handle.onChange(target.value),
                                placeholder: "customization",
                            },
                        },
                    ],
                },
            ],
        },
    ],
};

Form.load("custom-object-partly", CustomObjectPartly);

const toJson = val => JSON.stringify(val, null, 4);
const fromJson = json => JSON.parse(json);
const cmOptions = {
    theme: "default",
    viewportMargin: Infinity,
    mode: {
        name: "javascript",
        json: true,
        statementIndent: 2,
    },
    lineNumbers: true,
    lineWrapping: true,
    indentWithTabs: false,
    tabSize: 4,
};

function FormModeSelector({ value, select }) {
    return (
        <Form
            schema={{
                type: "object",
                properties: {
                    underControl: {
                        title: "UnderControl",
                        type: "boolean",
                    },
                    writeBack: {
                        title: "WriteBack",
                        type: "boolean",
                        $vf_ext: {
                            option: {
                                hideBy: ({ parentValue }) => !parentValue.underControl,
                            },
                        },
                    },
                },
                $vf_ext: {
                    props: {
                        layout: "inline",
                    },
                },
            }}
            value={value}
            onChange={value => select(value)}
        />
    );
}

class Selector extends Component {
    constructor(props) {
        super(props);
        this.state = { current: "Simple" };
    }

    shouldComponentUpdate(nextProps, nextState) {
        return shouldRender(this, nextProps, nextState);
    }

    onLabelClick = label => {
        return event => {
            event.preventDefault();
            this.setState({ current: label });
            setImmediate(() => this.props.onSelected(samples[label]));
        };
    };

    render() {
        return (
            <ul className="nav nav-pills">
                {Object.keys(samples).map((label, i) => {
                    return (
                        <li key={i} role="presentation" className={this.state.current === label ? "active" : ""}>
                            <a href="#" onClick={this.onLabelClick(label)}>
                                {label}
                            </a>
                        </li>
                    );
                })}
            </ul>
        );
    }
}

class Editor extends Component {
    constructor(props) {
        super(props);
        this.state = { valid: true, code: props.code };
    }

    componentWillReceiveProps(props) {
        this.setState({ valid: true, code: props.code });
    }

    shouldComponentUpdate(nextProps, nextState) {
        return shouldRender(this, nextProps, nextState);
    }

    onCodeChange = (editor, metadata, code) => {
        if ((this.props.options || {}).readOnly) {
            return;
        }
        this.setState({ valid: true, code });
        setImmediate(() => {
            try {
                this.props.onChange(fromJson(this.state.code));
            } catch (err) {
                this.setState({ valid: false, code });
            }
        });
    };

    render() {
        const { title } = this.props;
        const icon = this.state.valid ? "ok" : "remove";
        const cls = this.state.valid ? "valid" : "invalid";

        return (
            <div className="EditorHolder">
                <div className="panel panel-default">
                    <div className="panel-heading">
                        <span className={`${cls} glyphicon glyphicon-${icon}`} />
                        {" " + title}
                    </div>
                    <CodeMirror
                        value={this.state.code}
                        onChange={this.onCodeChange}
                        autoCursor={false}
                        options={Object.assign({}, cmOptions, this.props.options)}
                    />
                </div>
            </div>
        );
    }
}

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            underControl: true,
            writeBack: false,
        };
    }
    componentDidMount() {
        const hash = document.location.hash.match(/#(.*)/);
        if (hash && typeof hash[1] === "string" && hash[1].length > 0) {
            try {
                this.load(JSON.parse(atob(hash[1])));
            } catch (err) {
                alert("Unable to load form setup data.");
            }
        } else {
            this.load(samples.Simple);
        }
    }
    // editor
    onSchemaEdited = schema => {
        this.setState({ schema });
    };
    onValueEdited = data => {
        this.setState({ value: data, defaultValue: data });
    };
    // form
    onValueChange = outputValue => {
        console.log("%c%s", "color:red", `onChange: ${JSON.stringify(outputValue)}`);
        const newState = {
            outputValue, // not undercontrol
        };
        if (this.state.underControl && this.state.writeBack) {
            // write value back to Editor —> trigger value onChange to Form
            newState.value = outputValue; // undercontrol
        }
        this.setState(newState);
    };
    load = data => {
        // force resetting form component instance
        this.setState({
            schema: undefined,
            defaultValue: undefined,
            outputValue: undefined,
            ...data,
            value: data.defaultValue, // form underControl Demo
        });
    };

    onFormModeSelected = value => {
        this.setState(value);
    };

    render() {
        const { schema, value, defaultValue, outputValue, underControl, writeBack } = this.state;
        return (
            <div className="container-fluid">
                <div className="page-header">
                    <h1>@ver01/form</h1>
                    <div className="row">
                        <div className="col-sm-10">
                            <Selector onSelected={this.load} />
                        </div>
                        <div className="col-sm-2">
                            <FormModeSelector value={{ underControl, writeBack }} select={this.onFormModeSelected} />
                        </div>
                    </div>
                </div>
                <div className="col-sm-7">
                    <div className="row">
                        <div className="col-sm-12">
                            <Editor title="JSONSchema" code={toJson(schema)} onChange={this.onSchemaEdited} />
                        </div>
                        <div className="col-sm-12">
                            <Editor
                                title={
                                    underControl
                                        ? "Value(UnderControl Continue Control Form)"
                                        : "DefaultValue(Not UnderControl Just init Form Value Once)"
                                }
                                code={toJson(underControl ? value : defaultValue)}
                                onChange={formData => this.onValueEdited(formData)}
                            />
                        </div>
                        <div className="col-sm-12">
                            <Editor
                                title="Value-output ( readonly [onChange Trigger] )"
                                code={toJson(outputValue)}
                                options={{ readOnly: true }}
                            />
                        </div>
                    </div>
                </div>
                <div className="col-sm-5">
                    <Form
                        schema={schema}
                        value={underControl ? value : undefined} // underControl
                        defaultValue={underControl ? undefined : defaultValue} // not underControl
                        onChange={this.onValueChange}
                        validators={{
                            passEqualTo: ({ value, ruleValue: valuePath, rootValue }) => {
                                const pairValue = getByPath(rootValue, valuePath);
                                if (value && pairValue) {
                                    if (value !== pairValue) {
                                        return {
                                            errorType: "feedbackStr",
                                            errorData: "Passwords don't match.",
                                        };
                                    }
                                }
                            },
                        }}
                        // debug
                    />
                </div>
            </div>
        );
    }
}

render(<App />, document.getElementById("app"));
