import { testCase } from "./test-case";
import { Model } from "./models";
import { Schema, NumberSchema } from "../src";
import { assertValid, assertInvalid, assert } from "./assertion";

/**
 * @see https://json-schema.org/understanding-json-schema/reference/numeric.html
 */
describe("Number", () => {

    /**
     * @see https://json-schema.org/understanding-json-schema/reference/numeric.html#number
     */
    describe("Type", () => {

        it("Should pass when property type matches ", () => {

            const model: Model = {
                NumberProp: 123
            };

            const schema = new Schema<Model>()
                .with(m => m.NumberProp, new NumberSchema())
                .build();

            assertValid(schema, model);
        });

        it("Should fail when property type doesn't match", () => {

            const model = {
                NumberProp: "abc"
            };

            const schema = new Schema<Model>()
                .with(m => m.NumberProp, new NumberSchema())
                .build();

            assertInvalid(schema, model);
        });

        it("Should fail when property is missing and 'required: false' is not explicitly specified", () => {

            const model = {};

            const schema = new Schema<Model>()
                .with(m => m.NumberProp, new NumberSchema())
                .build();

            assertInvalid(schema, model);
        });

        it("Should pass when property is missing and 'required: false' is explicitly specified", () => {

            const model = {};

            const schema = new Schema<Model>()
                .with(m => m.NumberProp, new NumberSchema({
                    required: false
                }))
                .build();

            assertValid(schema, model);
        });
    });

    describe("Exact number validation", () => {

        it("Should pass when number matches exactly ", () => {

            const model: Model = {
                NumberProp: 10
            };

            const schema = new Schema<Model>()
                .with(m => m.NumberProp, 10)
                .build();

            assertValid(schema, model);
        });

        it("Should fail when number is smaller than expected", () => {

            const model: Model = {
                NumberProp: 10
            };

            const schema = new Schema<Model>()
                .with(m => m.NumberProp, 20)
                .build();

            assertInvalid(schema, model);
        });

        it("Should fail when number is greater than expected", () => {

            const model: Model = {
                NumberProp: 30
            };

            const schema = new Schema<Model>()
                .with(m => m.NumberProp, 20)
                .build();

            assertInvalid(schema, model);
        });

    });

    /**
     * @see https://json-schema.org/understanding-json-schema/reference/numeric.html#multiples
     */
    describe("Multiples", () => {

        it("Should pass when number is matching multipleOf", () => {

            const model: Model = {
                NumberProp: 30
            };

            const schema = new Schema<Model>()
                .with(m => m.NumberProp, new NumberSchema({
                    multipleOf: 10
                }))
                .build();

            assertValid(schema, model);
        });

        it("Should fail when number is not matching multipleOf", () => {

            const model: Model = {
                NumberProp: 13
            };

            const schema = new Schema<Model>()
                .with(m => m.NumberProp, new NumberSchema({
                    multipleOf: 10
                }))
                .build();

            assertInvalid(schema, model);
        });
    });

    /**
     * @see https://json-schema.org/understanding-json-schema/reference/numeric.html#range
     */
    describe("Range", () => {

        describe("Type schema number validation", () => {
            testCase(
                [
                    { range: [10, 10], expected: true, reason: "eq" },
                    { range: [8, 11], expected: true, reason: "eq" },
                    { range: [8, 9], expected: false, reason: "lt" },
                    { range: [9, 10], expected: true, reason: "lte" },
                    { range: [10, 12], expected: true, reason: "gte" },
                    { range: [11, 12], expected: false, reason: "gt" }
                ], c => {
                    it(`Should ${c.expected ? "pass" : "fail"} when range is ${c.range}. ${c.reason}`, () => {

                        const model: Model = {
                            NumberProp: 10
                        };

                        const schema = new Schema<Model>()
                            .with(m => m.NumberProp, new NumberSchema({
                                minimum: c.range[0],
                                maximum: c.range[1],
                            }))
                            .build();

                        assert(c.expected, schema, model);
                    });
                });
        });

        describe("Expression number validation", () => {

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
                    it(`Should ${c.expected ? "pass" : "fail"} when number matches ${c.reason} expression`, () => {

                        const model: Model = {
                            NumberProp: 10
                        };

                        const schema = new Schema<Model>()
                            .with(m => m.NumberProp, c.expression)
                            .build();

                        assert(c.expected, schema, model);
                    });
                });
        });
    });


});