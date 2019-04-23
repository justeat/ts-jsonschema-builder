import Ajv from "ajv";
import { describe, it } from "mocha";
import { should } from "chai";

import { Schema, ArrayOptions, DateOptions } from "../src/schema";
import { Model } from "./models";
should();

describe("Usage", function () {

  it("Complete picture", function () {

    const model: Model = {
      StringProp: "sergej.popov",
      NumProp: 10,
      BoolProp: false,
      ArrayProp: [1, 2, 3],
      DateProp: new Date("2018-01-01T12:00:00").toISOString() as any,
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
      .with(m => m.ArrayProp, x => x.length >= 3, ArrayOptions.UniqueItems)
      .with(m => m.DateProp, new Date("2018-01-01T12:00:00"))
      .with(m => m.ObjProp.Lvl2ObjProp.Lvl3StrProp, /^[a-zA-Z]+\.[a-zA-Z]+$/)
      .build();

    const validator = new Ajv().compile(schema);
    const isValid = validator(model);

    isValid.should.be.eql(true, JSON.stringify(validator.errors));
  });
});

describe("Type safety", function () {

  it("Options Enums should not have clashing numbers", function () {
    // Options enum may mot clash as they help figuring out the type

    const model: Model = {
      StringProp: "sergej.popov"
    };

    const arrayEnumNumbers = Object.values(ArrayOptions).filter(Number.isFinite);
    const dateEnumNumbers = Object.values(DateOptions).filter(Number.isFinite);
    const intersection = arrayEnumNumbers.filter(x => dateEnumNumbers.includes(x));

    intersection.should.be.empty;
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

// todo: remove Date support - not part of schema
describe("Exact Date validation", function () {

  it("Should pass when Date matches exactly ", function () {

    const model: Model = {
      DateProp: new Date("2018-01-01T12:00:00").toISOString()
    } as any;

    const schema = new Schema<Model>()
      .with(m => m.DateProp, new Date("2018-01-01T12:00:00"))
      .build();

    const validator = new Ajv().compile(schema);
    const isValid = validator(model);

    isValid.should.be.eql(true, JSON.stringify(validator.errors));
  });
});