# Fluent TypeScript JSON Schema Builder

This builder takes advantage of TypeScript [Generics](https://www.typescriptlang.org/docs/handbook/generics.html) to provide a Fluent JSON Schema builder, with full IntelliSense support. You don't need to worry about knowing the JSON Schema specification upfront, instead explore it while typing code.


⚠ In beta, support is not complete. See below for what is supported.  
V1 of the builder aims to implement Draft-V4

![Builder demo](assets/ts-schema-demo.gif)

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

## API reference

<details>
  <summary><code>STRING</code> <sub>(click to expand)</sub></summary>
  
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
```typescript
const schema = new Schema<Model>()
    .with(m => m.StringProp, new StringSchema({
        format: "date-time"
    }))
    // or
    .with(m => m.StringProp, new StringSchema({
        format: "ipv4"
    }))
    .build();
```
</details>



<details>
  <summary><code>NUMBER</code> <sub>(click to expand)</sub></summary>
  
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
  <summary><code>OBJECT</code> <sub>(click to expand)</sub></summary>
  
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
  <summary><code>ARRAY</code> <sub>(click to expand)</sub></summary>
  
### List validation
⚠ Not yet supported.  
No proposed implementation:

### Tuple validation

```typescript
const schema = new Schema<Model>()
    .with(m => m.ArrayProp, new ArraySchema({
        items: [1, 2],
        additionalItems: false
    })))
    .build();
```

### Length
```typescript
const schema = new Schema<Model>()
    .with(m => m.ArrayProp, new ArraySchema({
        length: x < 3
    }))
    .build();
```
Supported operators: `==`, `===`, `>=`, `<=`, `>`, `<`

### Uniqueness
```typescript
const schema = new Schema<Model>()
    .with(m => m.ArrayProp, new ArraySchema({
        uniqueItems: false
    }))
    .build();
```

</details>


<details>
  <summary><code>BOOLEAN</code> <sub>(click to expand)</sub></summary>

### Value
```typescript
const schema = new Schema<Model>()
    .with(m => m.BooleanProp, false)
    .build();
```
</details>

## Expression
Builder is making heavy use of [Esprima](http://esprima.org/), high-performance ECMAScript parser.  
This allows using expressions as property selectors.  
For example an expression like this `x => x.Prop1.Prop2.` can be parsed into an expression tree that can be recursively inspected by the builder to produce a nested JSON Schema structure.  

Property selection is not the only use case. The same technique is used for parsing binary expressions for building property value constraints.  
For example `x => x === 10` can be parsed as a binary expression which builder can convert to JSON schema constraints, setting minimum/maximum items in the array or limiting string length.

## Contributing to the project
Please read our [Code of Conduct](CODE_OF_CONDUCT.md) and [Contribution guidelines](CONTRIBUTING.md)

## Resources
* [Understanding JSON Schema](https://json-schema.org/understanding-json-schema/index.html)
* [Esprima](http://esprima.org/)