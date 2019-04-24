import Ajv from "ajv";
import { should } from "chai";

import { testCase } from "./test-case";
import { Model } from "./models";
import { Schema, ArraySchema } from "../src/schema";
should();

/**
 * @see https://json-schema.org/understanding-json-schema/reference/array.html
 */
describe("Array", function () {

    /**
     * @see https://json-schema.org/understanding-json-schema/reference/array.html#length
     */
    describe("Length", () => {
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
                /**
                 * @see https://json-schema.org/understanding-json-schema/reference/array.html#length
                 */
                it(`Should ${c.expected ? "pass" : "fail"} when array length ${c.reason} expression`, function () {

                    const model: Model = {
                        ArrayProp: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
                    };

                    const schema = new Schema<Model>()
                        .with(m => m.ArrayProp, new ArraySchema({
                            length: c.expression
                        }))
                        .build();

                    const validator = new Ajv().compile(schema);
                    const isValid = validator(model);

                    isValid.should.be.eql(c.expected);
                });
            });
    });

    /**
     * @see https://json-schema.org/understanding-json-schema/reference/array.html#uniqueness
     */
    describe("Uniqueness", () => {

        it("Should allow duplicate items when uniqueItems is not specified", function () {

            const model: Model = {
                ArrayProp: [1, 2, 3, 3]
            };

            const schema = new Schema<Model>()
                .with(m => m.ArrayProp, new ArraySchema({}))
                .build();

            const validator = new Ajv().compile(schema);
            const isValid = validator(model);

            isValid.should.be.eql(true, JSON.stringify(validator.errors));
        });

        it("Should allow duplicate items when  uniqueItems is true", function () {

            const model: Model = {
                ArrayProp: [1, 2, 3, 3]
            };

            const schema = new Schema<Model>()
                .with(m => m.ArrayProp, new ArraySchema({
                    uniqueItems: false
                }))
                .build();

            const validator = new Ajv().compile(schema);
            const isValid = validator(model);

            isValid.should.be.eql(true, JSON.stringify(validator.errors));
        });

        it("Should not allow duplicate items when uniqueItems is true", function () {

            const model: Model = {
                ArrayProp: [1, 2, 3, 3]
            };

            const schema = new Schema<Model>()
                .with(m => m.ArrayProp, new ArraySchema({
                    uniqueItems: true
                }))
                .build();

            const validator = new Ajv().compile(schema);
            const isValid = validator(model);

            isValid.should.be.eql(false, JSON.stringify(validator.errors));
        });
    })


    /**
     * @see https://json-schema.org/understanding-json-schema/reference/array.html#tuple-validation
     */
    describe("Tuple validation", () => {
        it("Should fail if doesn't contain required items is same order", function () {

            const model: Model = {
                ArrayProp: [2, 1]
            };

            const schema = new Schema<Model>()
                .with(m => m.ArrayProp, new ArraySchema({
                    items: [1, 2]
                }))
                .build();

            const validator = new Ajv().compile(schema);
            const isValid = validator(model);

            isValid.should.be.eql(false, JSON.stringify(validator.errors));
        });

        it("Should pass if contains required items is same order", function () {

            const model: Model = {
                ArrayProp: [1, 2]
            };

            const schema = new Schema<Model>()
                .with(m => m.ArrayProp, new ArraySchema({
                    items: [1, 2]
                }))
                .build();

            const validator = new Ajv().compile(schema);
            const isValid = validator(model);

            isValid.should.be.eql(true, JSON.stringify(validator.errors));
        });

        it("Should pass if contains additional items and it is not explicitly restricted", function () {

            const model: Model = {
                ArrayProp: [1, 2, 3]
            };

            const schema = new Schema<Model>()
                .with(m => m.ArrayProp, new ArraySchema({
                    items: [1, 2]
                }))
                .build();

            const validator = new Ajv().compile(schema);
            const isValid = validator(model);

            isValid.should.be.eql(true, JSON.stringify(validator.errors));
        });

        it("Should fail if contains additional items and it is explicitly restricted", function () {

            const model: Model = {
                ArrayProp: [1, 2, 3]
            };

            const schema = new Schema<Model>()
                .with(m => m.ArrayProp, new ArraySchema({
                    items: [1, 2],
                    additionalItems: false
                }))
                .build();

            const validator = new Ajv().compile(schema);
            const isValid = validator(model);

            isValid.should.be.eql(false, JSON.stringify(validator.errors));
        });
    });

});