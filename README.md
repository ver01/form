## Table of Contents

  - [Deprecation](#deprecation)
     - [Online Demo](#online-demo)
     - [local Demo](#local-demo)
  - [Usage](#usage)
     - [Initialize](#initialize)
        - [npm import](#npm-import)
        - [Uncontrolled Mode](#uncontrolled-mode)
        - [Controlled Mode](#controlled-mode)
     - [Theme](#theme)
  - [Requirement](#requirement)
  - [Theme](#theme)
     - [Official theme](#official-theme)
     - [Custom theme](#custom-theme)
        - [Component Schema](#component-schema)
        - [Dynamic props generator rule](#dynamic-props-generator-rule)
           - [for props](#for-props)
           - [for WidgetComponentSchema](#for-widgetcomponentschema)
     - [Value](#value)
        - [Value In](#value-in)
           - [Uncontrolled Mode](#uncontrolled-mode)
           - [Controlled Mode](#controlled-mode)
        - [Value Out](#value-out)
        - [Validate](#validate)
     - [JSON Schema Support](#json-schema-support)
        - [$vf_opt](#vf_opt)
           - [$vf_opt.widget](#vf_opt-widget)
           - [$vf_opt.option](#vf_opt-option)
           - [$vf_opt.validate](#vf_opt-validate)

---



## Deprecation

Ver01 Form is standalone lib for render JsonSchem to React Form，with different react themes supports.

### Online Demo

https://codesandbox.io/embed/0mlpp16yy0

### local Demo

__Local demo with schema usage demo code__

> git clone git@github.com:ver01/form.git
>
> npm install
>
> npm run start
>
> visit http://localhost:8888 for schema demo

## Usage

### Initialize

#### npm import

> Core npm package is @ver01/form.
>
> Most of times you need using it with theme (eg: @ver01/form-theme-antd). Or you can define theme by yourself.

#### Uncontrolled Mode

* With defaultValue props

```react
// --- 1. ver01form core
import Ver01Form from "@ver01/form";

// --- 2. ver01form theme
// antd
import themeAntd from "@ver01/form-theme-antd";
// antd style
import "@ver01/form-theme-antd/lib/index.css";

// load theme once
Ver01Form.loadTheme(themeAntd);

<Ver01Form
  schema={schema}
  defaultValue={defaultValue}
  onChange={this.onValueChange}
/>
```

#### Controlled Mode

* with defaultValue props

```react
// --- 1. ver01form core
import Ver01Form from "@ver01/form";

// --- 2. ver01form theme
// antd
import themeAntd from "@ver01/form-theme-antd";
// antd style
import "@ver01/form-theme-antd/lib/index.css";

// load theme once
Ver01Form.loadTheme(themeAntd);

<Ver01Form
  schema={schema}
  value={value}
  onChange={this.onValueChange}
/>
```

### Theme

Now antd theme avaliavle now, others will come soon.

issue you wanted most react theme~~ (1 theme in at most 1 week)

## Requirement

* @ver01/form is standalone lib. No other package needed
* But, you need import form theme package. Which may involve other react component framework (most of time includes in your project already).

## Theme

### Official theme

* [antd](https://github.com/ver01/form-theme-antd)

### Custom theme

#### Component Schema

We assigned a json like schema to define react componet.

The entry file [like this](https://github.com/ver01/form-theme-antd/blob/master/src/index.js).

Theme entry file should export structure like this:

```react
// Export Theme
export default {
    validators: {
        // buildin just need msgBuilder
        minLength: ({ value, ruleValue, schema }) => ({
            errorType: "feedbackStr",
            errorData: `should NOT be shorter than ${ruleValue} characters`,
        }),
        ...
        // custom need checkLogic
        otherCustomValidLogic
    },
    components: {
        // 5base type
        string: {
            getWidget: [({ schema }) => ({
                widgetName: "readonly",
                widgetData: { text: "True"},
            })], // special widget pick logic: return { widgetName, widgetData }
            widgets: {
                select: {
                    formatter: val => (val ? "true" : "false"), // format value to componet
                    normalizer: val => (val === "true" ? true : false), // format value to output
                    component: FormItem, // react component
            		    propsMixinList: ["style"], // user defined in JsonSchema $vf extend config
                    props: formItemProps, // component props defined in other place
                    children: [ // component children (recursion)
                        {
                            component: Select, 
            				propsMixinList: ["placeholder"],
                            props: { // props can dynamic generate with $vf_ prefix; more detail see [Dynamic props generator rule] section below
                                $vf_value: ({ value }) => value,
                                $vf_onChange: ({ handle }) => handle.onChange
                            }
                        }
                    ]
                },
                radio: radioWidget // defined as select widget
            }, // widget define: { [widgetName]: WidgetComponentSchema }
            errorObjGenerator:({ errors }) => {
                const errorMessage = [];
                errors.map(error => {
                    const { errorType, errorData } = error;
                    switch (errorType) {
                        default:
                            errorMessage.push(errorData);
                            break;
                    }
                });
                // return as errorObj
                return errorMessage.length
                    ? {
                    message: (
                        <ul>
                            {errorMessage.map((it, ind) => (
                                <li key={ind}>{it}</li>
                            ))}
                        </ul>
                    ),
                }
                : null;
            }, // generator errorObj for WidgetComponentSchema render widget
        },
        number,
        integer,
        boolean,
        null,
        // 1root only(for body holder)
        root,
        // 1control only(for control schema oneof anyof allof)
        control,
        // 2container
        array,
        object,
    },
};

```



#### Dynamic props generator rule

##### for props

```javascript
 {
    isRoot: true,

    rootValue: {},
    rootSchema: {},

    parentSchema: {},

    value: {},
    schema: {},

    objectKey: "a",
    arrayIndex: 3,

    handle: {
        onChange: () => {},
        // for array
        canMoveUp: false,
        canMoveDown: false,
        canAppend: false,
        canRemove: false,
        moveUp: () => {},
        moveDown: () => {},
        append: () => {},
        remove: () => {},
        // for control
        hasSchemaControl: true, // child formnode has SchemaList
        schemaList: [{ schema: {}, valid: true, selected: true }], // no control is null
        schemaSelect: ind => {
            /* aform func */
        },
    },

    schemaOption: {
        // read by schema.$vf_opt.option
        // for array:
        orderable: true,
        removable: true,
        appendable: true,
        // for string:
        disabled: false,
        readonly: false,
        fileHandle: () => {}, // ?
        // for object:
        order: ["key_a", "key_b"],
    },

    formProps: {
        validators: {},
    },

    formOption: {},

    errorObj: {
        // custom
    },
};
```

##### for WidgetComponentSchema

```javascript
{
    formatter: () => {},
    normalizer: () => {},
}
```

### Value

#### Value In

##### Uncontrolled Mode

* You need set the defaultValue props
* unset defaultValue & value props also caused ver01Form in Uncontrolled Mode
* The Form will use the defaultValue in first defined, __deal with some situation defaultValue set async__

```react
// uncontrolled Mode:
<Ver01Form
  schema={{ type: 'string'}}
  defaultValue='helloWorld'
  onChange={console.info}
/>
```

##### Controlled Mode

- You need set the value props.
- onChange will trigger new value, but form will change when value changed.

```react
// Controlled Mode:
<Ver01Form
  schema={{ type: 'string'}}
  value={this.state.value}
  onChange={value=>this.setValue({value})}
/>
```

#### Value Out

We not export some value post method, you can get value by onChange event, then deal with it as you wish

```react
render(){
return <div>
  <Ver01Form
    schema={{ type: 'string'}}
    value={this.state.value}
    onChange={value=>this.setValue({value})}
  />
  <Button onClick={()=>{postServer(this.state.value)}}>Submit</Button>
</div>
}
```

#### Validate

validate result will export by onValidate method

when validate failed, error set as:

* validateErrValuePath: the path which part valued valid failed.
* errorObj: Generate by [Component Schema](#Component Schema) errorObjGenerator function.
* errors: Generate by [Component Schema](#Component Schema) validators function
  * return as array
  * [{  errorType: "errorTypeString", errorData: AnyType }]

```react
render(){
return <div>
  <Ver01Form
    schema={{
      "type": "object",
      "required": [
          "firstName",
      ],
      "properties": {
          "firstName": {
              "type": "string"
          }
      }
    }}
    value={{ firstName: '' }} // zero length string cause required check
    onValidate={error=>this.setState({errors: error && error.errors})} // error : { [validateErrValuePath]: {errorObj, errors} }
  />
  <Button onClick={()=>{
    if (this.state.errors){
      postServer(this.state.value);
    }else {
      console.info(this.state.errors);
    }
  }>Submit</Button>
</div>
}
```

### JSON Schema Support

#### $vf_opt

we extended JSON Schema By $vf_opt section

##### $vf_opt.props

will mixin to all components belone to one value node. Filtered by  [Component Schema](#Component Schema) propsMixinList

##### $vf_opt.widget

string, assign the component used. Defined in  [Component Schema](#Component Schema) widgets

##### $vf_opt.option

* For array
  * orderable(default true)
  * addable(default true)
  * removeable(default true)
* For string
  * disabled
  * readonly
* For object
  * order: ['first-key', 'second-key', '*', 'last-key']

##### $vf_opt.validate

\[ruleName\]: ruleValue

see sample-validation  [local demo](#local demo)

Validate can be defined in formProps or buildin validate

