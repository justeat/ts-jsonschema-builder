import Ajv from "ajv";
import { should } from "chai";

import { testCase } from "./test-case";
import { Model } from "./models";
import { Schema, StringSchema } from "../src/schema";
should();


describe("String", () => {

    describe("Exact string validation", function () {

        it("Should pass when string matches exactly ", function () {

            const model: Model = {
                StringProp: "abc.def"
            };

            const schema = new Schema<Model>()
                .with(m => m.StringProp, "abc.def")
                .build();

            const validator = new Ajv().compile(schema);
            const isValid = validator(model);

            isValid.should.be.eql(true);
        });

        it("Should fail when string doesn't match exactly", function () {

            const model: Model = {
                StringProp: "abc.def"
            };

            const schema = new Schema<Model>()
                .with(m => m.StringProp, "def.abc")
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


    /**
     * @see https://json-schema.org/understanding-json-schema/reference/string.html#format
     */
    describe("Format", function () {

        it("Should pass when string matches date-time ", function () {

            const model: Model = {
                StringProp: new Date().toISOString()
            };

            const schema = new Schema<Model>()
                .with(m => m.StringProp, new StringSchema({
                    format: "date-time"
                }))
                .build();


            const validator = new Ajv().compile(schema);
            const isValid = validator(model);

            isValid.should.be.eql(true, JSON.stringify(validator.errors));
        });
    });

    /**
     * @see https://json-schema.org/understanding-json-schema/reference/string.html#regular-expressions
     */
    describe("Regular Expressions", function () {
        it("Should pass when string matches RegEx", function () {

            const model: Model = {
                StringProp: "abc.def"
            };

            const schema = new Schema<Model>()
                .with(m => m.StringProp, /^[A-z]+\.[A-z]+$/)
                .build();

            const validator = new Ajv().compile(schema);
            const isValid = validator(model);

            isValid.should.be.eql(true);
        });

        it("Should fail when string doesn't match RegEx", function () {

            const model: Model = {
                StringProp: "InvalidName"
            };

            const schema = new Schema<Model>()
                .with(m => m.StringProp, /^[A-z]+\.[A-z]+$/)
                .build();

            const validator = new Ajv().compile(schema);
            const isValid = validator(model);

            isValid.should.be.eql(false);
        });

    });

    /**
     * @see https://json-schema.org/understanding-json-schema/reference/string.html#length
     */
    describe("Length", function () {

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
                        StringProp: "10CharStr."
                    };

                    const schema = new Schema<Model>()
                        .with(m => m.StringProp, new StringSchema(c.expression))
                        .build();

                    const validator = new Ajv().compile(schema);
                    const isValid = validator(model);

                    isValid.should.be.eql(c.expected);
                });
            });

    });

});