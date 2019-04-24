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

    if (Array.isArray(value) && value.length > 0) return {
      type: "array", items: {
        type: typeof value[0],
        enum: value
      }
    };

    if (value instanceof Function) {
      const expression = esprima.parseModule(value.toString());

      const asNum = this.tryParseAsNumber(expression);
      if (asNum.ok) return asNum.definition;

      const asStr = this.tryParseAsString(expression);
      if (asStr.ok) return asStr.definition;
    }

    throw new Error(`Unsupported type. '${value.constructor}'`)
  }

  with(selector: (model: T) => string, value: (model: number) => boolean): Schema<T>;
  with(selector: (model: T) => string, value: IStringSchema): Schema<T>;
  with(selector: (model: T) => string, value: string | RegExp): Schema<T>;
  with(selector: (model: T) => number, value: number): Schema<T>;
  with(selector: (model: T) => number, value: (model: number) => boolean): Schema<T>;
  with(selector: (model: T) => number, value: INumberSchema): Schema<T>;
  with(selector: (model: T) => boolean, value: boolean): Schema<T>;
  with(selector: (model: T) => any[], value: IArraySchema): Schema<T>;
  with(selector: (model: T) => any[], value: any[]): Schema<T>;
  with(selector: any, value: any): any {
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
      if ($member.leaf) $ref.properties[$member.title] = this.parse(value);
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
  { type: "array", minItems?: number, maxItems?: number, uniqueItems?: boolean, items?: { type: string, enum?: any[] } } |
  { type: "number", multipleOf?: number, minimum?: number, maximum?: number } |
  { type: "boolean", enum: boolean[] }



export interface ITypeSchema {
  readonly type: string,
}

export interface IArraySchema {
  readonly minItems?: number,
  readonly maxItems?: number,
  readonly uniqueItems?: boolean,
  readonly length?: (model: number) => boolean
}

export class ArraySchema implements IArraySchema, ITypeSchema {
  public type: string = "array";

  public readonly minItems?: number;
  public readonly maxItems?: number;
  public readonly uniqueItems?: boolean;
  public readonly length?: (model: number) => boolean;

  constructor(schema: IArraySchema) {
    Object.assign(this, schema);
  }
}
export interface IStringSchema {
  readonly format?: "date-time";
  readonly pattern?: RegExp;
  readonly minLength?: number;
  readonly maxLength?: number;
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
  readonly multipleOf?: number; // todo: test
  readonly minimum?: number;
  readonly maximum?: number;
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