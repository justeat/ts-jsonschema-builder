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

      if (expr.left.type !== "MemberExpression" ||
        expr.left.object.type !== "Identifier" ||
        expr.left.object.name !== "x") return { ok: false };

      const val = (expr.right as Literal).value as number;

      const definition: PrimitiveSchema = {
        type: "string"
      };
      if (["==", "===", ">="].includes(expr.operator)) { definition.minLength = val; }
      if (["==", "===", "<="].includes(expr.operator)) { definition.maxLength = val; }
      if (expr.operator === "<") { definition.maxLength = val - 1; }
      if (expr.operator === ">") { definition.minLength = val + 1; }

      console.log("AS STR", {
        ex: JSON.stringify(expression)
      })

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

      if (expr.left.type !== "MemberExpression" ||
        expr.left.object.type !== "Identifier" ||
        expr.left.object.name !== "x") return { ok: false };

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

  private parse(value: any, arrayOptions: ArrayOptions): PrimitiveSchema | null {
    const isArrayType = typeof arrayOptions !== "undefined";

    if (value instanceof RegExp) return { type: "string", pattern: value.source };
    if (value instanceof Date) {
      return { type: "string", format: "date-time", pattern: escapeStringRegexp(value.toISOString()) };
    }
    if (typeof value === "string") return { type: "string", pattern: escapeStringRegexp(value) };
    if (typeof value === "number") return { type: "number", minimum: value, maximum: value };
    if (typeof value === "boolean") return { type: "boolean", enum: [value] };
    if (Array.isArray(value) && value.length === 2 && !isArrayType) return { type: "number", minimum: value[0], maximum: value[1] };
    if (Array.isArray(value) && isArrayType) return { type: "array", uniqueItems: !!(arrayOptions & ArrayOptions.UniqueItems) };

    if (value instanceof Function) {
      const expression = esprima.parseModule(value.toString());

      if (typeof arrayOptions !== "undefined") {
        const asArr = this.tryParseAsArray(expression);
        if (asArr.ok) return asArr.definition;
      }

      const asNum = this.tryParseAsNumber(expression);
      if (asNum.ok) return asNum.definition;

      const asStr = this.tryParseAsString(expression);
      if (asStr.ok) return asStr.definition;
    }

    throw new Error(`Unsupposrt type. '${value.constructor}'`)
  }

  with(selector: (model: T) => string, value: string | RegExp): Schema<T>;
  with(selector: (model: T) => string, value: (model: string) => boolean): Schema<T>;
  with(selector: (model: T) => number, value: number | [number, number]): Schema<T>;
  with(selector: (model: T) => number, value: (model: number) => boolean): Schema<T>;
  with(selector: (model: T) => boolean, value: boolean): Schema<T>;
  with(selector: (model: T) => Date, value: Date): Schema<T>;
  with(selector: (model: T) => any[], value: any[], options: ArrayOptions): Schema<T>;
  with(selector: (model: T) => any[], value: (model: any[]) => boolean, options: ArrayOptions): Schema<T>;
  // with(selector: (model: T) => Array<any>, value: (model: Array<any>) => boolean, options: ArrayOptions): Schema<T>;
  with(selector: any, value: any, options?: undefined): any {
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
      if ($member.leaf) $ref.properties[$member.title] = this.parse(value, options);
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

// type Prop = { path: string, type: Function, value: any, definition: SchemaTypeOpts<any> };

type PrimitiveSchema =
  { type: "string", pattern?: RegExp | String, format?: String, minLength?: number, maxLength?: number } |
  { type: "array", minItems?: number, maxItems?: number, uniqueItems?: boolean } |
  { type: "number", minimum?: number, maximum?: number } |
  { type: "boolean", enum: boolean[] }



// Options flags must not clash with other Options enums. This is what allows type detection
export enum ArrayOptions {
  Default = 0,
  UniqueItems = 1 << 1,
}

export enum DateOptions {
  Default = 1 << 2,
  AllowAdditional = 1 << 3,
}