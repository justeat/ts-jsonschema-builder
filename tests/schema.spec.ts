import Ajv from "ajv";
import { describe, it } from "mocha";
import { should } from "chai";
should();

import { Schema as SchemaV2, ArrayOptions } from "../src/schema";
import { testCase } from "./test-case";

export class Model {
  public StringProp?: string;
  public NumProp?: number;
  public BoolProp?: boolean;
  public ArrayProp?: Array<number>;
  public DateProp?: Date;
  public ObjProp?: Model2;
}

export class Model2 {
  public Lvl2StrProp?: string;
  public Lvl2ObjProp?: Model3;
}
export class Model3 {
  public Lvl3StrProp?: string;
}

describe("Structural", function () {

  it("Should not add same field to a required list twice", function () {

    const model: Model = {
      StringProp: "sergej.popov"
    };

    const schema = new SchemaV2<Model>()
      .with(m => m.StringProp, "sergej.popov")
      .with(m => m.StringProp, "sergej.popov")
      .build() as any;

    schema.required.length.should.eq(1);

    const validator = new Ajv().compile(schema);
    const isValid = validator(model);

    isValid.should.be.eql(true);
  });
});

describe("Exact string validation", function () {

  it("Should pass when string matches exactly ", function () {

    const model: Model = {
      StringProp: "sergej.popov"
    };

    const schema = new SchemaV2<Model>()
      .with(m => m.StringProp, "sergej.popov")
      .build();

    const validator = new Ajv().compile(schema);
    const isValid = validator(model);

    isValid.should.be.eql(true);
  });

  it("Should fail when string doesn't match exactly", function () {

    const model: Model = {
      StringProp: "sergej.popov"
    };

    const schema = new SchemaV2<Model>()
      .with(m => m.StringProp, "popov.sergej")
      .build();

    const validator = new Ajv().compile(schema);
    const isValid = validator(model);

    isValid.should.be.eql(false);
  });

  it("Should pass when string contains regex special characters", function () {

    const model: Model = {
      StringProp: "Special character: \ ^ $ * + ? . ( ) | { } [ ]"
    };

    const schema = new SchemaV2<Model>()
      .with(m => m.StringProp, "Special character: \ ^ $ * + ? . ( ) | { } [ ]")
      .build();

    const validator = new Ajv().compile(schema);
    const isValid = validator(model);

    isValid.should.be.eql(true, JSON.stringify(validator.errors));
  });

});

describe("RegEx validation", function () {
  it("Should pass when string matches RegEx", function () {

    const model: Model = {
      StringProp: "sergej.popov"
    };

    const schema = new SchemaV2<Model>()
      .with(m => m.StringProp, /^[a-zA-Z]+\.[a-zA-Z]+$/)
      .build();

    const validator = new Ajv().compile(schema);
    const isValid = validator(model);

    isValid.should.be.eql(true);
  });

  it("Should fail when string doesn't match RegEx", function () {

    const model: Model = {
      StringProp: "notvalidname"
    };

    const schema = new SchemaV2<Model>()
      .with(m => m.StringProp, /^[a-zA-Z]+\.[a-zA-Z]+$/)
      .build();

    const validator = new Ajv().compile(schema);
    const isValid = validator(model);

    isValid.should.be.eql(false);
  });


});

describe("Exact number validation", function () {

  it("Should pass when number matches exactly ", function () {

    const model: Model = {
      NumProp: 10
    };

    const schema = new SchemaV2<Model>()
      .with(m => m.NumProp, 10)
      .build();

    const validator = new Ajv().compile(schema);
    const isValid = validator(model);

    isValid.should.be.eql(true);
  });

  it("Should fail when number is smaller than expected", function () {

    const model: Model = {
      NumProp: 10
    };

    const schema = new SchemaV2<Model>()
      .with(m => m.NumProp, 20)
      .build();

    const validator = new Ajv().compile(schema);
    const isValid = validator(model);

    isValid.should.be.eql(false);
  });

  it("Should fail when number is greater than expected", function () {

    const model: Model = {
      NumProp: 30
    };

    const schema = new SchemaV2<Model>()
      .with(m => m.NumProp, 20)
      .build();

    const validator = new Ajv().compile(schema);
    const isValid = validator(model);

    isValid.should.be.eql(false);
  });

});

describe("Range number validation", function () {

  testCase(
    [
      { range: [10, 10], expected: true, reason: "eq" },
      { range: [8, 11], expected: true, reason: "eq" },
      { range: [8, 9], expected: false, reason: "lt" },
      { range: [9, 10], expected: true, reason: "lte" },
      { range: [10, 12], expected: true, reason: "gte" },
      { range: [11, 12], expected: false, reason: "gt" }
    ], c => {
      it(`Should ${c.expected ? "pass" : "fail"} when range is ${c.range}. ${c.reason}`, function () {

        const model: Model = {
          NumProp: 10
        };

        const schema = new SchemaV2<Model>()
          .with(m => m.NumProp, c.range as [number, number])
          .build();

        const validator = new Ajv().compile(schema);
        const isValid = validator(model);

        isValid.should.be.eql(c.expected);
      });
    });

});

