import { Schema, ArraySchema, StringSchema, AnyOf, NumberSchema, AllOf, BooleanSchema, OneOf, DictionarySchema } from "../src";
import { Model, DictionaryPropModel, NestedDictionaryPropModel, Model3, Model2 } from "./models";
import { assertValid, assertInvalid } from "./assertion";
import { expect } from "chai";

describe("Dictionary", () => {

  it("Should pass when nested object property satisfies schema", () => {

    const model: Model = {
      DictionaryProp: {
        "Key1": {
          DictionaryChildStringProp: "aaa.bbb",
          DictionaryChildNumberProp: 9,
          DictionaryChildArrayProp: [1, 2, 3],
          DictionaryChildObjectArrayProp: [{
            Lvl3StrProp: "aaaaa"
          }]
        },
        "Key2": {
          DictionaryChildStringProp: "abc",
          DictionaryChildNumberProp: 49,
          DictionaryChildArrayProp: [1, 2, 3],
          DictionaryChildObjectArrayProp: [{
            Lvl3StrProp: "bbbbb"
          }]
        }
      }
    };

    const schema = new Schema<Model>()
      .with(m => m.DictionaryProp,
        new DictionarySchema<DictionaryPropModel>()
          .with(x => x.DictionaryChildNumberProp, x => x < 50)
          .with(x => x.DictionaryChildStringProp, new AnyOf([
            /^[A-z]+\.[A-z]+$/, new StringSchema({ enum: ["abc"] })
          ]))
          .with(x => x.DictionaryChildArrayProp, new ArraySchema({
            length: x => x < 5,
            uniqueItems: true
          }))
          .with(x => x.DictionaryChildObjectArrayProp, new ArraySchema({
            length: x => x >= 1,
            uniqueItems: true,
            items: new Schema<Model3>().with(
              x => x.Lvl3StrProp,
              new StringSchema({
                minLength: 5
              })
            )
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
          DictionaryChildNumberProp: 50,
          DictionaryChildObjectArrayProp: [{
            Lvl3StrProp: "aaaaa"
          }, {
            Lvl3StrProp: "aaaaa"
          }]
        }
      }
    };

    const schema = new Schema<Model>()
      .with(m => m.DictionaryProp,
        new DictionarySchema<DictionaryPropModel>()
          .with(x => x.DictionaryChildStringProp, /^[A-z]+\.[A-z]+$/)
          .with(x => x.DictionaryChildNumberProp, x => x > 100)
          .with(x => x.DictionaryChildObjectArrayProp, new ArraySchema({
            length: x => x >= 1,
            uniqueItems: true,
            items: new Schema<Model3>().with(
              x => x.Lvl3StrProp,
              new StringSchema({
                minLength: 5
              })
            )
          }))
      )
      .build();

    const errors = assertInvalid(schema, model);
    expect(errors.length).to.be.eq(3);

    const patternError = errors.find(err => err.keyword === "pattern");
    expect(patternError).to.not.be.null;
    expect(patternError.dataPath).to.be.eq(".DictionaryProp['Key1'].DictionaryChildStringProp");

    const exclusiveMinimumError = errors.find(err => err.keyword === "exclusiveMinimum");
    expect(exclusiveMinimumError).to.not.be.null;
    expect(exclusiveMinimumError.dataPath).to.be.eq(".DictionaryProp['Key1'].DictionaryChildNumberProp");

    const uniqueItemsError = errors.find(err => err.keyword === "uniqueItems");
    expect(uniqueItemsError).to.not.be.null;
    expect(uniqueItemsError.dataPath).to.be.eq(".DictionaryProp['Key1'].DictionaryChildObjectArrayProp");

  });

  it("Should pass when nested Schema<T> applied to nested object", () => {

    const model: Model = {
      ObjProp: {
        Lvl2ObjProp: {
          Lvl3StrProp: "aaa.bbb"
        }
      }
    };

    const schemaLvl2 = new Schema<Model2>()
      .with(x => x.Lvl2ObjProp.Lvl3StrProp, /^[A-z]+\.[A-z]+$/);


    const schema = new Schema<Model>()
      .with(m => m.ObjProp, schemaLvl2)
      .build();

    assertValid(schema, model);

  });

  it("Should fail with multiple errors", () => {

    const model: Model = {
      NumberProp: 50,
      StringProp: "aaa"
    };

    const schema = new Schema<Model>()
      .with(x => x.StringProp, /^[A-z]+\.[A-z]+$/)
      .with(x => x.NumberProp, x => x > 100)
      .build();

    const errors = assertInvalid(schema, model);

    expect(errors.length).to.be.eq(2);

    const patternError = errors.find(err => err.keyword === "pattern");
    expect(patternError).to.not.be.null;
    expect(patternError.dataPath).to.be.eq(".StringProp");

    const exclusiveMinimumError = errors.find(err => err.keyword === "exclusiveMinimum");
    expect(exclusiveMinimumError).to.not.be.null;
    expect(exclusiveMinimumError.dataPath).to.be.eq(".NumberProp");

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
        new DictionarySchema<DictionaryPropModel>()
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
        new DictionarySchema<DictionaryPropModel>()
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
        new DictionarySchema<DictionaryPropModel>()
          .with(x => x.DictionaryChildBoolProp, new BooleanSchema())
      )
      .build();

    assertInvalid(schema, model);

  });

  it("Should pass when nested object property Schema is optional and is missing", () => {

    const model: Model = {
    };

    const nestedSchema = new DictionarySchema<DictionaryPropModel>({ required: false })
      .with(x => x.DictionaryChildBoolProp, new BooleanSchema());

    const schema = new Schema<Model>()
      .with(m => m.DictionaryProp, nestedSchema);

    assertValid(schema.build(), model);
  });

  it("Should fail when nested object property Schema is optional but property is specified and is invalid", () => {

    const model: Model = {
      DictionaryProp: {
        "Key1": {
          DictionaryChildStringProp: ""
        }
      }
    };

    const nestedSchema = new DictionarySchema<DictionaryPropModel>({ required: false })
      .with(x => x.DictionaryChildStringProp, new StringSchema({
        minLength: 10
      }));

    const schema = new Schema<Model>()
      .with(m => m.DictionaryProp, nestedSchema);

    assertInvalid(schema.build(), model);
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
        new DictionarySchema<DictionaryPropModel>()
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
        new DictionarySchema<NestedDictionaryPropModel>().with(x => x,
          new DictionarySchema<DictionaryPropModel>()
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
          new DictionarySchema<DictionaryPropModel>()
            .with(x => x.DictionaryChildNumberProp, x => x < 100)
        )).build();


    assertInvalid(schema, model);

  });

});
