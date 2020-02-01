import { StringSchema, NumberSchema, BooleanSchema, PropertySchema } from "./";

export function parseSchema(value: any): PropertySchema {
  if (value instanceof RegExp) return new StringSchema({ type: "string", pattern: value });
  if (typeof value === "string") return new StringSchema({ type: "string", enum: [value] });
  if (typeof value === "number") return new NumberSchema({ type: "number", minimum: value, maximum: value });
  if (typeof value === "boolean") return new BooleanSchema({ type: "boolean", enum: [value] });

  if (typeof value === "object" && value.type === "array") return value;
  if (typeof value === "object" && value.type === "string") return value;
  if (typeof value === "object" && value.type === "number") return value;
  if (typeof value === "object" && value.type === "boolean") return value;

  if (typeof value === "object" && value.constructor.name === "AnyOf") return value;
  if (typeof value === "object" && value.constructor.name === "OneOf") return value;
  if (typeof value === "object" && value.constructor.name === "AllOf") return value;
  if (typeof value === "object" && value.constructor.name === "Not") return value;
  if (typeof value === "object" && value.constructor.name === "Schema") return value;
  if (typeof value === "object" && value.constructor.name === "DictionarySchema") return value;

  if (value instanceof Function) return new NumberSchema(value);

  throw new Error(`Unsupported type. '${value.constructor.name}', '${typeof value}'`);
}
