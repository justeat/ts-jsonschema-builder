# Fluent TypeScript JSON Schema Builder [![Build Status](https://travis-ci.com/justeat/ts-jsonschema-builder.svg?branch=master)](https://travis-ci.com/justeat/ts-jsonschema-builder)

This builder takes advantage of TypeScript [Generics](https://www.typescriptlang.org/docs/handbook/generics.html) to provide a Fluent JSON Schema builder, with full IntelliSense support. You don't need to worry about knowing the JSON Schema specification upfront, instead explore it while typing code.

Builder is packaged as ECMAScript 5. This means it can be used in vanilla JS projects, but you will not get a rich IntelliSense support.

⚠ In beta, support is not complete. See below for what is supported.  
V1 of the builder aims to implement Draft-V4

![Builder demo](https://github.com/justeat/ts-jsonschema-builder/raw/master/assets/ts-schema-demo.gif)

```typescript
const schema = new Schema<Model>()
    .with(m => m.StringProp, /^[A-z]+\.[A-z]+$/)
    .with(m => m.NumberProp, x => x > 15)
    .with(m => m.ObjProp.Lvl2ObjProp.Lvl3StrProp, "specificValue")
    .with(m => m.ArrayProp, new ArraySchema({
        length: x => x < 10,
    }))
    .build();
```

<details>
  <summary>Produces following schema (click to expand)</summary>

```json
{
    "type": "object",
    "properties": {
        "StringProp": {
            "type": "string",
            "pattern": "^[A-z]+\\.[A-z]+$"
        },
        "NumberProp": {
            "type": "number",
            "minimum": 16
        },
        "ObjProp": {
            "title": "ObjProp",
            "type": "object",
            "properties": {
                "Lvl2ObjProp": {
                    "title": "Lvl2ObjProp",
                    "type": "object",
                    "properties": {
                        "Lvl3StrProp": {
                            "type": "string",
                            "pattern": "specificValue"
                        }
                    },
                    "required": [
                        "Lvl3StrProp"
                    ]
                }
            },
            "required": [
                "Lvl2ObjProp"
            ]
        },
        "ArrayProp": {
            "type": "array",
            "maxItems": 9
        }
    },
    "required": [
        "StringProp",
        "NumberProp",
        "ObjProp",
        "ArrayProp"
    ]
}
```
</details>

For many more examples, check our [Wiki](https://github.com/justeat/ts-jsonschema-builder/wiki)
