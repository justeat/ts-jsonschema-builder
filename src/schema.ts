import * as esprima from "esprima";
import { MemberExpression, Identifier, ArrowFunctionExpression, ExpressionStatement, ReturnStatement } from "estree";

import { StringSchema, ArraySchema, NumberSchema, BooleanSchema, INumberSchema, IBooleanSchema, IArraySchema } from "./";


export class Schema<T> {
  private schema: { $schema: string, properties: {}, type: string };

  constructor() {
    this.schema = { $schema: "http://json-schema.org/draft-04/schema#", type: "object", properties: {} };
  }

  private getMemberExpression(selector: (model: any) => any): MemberExpression {

    const expression = esprima.parseModule(selector.toString().replace(/function \(?(\w)\)?/, "$1 =>"));
    const es = expression.body[0] as ExpressionStatement;
    const afe = es.expression as ArrowFunctionExpression;
    let memberExpr: MemberExpression;
    if (afe.body.type === "BlockStatement" && afe.body.body[0].type === "ReturnStatement") {
      memberExpr = (afe.body.body[0] as ReturnStatement).argument as MemberExpression;
    } else if (afe.body.type === "MemberExpression") {
      memberExpr = afe.body;
    }
    else throw new Error("Invalid expression.");
    return memberExpr;
  }

  private parse(value: any): StringSchema | ArraySchema | NumberSchema | BooleanSchema {
    if (value instanceof RegExp) return new StringSchema({ type: "string", pattern: value });
    if (typeof value === "string") return new StringSchema({ type: "string", enum: [value] });
    if (typeof value === "number") return new NumberSchema({ type: "number", minimum: value, maximum: value });
    if (typeof value === "boolean") return new BooleanSchema({ type: "boolean", enum: [value] });

    if (typeof value === "object" && value.type == "array") return value;
    if (typeof value === "object" && value.type === "string") return value;
    if (typeof value === "object" && value.type === "number") return value;
    if (typeof value === "object" && value.type === "boolean") return value;

    if (value instanceof Function) return new NumberSchema(value);

    throw new Error(`Unsupported type. '${value.constructor.name}', '${typeof value}'`)
  }

  /**
   * @description Specify schema for a string property
   * @param {(model: T) => string} selector String property selector
   * @param {IStringSchema} schema String schema
   * @example
   * .with(m => m.StringProp, new StringSchema({...}));
   */
  with(selector: (model: T) => string, schema: StringSchema): Schema<T>;

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
   * @description Specify schema for a boolean property
   * @param {(model: T) => boolean} selector Boolean property selector
   * @param {IBooleanSchema} schema Boolean schema
   * @example
   * .with(m => m.StringProp, new BooleanSchema());
   */
  with(selector: (model: T) => boolean, schema: IBooleanSchema): Schema<T>;

  /**
   * @description Specify schema for a array property
   * @param {(model: T) => any[]} selector Array property selector
   * @param {IArraySchema} schema Array schema
   * @example
   * .with(m => m.ArrayProp, new ArraySchema({...}));
   */
  with(selector: (model: T) => any[] | undefined, schema: IArraySchema): Schema<T>;
  with(selector: any, schema: any): any {
    const memberExpr = this.getMemberExpression(selector);

    const invertedExpression: { title: string, leaf?: boolean }[] = [];
    let nextObj: MemberExpression | null = memberExpr;
    while (nextObj) {
      invertedExpression.unshift({
        title: (nextObj.property as Identifier).name
      });
      nextObj = nextObj.object.type === "MemberExpression" ? nextObj.object as MemberExpression : null;
    }
    invertedExpression[invertedExpression.length - 1].leaf = true;

    const normalizedSchema = this.parse(schema);
    let $ref: any = this.schema, $member;
    for ($member of invertedExpression) {
      $ref.properties = $ref.properties || {};
      if ($member.leaf) $ref.properties[$member.title] = Object.assign({}, normalizedSchema);
      else $ref.properties[$member.title] = $ref.properties[$member.title] || { title: $member.title, type: "object" }

      if (normalizedSchema.required) {
        $ref.required = $ref.required ? Array.from(new Set([...$ref.required, $member.title])) : [$member.title];
      }
      $ref = $ref.properties[$member.title];
    }

    return this;
  }

  public build(): Object {
    return this.schema;
  }
}
