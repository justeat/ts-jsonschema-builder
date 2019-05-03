import { ITypeSchema, TypeSchema } from "./type-schema";
import { parseAsRange } from "./expression-parser";


export interface INumberSchema extends ITypeSchema<"number"> {
  readonly type?: "number";

  /**
   * @description Numbers can be restricted to a multiple of a given number, using the multipleOf keyword. It may be set to any positive number.
   * @see https://json-schema.org/understanding-json-schema/reference/numeric.html#multiples
   */
  multipleOf?: number;

  /**
   * @description Ranges of numbers are specified using a combination of the minimum and maximum keywords
   * @see https://json-schema.org/understanding-json-schema/reference/numeric.html#range
   */
  minimum?: number;

  /**
   * @description Ranges of numbers are specified using a combination of the minimum and maximum keywords
   * @see https://json-schema.org/understanding-json-schema/reference/numeric.html#range
   */
  maximum?: number;

  /**
   * @description Ranges of numbers are specified using Expression. x => x < 10, Supported operators: `==`, `===`, `>=`, `<=`, `>`, `<`
   * @example
   * new NumberSchema({
   *     value: x => x <= 15
   * })
   * @see https://json-schema.org/understanding-json-schema/reference/numeric.html#range
   */
  value?: (model: number) => boolean;
}

export class NumberSchema extends TypeSchema<"number">  {
  public readonly type = "number";

  public readonly multipleOf?: number;
  public readonly minimum?: number;
  public readonly maximum?: number;

  public readonly exclusiveMaximum: boolean;
  public readonly exclusiveMinimum: boolean;

  constructor(schema?: (model: number) => boolean);
  constructor(schema?: INumberSchema)
  constructor(schema?: any) {
    super(schema);
    schema = schema || {};

    let normalizedSchema: INumberSchema;
    if (schema instanceof Function) normalizedSchema = { value: schema };
    else normalizedSchema = schema;

    if (typeof normalizedSchema.value !== "undefined") {
      const range = parseAsRange(normalizedSchema.value);

      if (typeof range.min !== "undefined") this.minimum = range.min;
      if (typeof range.max !== "undefined") this.maximum = range.max;
      if (range.isMaxExclusive) this.exclusiveMaximum = true;
      if (range.isMinExclusive) this.exclusiveMinimum = true;
    }

    if (typeof normalizedSchema.multipleOf !== "undefined") this.multipleOf = normalizedSchema.multipleOf;
    if (typeof normalizedSchema.minimum !== "undefined") this.minimum = normalizedSchema.minimum;
    if (typeof normalizedSchema.maximum !== "undefined") this.maximum = normalizedSchema.maximum;

  }

}
