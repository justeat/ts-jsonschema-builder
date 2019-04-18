import Ajv from "ajv";
import { describe, it } from "mocha";
import { should } from "chai";
should();

import { Schema } from "../src/schema";
import { testCase } from "./test-case";

export class Model {
  public propA?: string;
  public propB?: number;
  public propC?: boolean;
  public propD?: Date;
  public propE?: Model2;
}

export class Model2 {
  public propF?: string;
}

describe("Exact string validation", function () {

  it("Should pass when string matches exactly ", function () {

    const model: Model = {
      propA: "sergej.popov"
    };

    const schema = new Schema<Model>()
      .with(m => m.propA, "sergej.popov")
      .build();

    const validator = new Ajv().compile(schema);
    const isValid = validator(model);

    isValid.should.be.eql(true);
  });

  it("Should fail when string doesn't match exactly", function () {

    const model: Model = {
      propA: "sergej.popov"
    };

    const schema = new Schema<Model>()
      .with(m => m.propA, "popov.sergej")
      .build();

    const validator = new Ajv().compile(schema);
    const isValid = validator(model);

    isValid.should.be.eql(false);
  });

});

describe("RegEx validation", function () {
  it("Should pass when string matches RegEx", function () {

    const model: Model = {
      propA: "sergej.popov"
    };

    const schema = new Schema<Model>()
      .with(m => m.propA, /^[a-zA-Z]+\.[a-zA-Z]+$/)
      .build();

    const validator = new Ajv().compile(schema);
    const isValid = validator(model);

    isValid.should.be.eql(true);
  });

  it("Should fail when string doesn't match RegEx", function () {

    const model: Model = {
      propA: "notvalidname"
    };

    const schema = new Schema<Model>()
      .with(m => m.propA, /^[a-zA-Z]+\.[a-zA-Z]+$/)
      .build();

    const validator = new Ajv().compile(schema);
    const isValid = validator(model);

    isValid.should.be.eql(false);
  });


});

describe("Exact number validation", function () {

  it("Should pass when number matches exactly ", function () {

    const model: Model = {
      propB: 10
    };

    const schema = new Schema<Model>()
      .with(m => m.propB, 10)
      .build();

    const validator = new Ajv().compile(schema);
    const isValid = validator(model);

    isValid.should.be.eql(true);
  });

  it("Should fail when number is smaller than expected", function () {

    const model: Model = {
      propB: 10
    };

    const schema = new Schema<Model>()
      .with(m => m.propB, 20)
      .build();

    const validator = new Ajv().compile(schema);
    const isValid = validator(model);

    isValid.should.be.eql(false);
  });

  it("Should fail when number is greater than expected", function () {

    const model: Model = {
      propB: 30
    };

    const schema = new Schema<Model>()
      .with(m => m.propB, 20)
      .build();

    const validator = new Ajv().compile(schema);
    const isValid = validator(model);

    isValid.should.be.eql(false);
  });

});


describe.only("Exact Date validation", function () {

  it.only("Should pass when Date matches exactly ", function () {

    const model: Model = {
      propD: new Date("2018-01-01T12:00:00")
    };

    const schema = new Schema<Model>()
      .with(m => m.propD, new Date("2018-01-01T12:00:00"))
      .build();

    const ajv = new Ajv({schemaId: 'id'});
    ajv.addMetaSchema(require("ajv/lib/refs/json-schema-draft-04.json"));
    const validator = ajv.compile(schema);
    const isValid = validator(model);

    isValid.should.be.eql(true);
  });

  it("Should fail when number is earlier than expected", function () {

    const model: Model = {
      propD: new Date("2017-01-01T12:00:00")
    };

    const schema = new Schema<Model>()
      .with(m => m.propD, new Date("2018-01-01T12:00:00"))
      .build();

    const validator = new Ajv().compile(schema);
    const isValid = validator(model);

    isValid.should.be.eql(false);
  });

  it("Should fail when number is later than expected", function () {

    const model: Model = {
      propD: new Date("2019-01-01T12:00:00")
    };

    const schema = new Schema<Model>()
      .with(m => m.propD, new Date("2018-01-01T12:00:00"))
      .build();

    const validator = new Ajv().compile(schema);
    const isValid = validator(model);

    isValid.should.be.eql(false);
  });

});


describe("Expression number validation", function () {

  testCase(
    [
      { propValue: 10, exression: (x: number) => x == 10, expected: true, reason: "eq" },
      { propValue: 10, exression: (x: number) => x === 10, expected: true, reason: "eq" },
      { propValue: 10, exression: (x: number) => x == 9, expected: false, reason: "eq" },
      { propValue: 10, exression: (x: number) => x === 9, expected: false, reason: "eq" },
      { propValue: 10, exression: (x: number) => x == 11, expected: false, reason: "eq" },
      { propValue: 10, exression: (x: number) => x === 11, expected: false, reason: "eq" },
      { propValue: 10, exression: (x: number) => x < 11, expected: true, reason: "lt" },
      { propValue: 10, exression: (x: number) => x < 10, expected: false, reason: "lt" },
      { propValue: 10, exression: (x: number) => x <= 10, expected: true, reason: "lte" },
      { propValue: 10, exression: (x: number) => x <= 9, expected: false, reason: "lte" },
      { propValue: 10, exression: (x: number) => x > 9, expected: true, reason: "gt" },
      { propValue: 10, exression: (x: number) => x > 10, expected: false, reason: "gt" },
      { propValue: 10, exression: (x: number) => x >= 10, expected: true, reason: "gte" },
      { propValue: 10, exression: (x: number) => x >= 11, expected: false, reason: "gte" },
    ], c => {
      it(`Should ${c.expected ? "pass" : "fail"} when number matches ${c.reason} expression`, function () {

        const model: Model = {
          propB: c.propValue
        };

        const schema = new Schema<Model>()
          .with(m => m.propB, c.exression)
          .build();

        const validator = new Ajv().compile(schema);
        const isValid = validator(model);

        isValid.should.be.eql(c.expected);
      });
    });
});