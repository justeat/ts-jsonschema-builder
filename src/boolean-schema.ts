import { ITypeSchema } from "./type-schema";

export interface IBooleanSchema extends ITypeSchema<"boolean"> {
  readonly type?: "boolean";

  /**
   * @description The enum keyword is used to restrict a value to a fixed set of values. It must be an array with at least one element, where each element is unique.
   * @see https://json-schema.org/understanding-json-schema/reference/generic.html#enumerated-values
   */
  enum?: boolean[];
}

export class BooleanSchema implements IBooleanSchema {
  public readonly type = "boolean";

  public enum?: boolean[];

  public required: boolean = true;

  constructor(schema?: IBooleanSchema) {
    schema = schema || {};
    this.required = typeof schema.required === "undefined" ? this.required : schema.required;
    Object.defineProperty(this, "required", { enumerable: false, writable: true });

    if (typeof schema.enum !== "undefined") this.enum = schema.enum;
  }
}
