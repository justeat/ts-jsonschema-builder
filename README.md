# Fluent TypeScript JsonSchema Builder

This builder takes advantage of TypeScript [Generics](https://www.typescriptlang.org/docs/handbook/generics.html) to provide a Fluent JsonSchema builder, with full intellisense support. You don't need to worry  about knowing the JsonSchema specification, instead explore it while typing code.


⚠ In beta, support in not complete. See below for the what is supported.  
V1 of the builder aims to implement Draft-V4

![Builder demo](.\assets\ts-schema-demo.gif)

```typescript
const schema = new Schema<Model>()
    .with(m => m.StringProp, /^[A-z]+\.[A-z]+$/)
    .with(m => m.NumberProp, x => x > 15)
    .with(m => m.ObjProp.Lvl2ObjProp.Lvl3StrProp, "specificValue")
    .with(m => m.ArrayProp, {
        length: x => x < 10,
    })
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


<details>
  <summary><h2 style="display: inline">String</h2>  (click to expand)</summary>
  
### Specific value
```typescript
const schema = new Schema<Model>()
    .with(m => m.StringProp, "specificValue")
    .build();
```

### Length
```typescript
const schema = new Schema<Model>()
    .with(m => m.StringProp, x => x.length >= 10)
    .build();
```
Supported operators: `==`, `===`, `>=`, `<=`, `>`, `<`

### Regular Expressions
```typescript
const schema = new Schema<Model>()
    .with(m => m.StringProp, /^[A-z]+\.[A-z]+$/)
    .build();
```

### Format
⚠ Not yet supported.  
Proposed implementation

```typescript
const schema = new Schema<Model>()
    .with(m => m.StringProp, {
        format: "date-time"
    })
    .build();
```
</details>



<details>
  <summary><h2 style="display: inline">Number</h2> (click to expand)</summary>
  
### Multiples
```typescript
const schema = new Schema<Model>()
    .with(m => m.NumberProp, new NumberSchema({
        multipleOf: 10
    }))
    .build();
```

### Range
```typescript
const schema = new Schema<Model>()
    .with(m => m.NumberProp, x => x >= 10)
    // or
    .with(m => m.NumberProp, new NumberSchema({
        minimum: 10,
        maximum: 15,
    })
    .build();
```
Supported operators: `==`, `===`, `>=`, `<=`, `>`, `<`
Does not make use of `exclusiveMaximum` due to differences in implementations between drafts.

</details>



<details>
  <summary><h2 style="display: inline">Object</h2> (click to expand)</summary>
  
### Properties & Required Properties
Auto generated based on property expressions.  
Leaf node must be non object type, will be parsed according to its type;

```typescript
const schema = new Schema<Model>()
    .with(m => m.ObjProp.Lvl2ObjProp.Lvl3StrProp, /^[A-z]+\.[A-z]+$/)
    .build();
```

### Size
⚠ Not yet supported.  
Proposed implementation:
```typescript
const schema = new Schema<Model>()
    .with(m => m.ObjProp, x => x < 3)
    .build();
```
Supported operators: `==`, `===`, `>=`, `<=`, `>`, `<`

### Dependencies
⚠ Not yet supported.  
No proposed implementation.

### Pattern Properties
⚠ Not yet supported.  
No proposed implementation.

</details>


<details>
  <summary><h2 style="display: inline">Array</h2> (click to expand)</summary>
  
### List validation

```typescript
const schema = new Schema<Model>()
    .with(m => m.ArrayProp, [1, 2, 3])
    .build();
```

### Tuple validation
⚠ Not yet supported.  
No proposed implementation:

### Length
```typescript
const schema = new Schema<Model>()
    .with(m => m.ArrayProp, {
        length: x < 3
    })
    .build();
```
Supported operators: `==`, `===`, `>=`, `<=`, `>`, `<`

### Uniqueness
```typescript
const schema = new Schema<Model>()
    .with(m => m.ArrayProp, {
        uniqueItems: false
    })
    .build();
```

</details>


<details>
  <summary><h2 style="display: inline">Boolean</h2> (click to expand)</summary>

### Value
```typescript
const schema = new Schema<Model>()
    .with(m => m.BooleanProp, false)
    .build();
```

</details>

## Resources
* [Understanding JSON Schema](https://json-schema.org/understanding-json-schema/index.html)
* [Esprima](http://esprima.org/)