import Ajv from "ajv";
import { should } from "chai";

import { testCase } from "./test-case";
import { Model } from "./models";
import { Schema, ArrayOptions } from "../src/schema";
should();

describe("Array validation", function () {

    testCase(
        [
            { expression: (x: any[]) => x.length == 10, expected: true, reason: "eq" },
            { expression: (x: any[]) => x.length === 10, expected: true, reason: "eq" },
            { expression: (x: any[]) => x.length == 9, expected: false, reason: "eq" },
            { expression: (x: any[]) => x.length === 9, expected: false, reason: "eq" },
            { expression: (x: any[]) => x.length == 11, expected: false, reason: "eq" },
            { expression: (x: any[]) => x.length === 11, expected: false, reason: "eq" },
            { expression: (x: any[]) => x.length < 11, expected: true, reason: "lt" },
            { expression: (x: any[]) => x.length < 10, expected: false, reason: "lt" },
            { expression: (x: any[]) => x.length <= 10, expected: true, reason: "lte" },
            { expression: (x: any[]) => x.length <= 9, expected: false, reason: "lte" },
            { expression: (x: any[]) => x.length > 9, expected: true, reason: "gt" },
            { expression: (x: any[]) => x.length > 10, expected: false, reason: "gt" },
            { expression: (x: any[]) => x.length >= 10, expected: true, reason: "gte" },
            { expression: (x: any[]) => x.length >= 11, expected: false, reason: "gte" },
        ], c => {
            it(`Should ${c.expected ? "pass" : "fail"} when array length ${c.reason} expression`, function () {

                const model: Model = {
                    ArrayProp: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
                };

                const schema = new Schema<Model>()
                    .with(m => m.ArrayProp, c.expression, ArrayOptions.Default)
                    .build();

                const validator = new Ajv().compile(schema);
                const isValid = validator(model);

                isValid.should.be.eql(c.expected);
            });
        });


    it("Should allow additional items when default options", function () {

        const model: Model = {
            ArrayProp: [1, 2, 3, 3]
        };

        const schema = new Schema<Model>()
            .with(m => m.ArrayProp, [], ArrayOptions.Default)
            .build();

        const validator = new Ajv().compile(schema);
        const isValid = validator(model);

        isValid.should.be.eql(true, JSON.stringify(validator.errors));
    });

    it("Should not allow additional items when Unique Options", function () {

        const model: Model = {
            ArrayProp: [1, 2, 3, 3]
        };

        const schema = new Schema<Model>()
            .with(m => m.ArrayProp, [], ArrayOptions.UniqueItems)
            .build();

        const validator = new Ajv().compile(schema);
        const isValid = validator(model);

        isValid.should.be.eql(false, JSON.stringify(validator.errors));
    });

});