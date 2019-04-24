import * as esprima from "esprima";
import { ExpressionStatement, ArrowFunctionExpression, MemberExpression, Identifier, ReturnStatement, BinaryExpression, Literal, Program } from "estree";
import escapeStringRegexp from "escape-string-regexp";

export class Schema<T> {
  private schema: { properties: {}, type: string };

  constructor() {
    this.schema = { type: "object", properties: {} };
  }

  private getMemberExpression(selector: (model: any) => any): MemberExpression {

    const expression = esprima.parseModule(selector.toString());
    const es = expression.body[0] as ExpressionStatement;
    const afe = es.expression as ArrowFunctionExpression;
    let memberExpr: MemberExpression;
    if (afe.body.type === "BlockStatement" && afe.body.body[0].type === "ReturnStatement") {
      memberExpr = (afe.body.body[0] as ReturnStatement).argument as MemberExpression;
    } else if (afe.body.type === "MemberExpression") {
      memberExpr = afe.body;
    }
    return memberExpr;
  }

  private tryParseAsNumber(expression: Program): { ok: true, definition: PrimitiveSchema } | { ok: false } {

    try {

      const expr = ((
        expression.body[0] as ExpressionStatement)
        .expression as ArrowFunctionExpression)
        .body as BinaryExpression;

      if (expr.left.type !== "Identifier" || expr.left.name !== "x") return { ok: false };

      const val = (expr.right as Literal).value as number;

      const definition: PrimitiveSchema = {
        type: "number"
      };
      if (["==", "===", ">="].includes(expr.operator)) { definition.minimum = val; }
      if (["==", "===", "<="].includes(expr.operator)) { definition.maximum = val; }
      if (expr.operator === "<") { definition.maximum = val - 1; }
      if (expr.operator === ">") { definition.minimum = val + 1; }

      return {
        ok: true,
        definition
      }
    }
    catch (err) {
      return {
        ok: false
      }
    }
  }
  private tryParseAsString(expression: Program): { ok: true, definition: PrimitiveSchema } | { ok: false } {

    try {

      const expr = ((
        expression.body[0] as ExpressionStatement)
        .expression as ArrowFunctionExpression)
        .body as BinaryExpression;

      if (expr.left.type !== "Identifier" || expr.left.name !== "x") return { ok: false };

      const val = (expr.right as Literal).value as number;

      const definition: PrimitiveSchema = {
        type: "string"
      };
      if (["==", "===", ">="].includes(expr.operator)) { definition.minLength = val; }
      if (["==", "===", "<="].includes(expr.operator)) { definition.maxLength = val; }
      if (expr.operator === "<") { definition.maxLength = val - 1; }
      if (expr.operator === ">") { definition.minLength = val + 1; }

      return {
        ok: true,
        definition
      }
    }
    catch (err) {
      return {
        ok: false
      }
    }
  }
  private tryParseAsArray(expression: Program): { ok: true, definition: PrimitiveSchema } | { ok: false } {

    try {

      const expr = ((
        expression.body[0] as ExpressionStatement)
        .expression as ArrowFunctionExpression)
        .body as BinaryExpression;

      if (expr.left.type !== "Identifier" || expr.left.name !== "x") return { ok: false };

      const val = (expr.right as Literal).value as number;

      const definition: PrimitiveSchema = {
        type: "array"
      };
      if (["==", "===", ">="].includes(expr.operator)) { definition.minItems = val; }
      if (["==", "===", "<="].includes(expr.operator)) { definition.maxItems = val; }
      if (expr.operator === "<") { definition.maxItems = val - 1; }
      if (expr.operator === ">") { definition.minItems = val + 1; }

      return {
        ok: true,
        definition
      }
    }
    catch (err) {
      return {
        ok: false
      }
    }
  }

