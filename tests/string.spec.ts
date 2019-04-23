import Ajv from "ajv";
import { should } from "chai";

import { testCase } from "./test-case";
import { Model } from "./models";
import { Schema } from "../src/schema";
should();

describe("Exact string validation", function () {

    it("Should pass when string matches exactly ", function () {

        const model: Model = {
            StringProp: "sergej.popov"
        };

        const schema = new Schema<Model>()
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

        const schema = new Schema<Model>()
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

        const schema = new Schema<Model>()
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

        const schema = new Schema<Model>()
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

        const schema = new Schema<Model>()
            .with(m => m.StringProp, /^[a-zA-Z]+\.[a-zA-Z]+$/)
            .build();

        const validator = new Ajv().compile(schema);
        const isValid = validator(model);

        isValid.should.be.eql(false);
    });

});

describe("Expression string length validation", function () {

  testCase(
    [
      { expression: (x: string) => x.length == 10, expected: true, reason: "eq" },
      { expression: (x: string) => x.length === 10, expected: true, reason: "eq" },
      { expression: (x: string) => x.length == 9, expected: false, reason: "eq" },
      { expression: (x: string) => x.length === 9, expected: false, reason: "eq" },
      { expression: (x: string) => x.length == 11, expected: false, reason: "eq" },
      { expression: (x: string) => x.length === 11, expected: false, reason: "eq" },
      { expression: (x: string) => x.length < 11, expected: true, reason: "lt" },
      { expression: (x: string) => x.length < 10, expected: false, reason: "lt" },
      { expression: (x: string) => x.length <= 10, expected: true, reason: "lte" },
      { expression: (x: string) => x.length <= 9, expected: false, reason: "lte" },
      { expression: (x: string) => x.length > 9, expected: true, reason: "gt" },
      { expression: (x: string) => x.length > 10, expected: false, reason: "gt" },
      { expression: (x: string) => x.length >= 10, expected: true, reason: "gte" },
      { expression: (x: string) => x.length >= 11, expected: false, reason: "gte" },
    ], c => {
      it(`Should ${c.expected ? "pass" : "fail"} when number matches ${c.reason} expression`, function () {

        const model: Model = {
          StringProp: "10CharStr."
        };

        const schema = new Schema<Model>()
          .with(m => m.StringProp, c.expression)
          .build();

        const validator = new Ajv().compile(schema);
        const isValid = validator(model);

        isValid.should.be.eql(c.expected);
      });
    });

});
