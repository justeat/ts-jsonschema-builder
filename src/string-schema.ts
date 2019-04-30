import { parseAsRange } from "./expression-parser";
import { ITypeSchema } from "./type-schema";

export interface IStringSchema extends ITypeSchema<"string"> {
  readonly type?: "string";

  /**
   * @description The format keyword allows for basic semantic validation on certain kinds of string values that are commonly used.
   * Built-in formats: `date-time`, `email`, `hostname`, `ipv4`, `ipv6`, `uri`
   * @example
   * new StringSchema({
   *   format: "date-time"
   * })
   * @see https://json-schema.org/understanding-json-schema/reference/string.html#format
   */
  format?: "date-time" | "email" | "hostname" | "ipv4" | "ipv6" | "uri";

  /**
   * @description The pattern keyword is used to restrict a string to a particular regular expression.
   * @see https://json-schema.org/understanding-json-schema/reference/string.html#regular-expressions
   */
  pattern?: RegExp;

  /**
   * @description The length of a string can be constrained using the minLength and maxLength keywords. For both keywords, the value must be a non-negative number.
   * @see https://json-schema.org/understanding-json-schema/reference/string.html#length
   */
  minLength?: number;

  /**
   * @description The length of a string can be constrained using the minLength and maxLength keywords. For both keywords, the value must be a non-negative number.
   * @see https://json-schema.org/understanding-json-schema/reference/string.html#length
   */
  maxLength?: number;

  /**
   * @description The length of a string can be constrained using Expression. x => x < 10, Supported operators: `==`, `===`, `>=`, `<=`, `>`, `<`
   * @see https://json-schema.org/understanding-json-schema/reference/string.html#length
   */
  length?: (model: number) => boolean;

  /**
   * @description The enum keyword is used to restrict a value to a fixed set of values. It must be an array with at least one element, where each element is unique.
   * @see https://json-schema.org/understanding-json-schema/reference/generic.html#enumerated-values
   */
  enum?: string[];
}

export class StringSchema {
  public readonly type = "string";

  public readonly format?: "date-time" | "email" | "hostname" | "ipv4" | "ipv6" | "uri";
  public readonly pattern?: string;
  public readonly minLength?: number;
  public readonly maxLength?: number;
  enum?: string[];

  public required: boolean = true;

  constructor(schema?: (model: number) => boolean);
  constructor(schema?: IStringSchema);
  constructor(schema?: any) {
    schema = schema || {};
    this.required = typeof schema.required === "undefined" ? this.required : schema.required;
    Object.defineProperty(this, "required", { enumerable: false, writable: true });

    let normalizedSchema: IStringSchema;
    if (schema instanceof Function) normalizedSchema = { length: schema };
    else normalizedSchema = schema;

    if (typeof normalizedSchema.length !== "undefined") {
      const range = parseAsRange(normalizedSchema.length);
      if (typeof range.max !== "undefined") this.maxLength = range.max;
      if (typeof range.min !== "undefined") this.minLength = range.min;
      if (range.isMaxExclusive) this.maxLength--;
      if (range.isMinExclusive) this.minLength++;
    }

    if (typeof normalizedSchema.format !== "undefined") this.format = normalizedSchema.format;
    if (typeof normalizedSchema.maxLength !== "undefined") this.maxLength = normalizedSchema.maxLength;
    if (typeof normalizedSchema.minLength !== "undefined") this.minLength = normalizedSchema.minLength;
    if (typeof normalizedSchema.pattern !== "undefined") this.pattern = normalizedSchema.pattern.source;
    if (typeof normalizedSchema.enum !== "undefined") this.enum = normalizedSchema.enum;
  }
}