describe("Exact Date validation", function () {

  it("Should pass when Date matches exactly ", function () {

    const model: Model = {
      DateProp: new Date("2018-01-01T12:00:00").toISOString()
    } as any;

    const schema = new SchemaV2<Model>()
      .with(m => m.DateProp, new Date("2018-01-01T12:00:00"))
      .build();

    const ajv = new Ajv({ schemaId: 'id' });
    ajv.addMetaSchema(require("ajv/lib/refs/json-schema-draft-04.json"));
    const validator = ajv.compile(schema);
    console.log("VV", JSON.stringify(model))
    const isValid = validator(model);

    isValid.should.be.eql(true, JSON.stringify(validator.errors));
  });
});

describe("Expression string length validation", function () {

  testCase(
    [
      { exression: (x: string) => x.length == 10, expected: true, reason: "eq" },
      { exression: (x: string) => x.length === 10, expected: true, reason: "eq" },
      { exression: (x: string) => x.length == 9, expected: false, reason: "eq" },
      { exression: (x: string) => x.length === 9, expected: false, reason: "eq" },
      { exression: (x: string) => x.length == 11, expected: false, reason: "eq" },
      { exression: (x: string) => x.length === 11, expected: false, reason: "eq" },
      { exression: (x: string) => x.length < 11, expected: true, reason: "lt" },
      { exression: (x: string) => x.length < 10, expected: false, reason: "lt" },
      { exression: (x: string) => x.length <= 10, expected: true, reason: "lte" },
      { exression: (x: string) => x.length <= 9, expected: false, reason: "lte" },
      { exression: (x: string) => x.length > 9, expected: true, reason: "gt" },
      { exression: (x: string) => x.length > 10, expected: false, reason: "gt" },
      { exression: (x: string) => x.length >= 10, expected: true, reason: "gte" },
      { exression: (x: string) => x.length >= 11, expected: false, reason: "gte" },
    ], c => {
      it(`Should ${c.expected ? "pass" : "fail"} when number matches ${c.reason} expression`, function () {

        const model: Model = {
          StringProp: "10CharStr."
        };

        const schema = new SchemaV2<Model>()
          .with(m => m.StringProp, c.exression)
          .build();

        const validator = new Ajv().compile(schema);
        const isValid = validator(model);

        isValid.should.be.eql(c.expected);
      });
    });

});

describe("Expression number validation", function () {

  testCase(
    [
      { exression: (x: number) => x == 10, expected: true, reason: "eq" },
      { exression: (x: number) => x === 10, expected: true, reason: "eq" },
      { exression: (x: number) => x == 9, expected: false, reason: "eq" },
      { exression: (x: number) => x === 9, expected: false, reason: "eq" },
      { exression: (x: number) => x == 11, expected: false, reason: "eq" },
      { exression: (x: number) => x === 11, expected: false, reason: "eq" },
      { exression: (x: number) => x < 11, expected: true, reason: "lt" },
      { exression: (x: number) => x < 10, expected: false, reason: "lt" },
      { exression: (x: number) => x <= 10, expected: true, reason: "lte" },
      { exression: (x: number) => x <= 9, expected: false, reason: "lte" },
      { exression: (x: number) => x > 9, expected: true, reason: "gt" },
      { exression: (x: number) => x > 10, expected: false, reason: "gt" },
      { exression: (x: number) => x >= 10, expected: true, reason: "gte" },
      { exression: (x: number) => x >= 11, expected: false, reason: "gte" },
    ], c => {
      it(`Should ${c.expected ? "pass" : "fail"} when number matches ${c.reason} expression`, function () {

        const model: Model = {
          NumProp: 10
        };

        const schema = new SchemaV2<Model>()
          .with(m => m.NumProp, c.exression)
          .build();

        const validator = new Ajv().compile(schema);
        const isValid = validator(model);

        isValid.should.be.eql(c.expected);
      });
    });
});

describe("Array validation", function () {

  testCase(
    [
      { exression: (x: any[]) => x.length == 10, expected: true, reason: "eq" },
      { exression: (x: any[]) => x.length === 10, expected: true, reason: "eq" },
      { exression: (x: any[]) => x.length == 9, expected: false, reason: "eq" },
      { exression: (x: any[]) => x.length === 9, expected: false, reason: "eq" },
      { exression: (x: any[]) => x.length == 11, expected: false, reason: "eq" },
      { exression: (x: any[]) => x.length === 11, expected: false, reason: "eq" },
      { exression: (x: any[]) => x.length < 11, expected: true, reason: "lt" },
      { exression: (x: any[]) => x.length < 10, expected: false, reason: "lt" },
      { exression: (x: any[]) => x.length <= 10, expected: true, reason: "lte" },
      { exression: (x: any[]) => x.length <= 9, expected: false, reason: "lte" },
      { exression: (x: any[]) => x.length > 9, expected: true, reason: "gt" },
      { exression: (x: any[]) => x.length > 10, expected: false, reason: "gt" },
      { exression: (x: any[]) => x.length >= 10, expected: true, reason: "gte" },
      { exression: (x: any[]) => x.length >= 11, expected: false, reason: "gte" },
    ], c => {
      it(`Should ${c.expected ? "pass" : "fail"} when array length ${c.reason} expression`, function () {

        const model: Model = {
          ArrayProp: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
        };

        const schema = new SchemaV2<Model>()
          .with(m => m.ArrayProp, c.exression, ArrayOptions.Default)
          .build();

        const validator = new Ajv().compile(schema);
        const isValid = validator(model);

        isValid.should.be.eql(c.expected);
      });
    });

});