  private parse(value: any): PrimitiveSchema | null {
    if (value instanceof RegExp) return { type: "string", pattern: value.source };
    if (typeof value === "string") return { type: "string", pattern: escapeStringRegexp(value) };
    if (typeof value === "number") return { type: "number", minimum: value, maximum: value };
    if (typeof value === "boolean") return { type: "boolean", enum: [value] };
    if (typeof value === "object" && value.type == "array") {
      const typeSchema = value as IArraySchema;

      const result: PrimitiveSchema = {
        type: "array",
      }

      if (typeof value.length !== "undefined") {
        const asArr = this.tryParseAsArray(esprima.parseModule(value.length.toString()));
        if (!asArr.ok || asArr.definition.type !== "array") throw new Error("Only array type schema supported");

        if (typeof asArr.definition.maxItems !== "undefined") result.maxItems = asArr.definition.maxItems;
        if (typeof asArr.definition.minItems !== "undefined") result.minItems = asArr.definition.minItems;
        if (typeof asArr.definition.uniqueItems !== "undefined") result.uniqueItems = asArr.definition.uniqueItems;
      }

      if (typeof typeSchema.maxItems !== "undefined") result.maxItems = typeSchema.maxItems;
      if (typeof typeSchema.minItems !== "undefined") result.minItems = typeSchema.minItems;
      if (typeof typeSchema.uniqueItems !== "undefined") result.uniqueItems = typeSchema.uniqueItems;
      if (typeof typeSchema.additionalItems !== "undefined") result.additionalItems = typeSchema.additionalItems;
      if (typeof typeSchema.items !== "undefined") result.items = typeSchema.items.map(i => {
        return {
          type: typeof i,
          enum: [i]
        }
      });

      return result;

    };
    if (typeof value === "object" && value.type === "string") {
      const typeSchema = value as IStringSchema;

      const result: PrimitiveSchema = {
        type: "string",
      }

      if (typeof value.length !== "undefined") {
        const asStr = this.tryParseAsString(esprima.parseModule(value.length.toString()));
        if (!asStr.ok || asStr.definition.type !== "string") throw new Error("Only array type schema supported");

        if (typeof asStr.definition.format !== "undefined") result.format = asStr.definition.format;
        if (typeof asStr.definition.maxLength !== "undefined") result.maxLength = asStr.definition.maxLength;
        if (typeof asStr.definition.minLength !== "undefined") result.minLength = asStr.definition.minLength;
        if (typeof asStr.definition.pattern !== "undefined") result.pattern = asStr.definition.pattern;
      }

      if (typeof typeSchema.format !== "undefined") result.format = typeSchema.format;
      if (typeof typeSchema.maxLength !== "undefined") result.maxLength = typeSchema.maxLength;
      if (typeof typeSchema.minLength !== "undefined") result.minLength = typeSchema.minLength;
      if (typeof typeSchema.pattern !== "undefined") result.pattern = typeSchema.pattern;

      return result;
    }
    if (typeof value === "object" && value.type === "number") {
      const typeSchema = value as INumberSchema;

      const result: PrimitiveSchema = {
        type: "number",
      }

      if (typeof value.length !== "undefined") {
        const asNum = this.tryParseAsNumber(esprima.parseModule(value.length.toString()));
        if (!asNum.ok || asNum.definition.type !== "number") throw new Error("Only array type schema supported");

        if (typeof asNum.definition.multipleOf !== "undefined") result.multipleOf = asNum.definition.multipleOf; //todo: null check helper?
        if (typeof asNum.definition.minimum !== "undefined") result.minimum = asNum.definition.minimum;
        if (typeof asNum.definition.maximum !== "undefined") result.maximum = asNum.definition.maximum;
      }

      if (typeof typeSchema.multipleOf !== "undefined") result.multipleOf = typeSchema.multipleOf;
      if (typeof typeSchema.minimum !== "undefined") result.minimum = typeSchema.minimum;
      if (typeof typeSchema.maximum !== "undefined") result.maximum = typeSchema.maximum;

      return result;
    }

    if (value instanceof Function) {
      const expression = esprima.parseModule(value.toString());

      const asNum = this.tryParseAsNumber(expression);
      if (asNum.ok) return asNum.definition;

      const asStr = this.tryParseAsString(expression);
      if (asStr.ok) return asStr.definition;
    }

    throw new Error(`Unsupported type. '${value.constructor}'`)
  }



  /**
   * @description Specify length for a string property
   * @param {(model: T) => string} selector String property selector
   * @param {(model: number) => boolean} schema The length of a string can be constrained using Expression. x => x < 10, Supported operators: `==`, `===`, `>=`, `<=`, `>`, `<`
   * @example
   * .with(m => m.StringProp, x => x < 10);
   */
  with(selector: (model: T) => string, schema: (model: number) => boolean): Schema<T>;

  /**
   * @description Specify schema for a string property
   * @param {(model: T) => string} selector String property selector
   * @param {IStringSchema} schema String schema
   * @example
   * .with(m => m.StringProp, new StringSchema({...}));
   */
  with(selector: (model: T) => string, schema: IStringSchema): Schema<T>;

