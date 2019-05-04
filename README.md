# Deprecation

Ver01 Form is standalone lib for render JsonSchem to React Form，with different react themes。

# Usage

> npm install
>
> npm run start

* visite http://localhost:8888 for schema demo

### Mode

#### underControl

* With value props

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



#### not underControl

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



## Theme

now antd theme avaliavle now, others will come soon

vote theme you want support in issue~