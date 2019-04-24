import Ajv from "ajv";
import { describe, it } from "mocha";
import { should } from "chai";

import { Schema} from "../src/schema";
import { Model } from "./models";
should();

describe("Usage", function () {

  it("Complete picture", function () {

    const model: Model = {
      StringProp: "sergej.popov",
      NumProp: 10,
      BoolProp: false,
      ArrayProp: [1, 2, 3],
      ObjProp: {
        Lvl2ObjProp: {
          Lvl3StrProp: "aaa.bbb"
        }
      }
    };

    const schema = new Schema<Model>()
      .with(m => m.StringProp, /^[a-zA-Z]+\.[a-zA-Z]+$/)
      .with(m => m.NumProp, x => x >= 10)
      .with(m => m.BoolProp, false)
      .with(m => m.ArrayProp, {
        length: x => x >= 3,
        uniqueItems: true
      })
      .with(m => m.ObjProp.Lvl2ObjProp.Lvl3StrProp, /^[a-zA-Z]+\.[a-zA-Z]+$/)
      .build();

    const validator = new Ajv().compile(schema);
    const isValid = validator(model);

    isValid.should.be.eql(true, JSON.stringify(validator.errors));
  });
});

describe("Structural", function () {

  it("Should not add same field to a required list twice", function () {

    const model: Model = {
      StringProp: "sergej.popov"
    };

    const schema = new Schema<Model>()
      .with(m => m.StringProp, "sergej.popov")
      .with(m => m.StringProp, "sergej.popov")
      .build() as any;

    schema.required.length.should.eq(1);

    const validator = new Ajv().compile(schema);
    const isValid = validator(model);

    isValid.should.be.eql(true);
  });

  it("Should require nested object", function () {

    const model: Model = {
      ObjProp: {
        Lvl2ObjProp: {
        }
      }
    };

    const schema = new Schema<Model>()
      .with(m => m.ObjProp.Lvl2ObjProp.Lvl3StrProp, /^[a-zA-Z]+\.[a-zA-Z]+$/)
      .build();

    const validator = new Ajv().compile(schema);
    const isValid = validator(model);

    isValid.should.be.eql(false, JSON.stringify(validator.errors));
  });
});