  /**
   * @description Specify value or RegExp pattern for a string property
   * @param {(model: T) => string} selector String property selector
   * @param {string | RegExp} schema The pattern is used to restrict a string to a particular regular expression.
   * @example
   * .with(m => m.StringProp, "specificValue");
   * .with(m => m.StringProp, /^[A-z]+\.[A-z]+$/);
   */
  with(selector: (model: T) => string, schema: string | RegExp): Schema<T>;

  /**
   * @description Specify value for a number property
   * @param {(model: T) => number} selector Number property selector
   * @param {number} schema The value is used to restrict number property.
   * @example
   * .with(m => m.NumberProp, 10);
   */
  with(selector: (model: T) => number, schema: number): Schema<T>;

  /**
   * @description Specify range for a number property
   * @param {(model: T) => number} selector Number property selector
   * @param {(model: number) => boolean} schema The range of a number can be constrained using Expression. x => x < 10, Supported operators: `==`, `===`, `>=`, `<=`, `>`, `<`
   * @example
   * .with(m => m.NumberProp, x => x < 10);
   */
  with(selector: (model: T) => number, schema: (model: number) => boolean): Schema<T>;

  /**
   * @description Specify schema for a number property
   * @param {(model: T) => number} selector Number property selector
   * @param {INumberSchema} schema Number schema
   * @example
   * .with(m => m.StringProp, new NumberSchema({...}));
   */
  with(selector: (model: T) => number, schema: INumberSchema): Schema<T>;

  /**
   * @description Specify value for a boolean property
   * @param {(model: T) => boolean} selector Boolean property selector
   * @param {boolean} schema The value is used to restrict boolean property.
   * @example
   * .with(m => m.BooleanProp, 10);
   */
  with(selector: (model: T) => boolean, schema: boolean): Schema<T>;

  /**
   * @description Specify schema for a array property
   * @param {(model: T) => any[]} selector Array property selector
   * @param {IArraySchema} schema Array schema
   * @example
   * .with(m => m.ArrayProp, new ArraySchema({...}));
   */
  with(selector: (model: T) => any[], schema: IArraySchema): Schema<T>;
  with(selector: any, schema: any): any {
    const memberExpr = this.getMemberExpression(selector);

    const invertedExpression = [];
    let nextObj: MemberExpression = memberExpr;
    while (nextObj) {
      invertedExpression.unshift({
        title: (nextObj.property as Identifier).name
      });
      nextObj = nextObj.object.type === "MemberExpression" ? nextObj.object as MemberExpression : null;
    }
    invertedExpression[invertedExpression.length - 1].leaf = true;


    let $ref: any = this.schema, $member;
    for ($member of invertedExpression) {
      $ref.properties = $ref.properties || {};
      if ($member.leaf) $ref.properties[$member.title] = this.parse(schema);
      else $ref.properties[$member.title] = $ref.properties[$member.title] || { title: $member.title, type: "object" }

      $ref.required = $ref.required ? Array.from(new Set([...$ref.required, $member.title])) : [$member.title];
      $ref = $ref.properties[$member.title];
    }

    return this;
  }

  public build(): Object {

    console.log({ definition: JSON.stringify(this.schema) });

    return this.schema;
  }

}


// todo: replace below with interfaces
type PrimitiveSchema =
  { type: "string", pattern?: RegExp | String, format?: String, minLength?: number, maxLength?: number } |
  { type: "array", minItems?: number, maxItems?: number, uniqueItems?: boolean, additionalItems?: boolean, items?: { type: string, enum?: any[] }[] } |
  { type: "number", multipleOf?: number, minimum?: number, maximum?: number } |
  { type: "boolean", enum: boolean[] }



export interface ITypeSchema {
  readonly type: string,
}

export interface IArraySchema {

  /**
   * @description The length of the array can be specified using the minItems and maxItems keywords. The value of each keyword must be a non-negative number. These keywords work whether doing List validation or Tuple validation.
   * @see https://json-schema.org/understanding-json-schema/reference/array.html#length
   */
  readonly minItems?: number,

  /**
   * @description The length of the array can be specified using the minItems and maxItems keywords. The value of each keyword must be a non-negative number. These keywords work whether doing List validation or Tuple validation.
   * @see  https://json-schema.org/understanding-json-schema/reference/array.html#length
   */
  readonly maxItems?: number,

  /**
   * @description A schema can ensure that each of the items in an array is unique. Simply set the uniqueItems keyword to true.
   * @see https://json-schema.org/understanding-json-schema/reference/array.html#uniqueness
   */
  readonly uniqueItems?: boolean,

  /**
   * @description The length of the array can be specified using Expression. x => x < 10. Supported operators: `==`, `===`, `>=`, `<=`, `>`, `<`
   * @see https://json-schema.org/understanding-json-schema/reference/array.html#length
   */
  readonly length?: (model: number) => boolean

