
import { testCase } from "./test-case";
import { Model } from "./models";
import { Schema, ArraySchema } from "../src";
import { assertValid, assertInvalid, assert } from "./assertion";

/**
 * @see https://json-schema.org/understanding-json-schema/reference/array.html
 */
describe("Array", () => {

  /**
   * @see https://json-schema.org/understanding-json-schema/reference/array.html#array
   */
  describe("Type", () => {

    it("Should pass when property type matches ", () => {

      const model: Model = {
        ArrayProp: []
      };

      const schema = new Schema<Model>()
        .with(m => m.ArrayProp, new ArraySchema())
        .build();

      assertValid(schema, model);
    });

    it("Should fail when property type doesn't match", () => {

      const model = {
        ArrayProp: "abc"
      };

      const schema = new Schema<Model>()
        .with(m => m.ArrayProp, new ArraySchema())
        .build();

      assertInvalid(schema, model);
    });

    it("Should fail when property is missing and 'required: false' is not explicitly specified", () => {

      const model = {};

      const schema = new Schema<Model>()
        .with(m => m.ArrayProp, new ArraySchema())
        .build();

      assertInvalid(schema, model);
    });

    it("Should pass when type missing and 'required: false' is explicitly specified", () => {

      const model = {};

      const schema = new Schema<Model>()
        .with(m => m.ArrayProp, new ArraySchema({
          required: false
        }))
        .build();

      assertValid(schema, model);
    });
  });

  /**
   * @see https://json-schema.org/understanding-json-schema/reference/array.html#length
   */
  describe("Length", () => {
    testCase(
      [
        // tslint:disable: triple-equals
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
        // tslint:enable: triple-equals
      ], c => {
        /**
         * @see https://json-schema.org/understanding-json-schema/reference/array.html#length
         */
        it(`Should ${c.expected ? "pass" : "fail"} when array length ${c.reason} expression`, () => {

          const model: Model = {
            ArrayProp: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
          };

          const schema = new Schema<Model>()
            .with(m => m.ArrayProp, new ArraySchema({
              length: c.expression
            }))
            .build();

          assert(c.expected, schema, model);
        });
      });


  });

  /**
   * @see https://json-schema.org/understanding-json-schema/reference/array.html#uniqueness
   */
  describe("Uniqueness", () => {

    it("Should allow duplicate items when uniqueItems is not specified", () => {

      const model: Model = {
        ArrayProp: [1, 2, 3, 3]
      };

      const schema = new Schema<Model>()
        .with(m => m.ArrayProp, new ArraySchema({}))
        .build();

      assertValid(schema, model);
    });

    it("Should allow duplicate items when  uniqueItems is false", () => {

      const model: Model = {
        ArrayProp: [1, 2, 3, 3]
      };

      const schema = new Schema<Model>()
        .with(m => m.ArrayProp, new ArraySchema({
          uniqueItems: false
        }))
        .build();

      assertValid(schema, model);
    });

    it("Should not allow duplicate items when uniqueItems is true", () => {

      const model: Model = {
        ArrayProp: [1, 2, 3, 3]
      };

      const schema = new Schema<Model>()
        .with(m => m.ArrayProp, new ArraySchema({
          uniqueItems: true
        }))
        .build();

      assertInvalid(schema, model);
    });
  });


  /**
   * @see https://json-schema.org/understanding-json-schema/reference/array.html#tuple-validation
   */
  describe("Tuple validation", () => {
    it("Should fail if doesn't contain required items in the same order", () => {

      const model: Model = {
        ArrayProp: [2, 1]
      };

      const schema = new Schema<Model>()
        .with(m => m.ArrayProp, new ArraySchema({
          items: [1, 2]
        }))
        .build();

      assertInvalid(schema, model);
    });

    it("Should pass if contains required items in the same order", () => {

      const model: Model = {
        ArrayProp: [1, 2]
      };

      const schema = new Schema<Model>()
        .with(m => m.ArrayProp, new ArraySchema({
          items: [1, 2]
        }))
        .build();

      assertValid(schema, model);
    });

    it("Should pass if contains additional items and it is not explicitly restricted", () => {

      const model: Model = {
        ArrayProp: [1, 2, 3]
      };

      const schema = new Schema<Model>()
        .with(m => m.ArrayProp, new ArraySchema({
          items: [1, 2]
        }))
        .build();

      assertValid(schema, model);
    });

    it("Should fail if contains additional items and it is explicitly restricted", () => {

      const model: Model = {
        ArrayProp: [1, 2, 3]
      };

      const schema = new Schema<Model>()
        .with(m => m.ArrayProp, new ArraySchema({
          items: [1, 2],
          additionalItems: false
        }))
        .build();

      assertInvalid(schema, model);
    });
  });

});
