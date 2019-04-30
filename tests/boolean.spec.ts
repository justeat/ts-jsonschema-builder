import { Model } from "./models";
import { Schema, BooleanSchema } from "../src";
import { assertValid, assertInvalid } from "./assertion";

describe("Exact Bool validation", () => {

  /**
   * @see https://json-schema.org/understanding-json-schema/reference/numeric.html#number
   */
  describe("Type", () => {

    it("Should pass when property type matches ", () => {

      const model: Model = {
        BooleanProp: true
      };

      const schema = new Schema<Model>()
        .with(m => m.BooleanProp, new BooleanSchema())
        .build();

      assertValid(schema, model);
    });

    it("Should fail when property type doesn't match", () => {

      const model = {
        BooleanProp: "abc"
      };

      const schema = new Schema<Model>()
        .with(m => m.BooleanProp, new BooleanSchema())
        .build();

      assertInvalid(schema, model);
    });

    it("Should fail when property is missing and 'required: false' is not explicitly specified", () => {

      const model = {};

      const schema = new Schema<Model>()
        .with(m => m.BooleanProp, new BooleanSchema())
        .build();

      assertInvalid(schema, model);
    });

    it("Should pass when type missing and 'required: false' is explicitly specified", () => {

      const model = {};

      const schema = new Schema<Model>()
        .with(m => m.BooleanProp, new BooleanSchema({
          required: false
        }))
        .build();

      assertValid(schema, model);
    });
  });

  it("Should pass when Bool matches exactly ", () => {

    const model: Model = {
      BooleanProp: false
    };

    const schema = new Schema<Model>()
      .with(m => m.BooleanProp, false)
      .build();

    assertValid(schema, model);
  });

  it("Should fail when Bool doesn't match exactly ", () => {

    const model: Model = {
      BooleanProp: false
    };

    const schema = new Schema<Model>()
      .with(m => m.BooleanProp, true)
      .build();

    assertInvalid(schema, model);
  });
});
