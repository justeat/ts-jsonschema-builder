import { describe, it } from "mocha";

import { Schema, StringSchema, NumberSchema, BooleanSchema } from "../src";
import { Model } from "./models";
import { assertValid, assertInvalid } from "./assertion";
import { AnyOf, OneOf, AllOf, Not } from "../src/combinators";

export interface RedeemRequest {
  card: {
    pan: number
  };
  type: string;
}

/**
 * @see https://json-schema.org/understanding-json-schema/reference/combining.html
 */
describe("Combinators", () => {

  /**
   * @see https://json-schema.org/understanding-json-schema/reference/combining.html#anyof
   */
  describe("AnyOf", () => {

    it("Should pass when matching any of", () => {
      const model1: Model = {
        StringProp: "specificValueNotMatchingRegex"
      };
      const model2: Model = {
        StringProp: "Matching.Regex"
      };
      const model3: Model = {
        StringProp: "123"
      };

      const schema = new Schema<Model>()
        .with(m => m.StringProp, new AnyOf([
          "specificValueNotMatchingRegex",
          /^[A-z]+\.[A-z]+$/,
          new StringSchema({
            enum: ["123"]
          })
        ]))
        .build();

      assertValid(schema, model1);
      assertValid(schema, model2);
      assertValid(schema, model3);
    });

    it("Should fail when not matching any of", () => {
      const invalidModel: Model = {
        StringProp: "xyz"
      };

      const schema = new Schema<Model>()
        .with(m => m.StringProp, new AnyOf([
          "specificValueNotMatchingRegex",
          /^[A-z]+\.[A-z]+$/,
          new StringSchema({
            enum: ["123"]
          })
        ]))
        .build();

      assertInvalid(schema, invalidModel);
    });
  });

  /**
   * @see https://json-schema.org/understanding-json-schema/reference/combining.html#oneof
   */
  describe("OneOf", () => {

    it("Should pass matching strictly one of", () => {
      const model1: Model = {
        NumberProp: 10
      };
      const model2: Model = {
        NumberProp: 6
      };

      const schema = new Schema<Model>()
        .with(m => m.NumberProp, new OneOf([
          new NumberSchema({
            multipleOf: 3
          }),
          new NumberSchema({
            multipleOf: 5
          })
        ]))
        .build();

      assertValid(schema, model1);
      assertValid(schema, model2);
    });

    it("Should fail when matching more than one of", () => {
      const invalidModel: Model = {
        NumberProp: 15
      };

      const schema = new Schema<Model>()
        .with(m => m.NumberProp, new OneOf([
          new NumberSchema({
            multipleOf: 3
          }),
          new NumberSchema({
            multipleOf: 5
          })
        ]))
        .build();

      assertInvalid(schema, invalidModel);
    });

    it("Should fail when matching none of", () => {
      const invalidModel: Model = {
        NumberProp: 1
      };

      const schema = new Schema<Model>()
        .with(m => m.NumberProp, new OneOf([
          new NumberSchema({
            multipleOf: 3
          }),
          new NumberSchema({
            multipleOf: 5
          })
        ]))
        .build();

      assertInvalid(schema, invalidModel);
    });
  });

  /**
   * @see https://json-schema.org/understanding-json-schema/reference/combining.html#allof
   */
  describe("AllOf", () => {

    it("Should pass when matching all of", () => {
      const model: Model = {
        NumberProp: 15
      };

      const schema = new Schema<Model>()
        .with(m => m.NumberProp, new AllOf([
          new NumberSchema({
            multipleOf: 3
          }),
          new NumberSchema({
            multipleOf: 5
          })
        ]))
        .build();

      assertValid(schema, model);
    });

    it("Should fail when not matching all of", () => {
      const invalidModel1: Model = {
        NumberProp: 6
      };
      const invalidModel2: Model = {
        NumberProp: 10
      };

      const schema = new Schema<Model>()
        .with(m => m.NumberProp, new AllOf([
          new NumberSchema({
            multipleOf: 3
          }),
          new NumberSchema({
            multipleOf: 5
          })
        ]))
        .build();

      assertInvalid(schema, invalidModel1);
      assertInvalid(schema, invalidModel2);
    });
  });


  /**
   * @see https://json-schema.org/understanding-json-schema/reference/combining.html#not
   */
  describe("Not", () => {

    it("Should pass when not matching", () => {
      const model: Model = {
        BooleanProp: true
      };

      const schema = new Schema<Model>()
        .with(m => m.BooleanProp, new Not(false))
        .build();

      assertValid(schema, model);
    });

    it("Should fail when matching", () => {
      const invalidModel: Model = {
        BooleanProp: true
      };

      const schema = new Schema<Model>()
        .with(m => m.NumberProp, new Not(
          new BooleanSchema({
            enum: [true]
          })
        ))
        .build();

      assertInvalid(schema, invalidModel);
    });
  });
});
