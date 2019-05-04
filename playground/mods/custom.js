import React, { Component } from "react";

export class GeoPosition extends Component {
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
                    <code>schema</code> as the <code>$vf_opt.widget</code> to use for this schema. Custom Component need
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
