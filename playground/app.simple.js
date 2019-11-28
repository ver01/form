import React, { Component } from "react";
import { render } from "react-dom";

// --- 1. ver01form core
import Ver01Form from "../src";

class App extends Component {
    // form
    onValueChange = outputValue => {
        console.log("%c%s", "color:red", `onChange: ${JSON.stringify(outputValue)}`);
    };
    render() {
        const schema = {
            title: "A registration form",
            description: "A simple form example.",
            type: "object",
            required: ["firstName", "lastName"],
            properties: {
                firstName: {
                    type: "string",
                    title: "First name",
                    default: "Chuck",
                    $vf_opt: {
                        props: {
                            autoFocus: true,
                        },
                    },
                },
                lastName: {
                    type: "string",
                    title: "Last name",
                },
                age: {
                    type: "integer",
                    title: "Age of person",
                    description: "(earthian year)",
                },
                bio: {
                    type: "string",
                    title: "Bio",
                    $vf_opt: {
                        widget: "textarea",
                    },
                },
                password: {
                    type: "string",
                    title: "Password",
                    description: "Hint: Make it strong!",
                    minLength: 3,
                    $vf_opt: {
                        widget: "password",
                    },
                },
            },
        };
        const value = {
            lastName: "Norris",
            age: 75,
            bio: "Roundhouse kicking asses since 1940",
            password: "noneed",
        };
        return (
            <div className="container-fluid">
                <div className="col-sm-5">
                    {/* main entry */}
                    <Ver01Form schema={schema} defaultValue={value} onChange={this.onValueChange} debug />
                </div>
            </div>
        );
    }
}

render(<App />, document.getElementById("app"));
