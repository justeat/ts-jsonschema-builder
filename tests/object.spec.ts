import { describe, it } from "mocha";

import { Schema, ArraySchema, StringSchema, AnyOf, NumberSchema, AllOf, BooleanSchema, OneOf } from "../src";
import { Model, DictionaryPropModel, NestedDictionaryPropModel } from "./models";
import { assertValid, assertInvalid } from "./assertion";

describe("Dictionary", () => {

  it("Should pass when nested object property satisfies schema", () => {

    const model: Model = {
      DictionaryProp: {
        "Key1": {
          DictionaryChildStringProp: "aaa.bbb",
          DictionaryChildNumberProp: 9,
          DictionaryChildArrayProp: [1, 2, 3]
        },
        "Key2": {
          DictionaryChildStringProp: "abc",
          DictionaryChildNumberProp: 49,
          DictionaryChildArrayProp: [1, 2, 3]
        }
      }
    };

    const schema = new Schema<Model>()
      .with(m => m.DictionaryProp,
        new Schema<DictionaryPropModel>()
          .with(x => x.DictionaryChildNumberProp, x => x < 50)
          .with(x => x.DictionaryChildStringProp, new AnyOf([
            /^[A-z]+\.[A-z]+$/, new StringSchema({ enum: ["abc"] })
          ]))
          .with(x => x.DictionaryChildArrayProp, new ArraySchema({
            length: x => x < 5,
            uniqueItems: true
          }))
      )
      .build();

    assertValid(schema, model);

  });

  it("Should fail when nested object property violates string schema", () => {

    const model: Model = {
      DictionaryProp: {
        "Key1": {
          DictionaryChildStringProp: "aaa",
        }
      }
    };

    const schema = new Schema<Model>()
      .with(m => m.DictionaryProp,
        new Schema<DictionaryPropModel>()
          .with(x => x.DictionaryChildStringProp, /^[A-z]+\.[A-z]+$/)
      )
      .build();

    assertInvalid(schema, model);

  });

  it("Should fail when nested object property violates number schema", () => {

    const model: Model = {
      DictionaryProp: {
        "Key1": {
          DictionaryChildNumberProp: 50
        }
      }
    };

    const schema = new Schema<Model>()
      .with(m => m.DictionaryProp,
        new Schema<DictionaryPropModel>()
          .with(x => x.DictionaryChildNumberProp, x => x < 50)
      )
      .build();

    assertInvalid(schema, model);

  });

  it("Should fail when nested object property violates array schema", () => {

    const model: Model = {
      DictionaryProp: {
        "Key1": {
          DictionaryChildArrayProp: [1, 2, 3, 3]
        }
      }
    };

    const schema = new Schema<Model>()
      .with(m => m.DictionaryProp,
        new Schema<DictionaryPropModel>()
          .with(x => x.DictionaryChildArrayProp, new ArraySchema({
            length: x => x < 5,
            uniqueItems: true
          }))
      )
      .build();

    assertInvalid(schema, model);

  });

  it("Should fail when nested object property violates boolean schema", () => {

    const model: Model = {
      DictionaryProp: {
        "Key1": {
          DictionaryChildBoolProp: null
        }
      }
    };

    const schema = new Schema<Model>()
      .with(m => m.DictionaryProp,
        new Schema<DictionaryPropModel>()
          .with(x => x.DictionaryChildBoolProp, new BooleanSchema())
      )
      .build();

    assertInvalid(schema, model);

  });

  it("Should fail when nested object property violates combinator schema", () => {

    const model: Model = {
      DictionaryProp: {
        "Key1": {
          DictionaryChildStringProp: "abc.def"
        }
      }
    };

    const schema = new Schema<Model>()
      .with(m => m.DictionaryProp,
        new Schema<DictionaryPropModel>()
          .with(x => x.DictionaryChildStringProp, new OneOf([
            /^[A-z]+\.[A-z]+$/, new StringSchema({ length: x => x === 7 })
          ]))
      )
      .build();

    assertInvalid(schema, model);

  });


  it("Should pass when double nested dictionary object is valid", () => {

    const model: Model = {
      NestedDictionaryProp: {
        "KeyA": {
          "KeyA1": {
            DictionaryChildNumberProp: 50
          }
        }
      }
    };


    const schema = new Schema<Model>()
      .with(x => x.NestedDictionaryProp,
        new Schema<NestedDictionaryPropModel>().with(x => x,
          new Schema<DictionaryPropModel>()
            .with(x => x.DictionaryChildNumberProp, x => x < 100)
        )).build();


    assertValid(schema, model);

  });


  it("Should fail when double nested dictionary object is invalid", () => {

    const model: Model = {
      NestedDictionaryProp: {
        "KeyA": {
          "KeyA1": {
            DictionaryChildNumberProp: 500
          }
        }
      }
    };


    const schema = new Schema<Model>()
      .with(x => x.NestedDictionaryProp,
        new Schema<NestedDictionaryPropModel>().with(x => x,
          new Schema<DictionaryPropModel>()
            .with(x => x.DictionaryChildNumberProp, x => x < 100)
        )).build();


    assertInvalid(schema, model);

  });
});
