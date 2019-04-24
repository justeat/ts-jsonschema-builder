import Ajv from "ajv";
import { should } from "chai";

import { testCase } from "./test-case";
import { Model } from "./models";
import { Schema } from "../src/schema";
should();

describe("Exact number validation", function () {

    it("Should pass when number matches exactly ", function () {

        const model: Model = {
            NumProp: 10
        };

        const schema = new Schema<Model>()
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

        const schema = new Schema<Model>()
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

        const schema = new Schema<Model>()
            .with(m => m.NumProp, 20)
            .build();

        const validator = new Ajv().compile(schema);
        const isValid = validator(model);

        isValid.should.be.eql(false);
    });

});


//todo: convert to Customiser Style
describe.skip("Range number validation", function () {

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

                const schema = new Schema<Model>()
                    // .with(m => m.NumProp, {
                    //     range:  c.range as [number, number]
                    // })
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
            { expression: (x: number) => x == 10, expected: true, reason: "eq" },
            { expression: (x: number) => x === 10, expected: true, reason: "eq" },
            { expression: (x: number) => x == 9, expected: false, reason: "eq" },
            { expression: (x: number) => x === 9, expected: false, reason: "eq" },
            { expression: (x: number) => x == 11, expected: false, reason: "eq" },
            { expression: (x: number) => x === 11, expected: false, reason: "eq" },
            { expression: (x: number) => x < 11, expected: true, reason: "lt" },
            { expression: (x: number) => x < 10, expected: false, reason: "lt" },
            { expression: (x: number) => x <= 10, expected: true, reason: "lte" },
            { expression: (x: number) => x <= 9, expected: false, reason: "lte" },
            { expression: (x: number) => x > 9, expected: true, reason: "gt" },
            { expression: (x: number) => x > 10, expected: false, reason: "gt" },
            { expression: (x: number) => x >= 10, expected: true, reason: "gte" },
            { expression: (x: number) => x >= 11, expected: false, reason: "gte" },
        ], c => {
            it(`Should ${c.expected ? "pass" : "fail"} when number matches ${c.reason} expression`, function () {

                const model: Model = {
                    NumProp: 10
                };

                const schema = new Schema<Model>()
                    .with(m => m.NumProp, c.expression)
                    .build();

                const validator = new Ajv().compile(schema);
                const isValid = validator(model);

                isValid.should.be.eql(c.expected);
            });
        });
});
