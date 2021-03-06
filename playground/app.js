import React, { Component } from "react";
import { render } from "react-dom";
import { UnControlled as CodeMirror } from "react-codemirror2";
import { samples } from "./schemaDemo";

// demo mods
import GeoPosition from "./mods/custom";
import { CustomArray, CustomArrayChild, CustomArrayChildPartly } from "./mods/customArray";
import { CustomObject, CustomObjectPartly } from "./mods/customObject";

// some tools
import { getByPath } from "../src/utils";
import { isEqual } from "../src/vendor/lodash";

// --- 1. ver01form core
import Ver01Form from "../src";

// ** consts
const shouldRender = (comp, nextProps, nextState) => {
    const { props, state } = comp;
    return !isEqual(props, nextProps) || !isEqual(state, nextState);
};
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

// --- 3. schemaDemo/custom: custom ReactComponent
Ver01Form.quickLoad("localisation", GeoPosition);

// --- 4. schemaDemo/customArray: custom RuleDefineComponent
Ver01Form.load("custom-array", CustomArray);
Ver01Form.load("custom-array-and-child", CustomArrayChild);
Ver01Form.load("custom-array-and-child-partly", CustomArrayChildPartly);

// --- 5. schemaDemo/customObject: custom RuleDefineComponent
Ver01Form.load("custom-object", CustomObject);
Ver01Form.load("custom-object-partly", CustomObjectPartly);

// --- 6. FormModeSelector
function FormModeSelector({ value, select }) {
    return (
        <Ver01Form
            schema={{
                type: "object",
                properties: {
                    Uncontrolled: {
                        title: "Uncontrolled",
                        type: "boolean",
                    },
                    writeBack: {
                        title: "WriteBack",
                        type: "boolean",
                        $vf_opt: {
                            option: {
                                hideBy: ({ parentValue }) => !parentValue.Uncontrolled,
                            },
                        },
                    },
                },
                $vf_opt: {
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
            Uncontrolled: true,
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
            outputValue, // not Uncontrolled
        };
        if (this.state.Uncontrolled && this.state.writeBack) {
            // write value back to Editor —> trigger value onChange to Form
            newState.value = outputValue; // Uncontrolled
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
            value: data.defaultValue, // form Uncontrolled Demo
        });
    };

    onFormModeSelected = value => {
        this.setState(value);
    };

    render() {
        const { schema, value, defaultValue, outputValue, Uncontrolled, writeBack } = this.state;
        return (
            <div className="container-fluid">
                <div className="page-header">
                    <h1>@ver01/form</h1>
                    <div className="row">
                        <div className="col-sm-8">
                            <Selector onSelected={this.load} />
                        </div>
                        <div className="col-sm-2">
                            <Selector onSelected={this.load} />
                        </div>
                        <div className="col-sm-2">
                            <FormModeSelector value={{ Uncontrolled, writeBack }} select={this.onFormModeSelected} />
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
                                    Uncontrolled
                                        ? "Value(Uncontrolled Continue Control Ver01Form)"
                                        : "DefaultValue(Not Uncontrolled Just init Ver01Form Value Once)"
                                }
                                code={toJson(Uncontrolled ? value : defaultValue)}
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
                    {/* main entry */}
                    {Uncontrolled ? (
                        <Ver01Form
                            schema={schema}
                            value={value} // Uncontrolled
                            onChange={this.onValueChange}
                            // custom validator
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
                            key="modeA"
                            onValidate={errorObj => {
                                console.info("validate error", errorObj);
                            }}
                        />
                    ) : (
                        <Ver01Form
                            schema={schema}
                            defaultValue={defaultValue} // not Uncontrolled
                            onChange={this.onValueChange}
                            // custom validator
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
                            key="modeB"
                            onValidate={errorObj => {
                                console.info("validate error", errorObj);
                            }}
                        />
                    )}
                </div>
            </div>
        );
    }
}

render(<App />, document.getElementById("app"));
