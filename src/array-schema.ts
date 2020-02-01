import { ITypeSchema, TypeSchema, PropertySchema } from "./type-schema";
import { parseAsRange } from "./expression-parser";
import { Schema } from "./schema";


export interface IArraySchema extends ITypeSchema<"array"> {
  readonly type?: "array";

  /**
   * @description The length of the array can be specified using the minItems and maxItems keywords. The value of each keyword must be a non-negative number. These keywords work whether doing List validation or Tuple validation.
   * @see https://json-schema.org/understanding-json-schema/reference/array.html#length
   */
  minItems?: number;

  /**
   * @description The length of the array can be specified using the minItems and maxItems keywords. The value of each keyword must be a non-negative number. These keywords work whether doing List validation or Tuple validation.
   * @see  https://json-schema.org/understanding-json-schema/reference/array.html#length
   */
  maxItems?: number;

  /**
   * @description A schema can ensure that each of the items in an array is unique. Simply set the uniqueItems keyword to true.
   * @see https://json-schema.org/understanding-json-schema/reference/array.html#uniqueness
   */
  uniqueItems?: boolean;

  /**
   * @description The length of the array can be specified using Expression. x => x < 10. Supported operators: `==`, `===`, `>=`, `<=`, `>`, `<`
   * @see https://json-schema.org/understanding-json-schema/reference/array.html#length
   */
  length?: (model: number) => boolean;

  /**
   * @description Tuple validation is useful when the array is a collection of items where each has a different schema and the ordinal index of each item is meaningful.
   * @see https://json-schema.org/understanding-json-schema/reference/array.html#tuple-validation
   * @example
   * new ArraySchema({
   *    items: [1, 2],
   *    additionalItems: false
   * }))
   * @example
   * new ArraySchema({
   *    items: new NumberSchema({
   *      "multipleOf": 2.0
   *    })
   * })
   */
  items?: Array<any> | TypeSchema<string | number | boolean>;

  /**
   * @description The additionalItems keyword controls whether it’s valid to have additional items in the array beyond what is defined in items.
   * @see https://json-schema.org/understanding-json-schema/reference/array.html#tuple-validation
   */
  additionalItems?: boolean;
}

export class ArraySchema extends TypeSchema<"array"> {
  public readonly type = "array";

  public readonly minItems?: number;
  public readonly maxItems?: number;
  public readonly uniqueItems?: boolean;
  public readonly items?: Array<any> | PropertySchema;
  public readonly additionalItems?: boolean;

  constructor(schema: IArraySchema = {}) {
    super(schema);

    if (typeof schema.length !== "undefined") {
      const range = parseAsRange(schema.length);
      if (typeof range.max !== "undefined") this.maxItems = range.max;
      if (typeof range.min !== "undefined") this.minItems = range.min;
      if (range.isMaxExclusive) this.maxItems--;
      if (range.isMinExclusive) this.minItems++;
    }

    if (typeof schema.maxItems !== "undefined") this.maxItems = schema.maxItems;
    if (typeof schema.minItems !== "undefined") this.minItems = schema.minItems;
    if (typeof schema.uniqueItems !== "undefined") this.uniqueItems = schema.uniqueItems;
    if (typeof schema.additionalItems !== "undefined") this.additionalItems = schema.additionalItems;
    if (Array.isArray(schema.items)) this.items = schema.items.map(i => {
      return {
        type: typeof i,
        enum: [i]
      };
    });
    if (schema.items && schema.items instanceof Schema) this.items = schema.items.compile();
    else if (schema.items && schema.items instanceof PropertySchema) this.items = schema.items.compile();
  }
}