  /**
   * @description Tuple validation is useful when the array is a collection of items where each has a different schema and the ordinal index of each item is meaningful.
   * @see https://json-schema.org/understanding-json-schema/reference/array.html#tuple-validation
   */
  readonly items?: any[]

  /**
   * @description The additionalItems keyword controls whether it’s valid to have additional items in the array beyond what is defined in items.
   * @see https://json-schema.org/understanding-json-schema/reference/array.html#tuple-validation
   */
  readonly additionalItems?: boolean
}

export class ArraySchema implements IArraySchema, ITypeSchema {
  public type: string = "array";

  public readonly minItems?: number;
  public readonly maxItems?: number;
  public readonly uniqueItems?: boolean;
  public readonly length?: (model: number) => boolean;
  public readonly items?: any[];
  public readonly additionalItems?: boolean;

  constructor(schema: IArraySchema) {
    Object.assign(this, schema);
  }
}
export interface IStringSchema {

  /**
   * @description The format keyword allows for basic semantic validation on certain kinds of string values that are commonly used. 
   * Built-in formats: `date-time`, `email`, `hostname`, `ipv4`, `ipv6`, `uri` 
   * @example
   * new StringSchema({ 
   *   format: "date-time" 
   * })
   * @see https://json-schema.org/understanding-json-schema/reference/string.html#format
   */
  readonly format?: "date-time" | "email" | "hostname" | "ipv4" | "ipv6" | "uri"; //todo: only date-time tested

  /**
   * @description The pattern keyword is used to restrict a string to a particular regular expression.
   * @see https://json-schema.org/understanding-json-schema/reference/string.html#regular-expressions
   */
  readonly pattern?: RegExp;

  /**
   * @description The length of a string can be constrained using the minLength and maxLength keywords. For both keywords, the value must be a non-negative number.
   * @see https://json-schema.org/understanding-json-schema/reference/string.html#length
   */
  readonly minLength?: number;

  /**
   * @description The length of a string can be constrained using the minLength and maxLength keywords. For both keywords, the value must be a non-negative number.
   * @see https://json-schema.org/understanding-json-schema/reference/string.html#length
   */
  readonly maxLength?: number;

  /**
   * @description The length of a string can be constrained using Expression. x => x < 10, Supported operators: `==`, `===`, `>=`, `<=`, `>`, `<`
   * @see https://json-schema.org/understanding-json-schema/reference/string.html#length
   */
  readonly length?: (model: number) => boolean;
}

export class StringSchema implements IStringSchema, ITypeSchema {
  public readonly type: string = "string";

  public readonly format?: "date-time";
  public readonly pattern?: RegExp;
  public readonly minLength?: number;
  public readonly maxLength?: number;
  readonly length?: (model: number) => boolean; //todo make sure string expression is not in x => x.length > 1 style - remove .length

  constructor(schema: (model: number) => boolean);
  constructor(schema: IStringSchema);
  constructor(schema: any) {
    if (schema instanceof Function) this.length = schema
    else Object.assign(this, schema);
  }
}

export interface INumberSchema {

  /**
   * @description Numbers can be restricted to a multiple of a given number, using the multipleOf keyword. It may be set to any positive number.
   * @see https://json-schema.org/understanding-json-schema/reference/numeric.html#multiples
   */
  readonly multipleOf?: number;

  /**
   * @description Ranges of numbers are specified using a combination of the minimum and maximum keywords
   * @see https://json-schema.org/understanding-json-schema/reference/numeric.html#range
   */
  readonly minimum?: number;

  /**
   * @description Ranges of numbers are specified using a combination of the minimum and maximum keywords
   * @see https://json-schema.org/understanding-json-schema/reference/numeric.html#range
   */
  readonly maximum?: number;

  /**
   * @description Ranges of numbers are specified using Expression. x => x < 10, Supported operators: `==`, `===`, `>=`, `<=`, `>`, `<`
   * @example 
   * new NumberSchema({
   *     value: x => x <= 15
   * })
   * @see https://json-schema.org/understanding-json-schema/reference/numeric.html#range
   */
  readonly value?: (model: number) => boolean;
}

export class NumberSchema implements INumberSchema, ITypeSchema {
  public readonly type: string = "number";

  public readonly multipleOf?: number;
  public readonly minimum?: number;
  public readonly maximum?: number;
  readonly value?: (model: number) => boolean;

  constructor(schema: INumberSchema) {
    Object.assign(this, schema);
  }
}