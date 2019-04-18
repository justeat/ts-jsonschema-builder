import { Mongoose, SchemaDefinition, SchemaType, SchemaTypeOpts } from "mongoose";
import extendMongooose from "mongoose-schema-jsonschema";
import { v4 } from "uuid";
import * as esprima from "esprima";
import { ExpressionStatement, ArrowFunctionExpression, MemberExpression, Expression, Identifier, ReturnStatement, BinaryExpression, Literal, BaseExpression, Program } from "estree";
const mongoose = extendMongooose(require("mongoose")) as Mongoose;

export class Schema<T> {

  private _map: Prop[] = [];

  private compileMemberExpression(expression: MemberExpression): string {
    let str = "", nextObj: MemberExpression;
    nextObj = expression;
    while (nextObj) {
      str = `${(nextObj.property as Identifier).name}${str ? "." : ""}${str}`;
      nextObj = nextObj.object.type === "MemberExpression" ? nextObj.object as MemberExpression : null;
    }

    return str;
  }

  private compileExpression(selector: (model: any) => any) {

    const expression = esprima.parseModule(selector.toString());
    const es = expression.body[0] as ExpressionStatement;
    const afe = es.expression as ArrowFunctionExpression;
    let memberExpr: MemberExpression;
    if (afe.body.type === "BlockStatement" && afe.body.body[0].type === "ReturnStatement") {
      memberExpr = (afe.body.body[0] as ReturnStatement).argument as MemberExpression;
    } else if (afe.body.type === "MemberExpression") {
      memberExpr = afe.body;
    }
    return this.compileMemberExpression(memberExpr);
  }

  private tryParseAsNumber(expression: Program): { ok: true, val: number, definition: SchemaTypeOpts<any> } | { ok: false } {

    try {

      const expr = ((
        expression.body[0] as ExpressionStatement)
        .expression as ArrowFunctionExpression)
        .body as BinaryExpression;

      const val = (expr.right as Literal).value as number;

      const definition: SchemaTypeOpts<any> = {
        min: ["==", "===", ">="].includes(expr.operator) ? val : undefined,
        max: ["==", "===", "<="].includes(expr.operator) ? val : undefined
      };
      if (expr.operator === "<") { definition.max = val - 1; }
      if (expr.operator === ">") { definition.min = val + 1; }

      return {
        ok: true,
        val: val,
        definition
      }
    }
    catch (err) {
      return {
        ok: false
      }
    }
  }

  private parse(value: any): { type: Function, value: RegExp | String | Number | Date, definition: SchemaTypeOpts<any> } {
    if (value instanceof RegExp) return { type: String, value: value, definition: {  } };
    if (value instanceof Date) {
      console.log("DATE", { type: Date, value: value, definition: { min: value, max: value } })
      return { type: Date, value: value, definition: {  } };}
    if (typeof value === "string") return { type: String, value: value, definition: { match: value } };
    if (typeof value === "number") return { type: Number, value: value, definition: { min: value, max: value } };

    if (value instanceof Function) {
      const expression = esprima.parseModule(value.toString());
      const asNum = this.tryParseAsNumber(expression);
      if (asNum.ok) {
        return { type: Number, value: asNum.val, definition: asNum.definition };
      }
    }

    console.log("TOO FAR")
    return { type: value.constructor, value, definition: { match: value } };
  }


  with(selector: (model: T) => string, value: string | RegExp): Schema<T>;
  with(selector: (model: T) => number, value: number): Schema<T>;
  with(selector: (model: T) => number, value: (model: number) => boolean): Schema<T>;
  with(selector: (model: T) => Date, value: Date): Schema<T>;
  with(selector: any, value: any): any {



    const path = this.compileExpression(selector);
    this._map.push({
      path,
      ...this.parse(value),
    } as Prop);


    return this;
  }

  public build(): Object {
    const definition: SchemaDefinition = {
    };

    this._map.forEach(prop => {

      const def: SchemaTypeOpts<any> = {
        required: true,
        type: prop.type,
        ...prop.definition
      };

      definition[prop.path] = def;
    });


    console.log({ definition: JSON.stringify(definition) });
    const schema = new mongoose.Schema(definition);

    const model = mongoose.model(v4().split("-")[0], schema);
    const json = (model as any).jsonSchema();
    delete json.properties._id;
    delete json.properties.__v;

    return json;
  }

}

type Prop = { path: string, type: Function, value: any, definition: SchemaTypeOpts<any> };
