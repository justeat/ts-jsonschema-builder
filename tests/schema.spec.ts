import { describe, it } from "mocha";

import { Schema, ArraySchema, StringSchema } from "../src";
import { Model } from "./models";
import { assertValid, assertInvalid } from "./assertion";

export interface RedeemRequest {
  card: {
    pan: number
  };
  type: string;
}

describe("Usage", () => {

  it("Complete picture", () => {

    const model: Model = {
      StringProp: "abc.def",
      NumberProp: 10,
      BooleanProp: false,
      ArrayProp: [1, 2, 3],
      ObjProp: {
        Lvl2ObjProp: {
          Lvl3StrProp: "aaa.bbb"
        }
      }
    };

    const schema = new Schema<Model>()
      .with(function (m) { return m.StringProp; }, /^[A-z]+\.[A-z]+$/)
      .with(m => m.NumberProp, x => x >= 10)
      .with(m => m.BooleanProp, false)
      .with(m => m.ArrayProp, new ArraySchema({
        length: x => x >= 3,
        uniqueItems: true
      }))
      .with(m => m.ObjProp.Lvl2ObjProp.Lvl3StrProp, /^[A-z]+\.[A-z]+$/)
      .build();

    assertValid(schema, model);

  });
});


describe("Structural", () => {

  it("Should specify '$schema' version", () => {

    const model: Model = {
      StringProp: "abc.def"
    };

    const schema = new Schema<Model>()
      .with(m => m.StringProp, /^[A-z]+\.[A-z]+$/)
      .build();

    schema.should.have.property("$schema", "http://json-schema.org/draft-04/schema#");

    assertValid(schema, model);
  });

  it("Should not add same field to a required list twice", () => {

    const model: Model = {
      StringProp: "abc.def"
    };

    const schema = new Schema<Model>()
      .with(m => m.StringProp, "abc.def")
      .with(m => m.StringProp, "abc.def")
      .build() as any;

    schema.required.length.should.eq(1);

    assertValid(schema, model);
  });

  it("Should require nested object", () => {

    const model: Model = {
      ObjProp: {
        Lvl2ObjProp: {
        }
      }
    };

    const schema = new Schema<Model>()
      .with(m => m.ObjProp.Lvl2ObjProp.Lvl3StrProp, /^[A-z]+\.[A-z]+$/)
      .build();

    assertInvalid(schema, model);
  });
});



describe("EcmaScript5", () => {

  it("Should support ES5 style functions", () => {

    const model: Model = {
      StringProp: "abc"
    };

    const schema = new Schema<Model>()
      .with(function (m) { return m.StringProp; }, new StringSchema(function (x) { return x >= 3; }))
      .build();

    schema.should.have.property("$schema", "http://json-schema.org/draft-04/schema#");

    assertValid(schema, model);
  });

});

