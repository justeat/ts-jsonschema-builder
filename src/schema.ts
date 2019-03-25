import "reflect-metadata";
import { Mongoose, SchemaDefinition } from "mongoose";
import extendMongooose from "mongoose-schema-jsonschema";
import { v4 } from "uuid";
const mongoose = extendMongooose(require("mongoose")) as Mongoose;

let model;

export function schema(target: any, key: string) {
  const t = Reflect.getMetadata("design:type", target, key);
  console.log(`${key} type: ${t.name}`, t, {
    t, target, key,
    tn: t.name,
  });
}

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
  private obj: T;

  constructor(private ctor: new () => T) {
    this.obj = new this.ctor();
    this.stuffObject();
  }

  private _map: Prop[] = [];

  // with<T2>(selector: (model: T) => string, val?: RegExp | string): Schema<T>;
  with<T2>(selector: (model: T) => T2, value?: T2 | RegExp): Schema<T> {
    const prop = selector(this.obj) as unknown as Prop;

    this._map.push({
      ...this.findInStuffing(prop.path), // map from stuffing
      value,
    } as Prop);

    return this;
  }

  public build(): Object {

    const definition: SchemaDefinition = {};
    console.log("obj", this.o);
    this._map.forEach(prop => {
      definition[prop.name] = { type: prop.type, required: true };
    });

    const schema = new mongoose.Schema(definition);

    model = model || mongoose.model(`${this.ctor.name}-${v4()}`, schema);
    const json = (model as any).jsonSchema();
    delete json.properties._id;
    delete json.properties.__v;

    console.log("SCHEMA", JSON.stringify(json));

    return json;
  }

  private rand(type: Function) {
    switch (type) {
      case String:
        return "String-" + v4();
      case Boolean:
        return "Boolean-" + v4();
      case Number:
        return "Number-" + v4();
      case Date:
        return "Date-" + v4();
      default:
        return false;
    }
  }

  // private findInStuffing(val: string): Prop {
  //   for (const property of TypeDefinition.getMap(this.ctor)) {
  //     const name = property[0];
  //     const prop = this.getObj(this.obj, name)[this.getProp(name)] as Prop;
  //     if (prop.path === val) return prop;
  //   }

  //   throw new Error(`Property with value "${val}" could not be found. Make it is passed in propertyMap or decorated with @schema attribute`);
  // }



  private findInStuffing(value: string): Prop {

    const findInStuffingInner = (obj: any, value: string, map: TypeMap): Prop => {
      if (!map) return;
      for (const val of map) {
        const name = val[0];
        const type = val[1];
        if (obj[name].path === value) return obj[name] as Prop;
        if (typeof (obj[name].path) !== "string") {
          const result = findInStuffingInner(obj[name], value, TypeDefinition.getMap(type));
          if (result && result.path === value) return result;
        }
      }
    };

    const result = findInStuffingInner(this.obj, value, TypeDefinition.getMap(this.ctor));
    if (result) return result;

    throw new Error(`Property with value "${value}" could not be found. Make it is passed in propertyMap or decorated with @schema attribute`);
  }

  private stuffObject() {

    const stuffObjectInner = (obj: any, map: TypeMap) => {

      map.forEach(val => {
        const name = val[0];
        const type = val[1];
        const path = this.rand(type);
        obj[name] = path ? {
          name, type, path: this.rand(type)
        } : stuffObjectInner({}, TypeDefinition.getMap(type));
      });

      return obj;
    };

    stuffObjectInner(this.obj, TypeDefinition.getMap(this.ctor));
  }
}

type TypeMap = [string, Function][];
type Prop = { name: string, type: Function, path: string, value: any };

export class TypeDefinition {
  private static typeMap = new WeakMap<Function, TypeMap>();

  private constructor(private ctor: Function) { }

  public static for(ctor: Function) {
    return new TypeDefinition(ctor);
  }

  public static getMap(ctor: Function) {
    return TypeDefinition.typeMap.get(ctor);
  }

  public add(prop: string, type: Function) {
    if (!TypeDefinition.typeMap.has(this.ctor)) {
      TypeDefinition.typeMap.set(this.ctor, []);
    }
    const map = TypeDefinition.typeMap.get(this.ctor);
    map.push([prop, type]);

    return this;
  }
}