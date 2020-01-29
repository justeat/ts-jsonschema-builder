import { testCase } from "./test-case";
import { Model } from "./models";
import { Schema, StringSchema } from "../src";
import { assertValid, assertInvalid, assert } from "./assertion";


describe("String", () => {

  /**
   * @see https://json-schema.org/understanding-json-schema/reference/string.html#string
   */
  describe("Type", () => {

    it("Should pass when string property type matches", () => {

      const model: Model = {
        StringProp: "abc.def"
      };

      const schema = new Schema<Model>()
        .with(m => m.StringProp, new StringSchema())
        .build();

      assertValid(schema, model);
    });

    it("Should pass when string property name is a string", () => {

      const model: Model = {};
      model["Quote Prop"] = "abc.def";

      const schema = new Schema<Model>()
        .with(m => m["Quote Prop"], new StringSchema())
        .build();

      assertValid(schema, model);
    });

    it("Should pass when string property names are mixed with non-string property names", () => {

      const model: Model = {
        StringProp: "test.me"
      };
      model["Quote Prop"] = "abc.def";

      const schema = new Schema<Model>()
        .with(m => m["Quote Prop"], new StringSchema())
        .with(m => m.StringProp, new StringSchema())
        .build();

      assertValid(schema, model);
    });

    it("Should fail when type doesn't match", () => {

      const model = {
        StringProp: 123
      };

      const schema = new Schema<Model>()
        .with(m => m.StringProp, new StringSchema())
        .build();

      assertInvalid(schema, model);
    });

    it("Should fail when property is missing and 'required: false' is not explicitly specified", () => {

      const model = {};

      const schema = new Schema<Model>()
        .with(m => m.StringProp, new StringSchema())
        .build();

      assertInvalid(schema, model);
    });

    it("Should pass when property is missing and 'required: false' is explicitly specified", () => {

      const model = {};

      const schema = new Schema<Model>()
        .with(m => m.StringProp, new StringSchema({
          required: false
        }))
        .build();

      assertValid(schema, model);
    });
  });


  describe("Exact string validation", () => {

    it("Should pass when string matches exactly", () => {

      const model: Model = {
        StringProp: "abc.def"
      };

      const schema = new Schema<Model>()
        .with(m => m.StringProp, new StringSchema({
          enum: ["abc.def"]
        }))
        .build();

      assertValid(schema, model);


      const schema2 = new Schema<Model>()
        .with(m => m.StringProp, "abc.def")
        .build();

      assertValid(schema2, model);
    });

    it("Should fail when string doesn't match exactly", () => {

      const model: Model = {
        StringProp: "abc.def"
      };

      const schema = new Schema<Model>()
        .with(m => m.StringProp, "def.abc")
        .build();

      assertInvalid(schema, model);
    });

    it("Should pass when string contains regex special characters", () => {

      const model: Model = {
        StringProp: "Special character: \ ^ $ * + ? . ( ) | { } [ ]"
      };

      const schema = new Schema<Model>()
        .with(m => m.StringProp, "Special character: \ ^ $ * + ? . ( ) | { } [ ]")
        .build();

      assertValid(schema, model);
    });

  });


  /**
   * @see https://json-schema.org/understanding-json-schema/reference/string.html#format
   */
  describe("Format", () => {

    testCase(
      [
        { value: new Date().toISOString(), format: "date-time", expected: true },
        { value: "2019-01-01", format: "date-time", expected: false },
        { value: "12:00:00", format: "date-time", expected: false },
        { value: "abc", format: "date-time", expected: false },
        { value: "abc", format: "date-time", expected: false },

        { value: "abc@abc.com", format: "email", expected: true },
        { value: "abc@abc", format: "email", expected: true },
        { value: "abc@", format: "email", expected: false },
        { value: "@abc.com", format: "email", expected: false },
        { value: "@@@", format: "email", expected: false },
        { value: "abc", format: "email", expected: false },

        { value: "abc.com", format: "hostname", expected: true },
        { value: "abc.abc.com", format: "hostname", expected: true },
        { value: "abc.com/abc", format: "hostname", expected: false },
        { value: ".com", format: "hostname", expected: false },
        { value: "abc.", format: "hostname", expected: false },
        { value: "...", format: "hostname", expected: false },

        { value: "192.168.1.1", format: "ipv4", expected: true },
        { value: "10.10.10.10", format: "ipv4", expected: true },
        { value: "255.255.255.255", format: "ipv4", expected: true },
        { value: "256.256.256.256", format: "ipv4", expected: false },
        { value: "10.10.10", format: "ipv4", expected: false },
        { value: "10.10..10", format: "ipv4", expected: false },
        { value: "...", format: "ipv4", expected: false },
        { value: "10.10.10.a", format: "ipv4", expected: false },

        { value: "2001:0db8:0000:0042:0000:8a2e:0370:7334", format: "ipv6", expected: true },
        { value: "2001:0db8:0000:0042:0000:8a2e:0370:", format: "ipv6", expected: false },
        { value: "2001:0db8:0000:0042:0000:8a2e:0370", format: "ipv6", expected: false },
        { value: "10.10.10.10", format: "ipv6", expected: false },

        { value: "https://abc.com", format: "uri", expected: true },
        { value: "https://abc.com/abc", format: "uri", expected: true },
        { value: "abc.com/abc", format: "uri", expected: false },
        { value: "abc.com", format: "uri", expected: false },
        { value: ".com", format: "uri", expected: false },
        { value: "abc", format: "uri", expected: false },
      ], c => {

        it(`Should ${c.expected ? "pass" : "fail"} when string matches '${c.format}' format`, () => {

          const model: Model = {
            StringProp: c.value
          };

          const schema = new Schema<Model>()
            .with(m => m.StringProp, new StringSchema({
              format: c.format as any
            }))
            .build();


          assert(c.expected, schema, model);
        });
      });
  });

  /**
   * @see https://json-schema.org/understanding-json-schema/reference/string.html#regular-expressions
   */
  describe("Regular Expressions", () => {
    it("Should pass when string matches RegEx", () => {

      const model: Model = {
        StringProp: "abc.def"
      };

      const schema = new Schema<Model>()
        .with(m => m.StringProp, /^[A-z]+\.[A-z]+$/)
        .build();

      assertValid(schema, model);
    });

    it("Should fail when string doesn't match RegEx", () => {

      const model: Model = {
        StringProp: "InvalidName"
      };

      const schema = new Schema<Model>()
        .with(m => m.StringProp, /^[A-z]+\.[A-z]+$/)
        .build();

      assertInvalid(schema, model);
    });

  });

  /**
   * @see https://json-schema.org/understanding-json-schema/reference/string.html#length
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
        it(`Should ${c.expected ? "pass" : "fail"} when number matches ${c.reason} expression`, () => {

          const model: Model = {
            StringProp: "10CharStr."
          };

          const schema = new Schema<Model>()
            .with(m => m.StringProp, new StringSchema(c.expression))
            .build();

          assert(c.expected, schema, model);
        });
      });

  });

});
