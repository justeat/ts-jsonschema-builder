import { Mongoose, SchemaDefinition } from "mongoose";
import extendMongooose from "mongoose-schema-jsonschema";
import { v4 } from "uuid";
import * as esprima from "esprima";
import { ExpressionStatement, ArrowFunctionExpression, MemberExpression, Expression, Identifier, ReturnStatement } from "estree";
const mongoose = extendMongooose(require("mongoose")) as Mongoose;

export class Model {
  public propA: string;
  public propB: number;
  public propC: boolean;
  public propD: Model2;
}

export class Model2 {
  public propF: string;
}

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

  private getType(value: any): Function {
    if (value instanceof RegExp) return String;

    return value.constructor;
  }

  with(selector: (model: T) => string, value: string | RegExp): Schema<T>;
  with(selector: (model: T) => number, value: number): Schema<T>;
  with(selector: any, value: any): any {

    const path = this.compileExpression(selector);
    this._map.push({
      path,
      type: this.getType(value),
      valueType: value.constructor,
      value
    } as Prop);

    return this;
  }

  public build(): Object {
    const definition: SchemaDefinition = {
    };

    console.log("this._map", this._map);

    this._map.forEach(prop => {
      definition[prop.path] = {
        type: prop.type,
        required: true,
        match: prop.valueType === RegExp ? prop.value : undefined
      };
    });

    const schema = new mongoose.Schema(definition);

    const model = mongoose.model(v4().split("-")[0], schema);
    const json = (model as any).jsonSchema();
    delete json.properties._id;
    delete json.properties.__v;

    console.log("SCHEMA", JSON.stringify(json));

    return json;
  }

}

type Prop = { path: string, type: Function, valueType: Function, value: any };
