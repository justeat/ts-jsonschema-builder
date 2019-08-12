import { parseSchema } from "./schema-parser";
import { PropertySchema } from "./type-schema";

export type Combination = string | RegExp | number | boolean | PropertySchema;

/**
 * @description property must match ANY of the specified schemas.
 * @see https://json-schema.org/understanding-json-schema/reference/combining.html#anyof
 */
export class AnyOf extends PropertySchema {
  public anyOf: PropertySchema[];

  constructor(schemas: Combination[]) {
    super({ required: true });
    this.anyOf = schemas.map(s => parseSchema(s).compile());
  }
}

/**
 * @description property must match strictly ONE of the specified schemas.
 * @see https://json-schema.org/understanding-json-schema/reference/combining.html#oneof
 */
export class OneOf extends PropertySchema {
  public oneOf: PropertySchema[];
  public required: boolean = true;

  constructor(schemas: Combination[]) {
    super({ required: true });
    this.oneOf = schemas.map(s => parseSchema(s).compile());
  }
}

/**
 * @description property must match ALL of the specified schemas.
 * @see https://json-schema.org/understanding-json-schema/reference/combining.html#allof
 */
export class AllOf extends PropertySchema {
  public allOf: PropertySchema[];
  public required: boolean = true;

  constructor(schemas: Combination[]) {
    super({ required: true });
    this.allOf = schemas.map(s => parseSchema(s).compile());
  }
}

/**
 * @description property must NOT match specified schema.
 * @see https://json-schema.org/understanding-json-schema/reference/combining.html#not
 */
export class Not extends PropertySchema {
  public not: Combination;
  public required: boolean = true;

  constructor(schema: Combination) {
    super({ required: true });
    this.not = parseSchema(schema).compile();
  }
}
