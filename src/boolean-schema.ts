import { ITypeSchema, TypeSchema } from "./type-schema";

export interface IBooleanSchema extends ITypeSchema<"boolean"> {
  readonly type?: "boolean";

  /**
   * @description The enum keyword is used to restrict a value to a fixed set of values. It must be an array with at least one element, where each element is unique.
   * @see https://json-schema.org/understanding-json-schema/reference/generic.html#enumerated-values
   */
  enum?: Array<boolean>;
}

export class BooleanSchema extends TypeSchema<"boolean"> {
  public readonly type = "boolean";

  public enum?: Array<boolean>;

  constructor();
  constructor(schema: boolean);
  constructor(schema: IBooleanSchema);
  constructor(schema?: any) {
    super(schema);
    schema = schema || {};

    if (typeof schema === "boolean") this.enum = [schema];
    else if (typeof schema.enum !== "undefined") this.enum = schema.enum;
  }
}
