import Ajv from "ajv";
import { describe, it } from "mocha";
import { should } from "chai";
should();

import { Schema as SchemaV2, ArrayOptions, DateOptions } from "../src/schema";
import { testCase } from "./test-case";

export class Model {
  public StringProp?: string;
  public NumProp?: number;
  public BoolProp?: boolean;
  public ArrayProp?: Array<number>;
  public DateProp?: Date;
  public ObjProp?: Model2;
}

export class Model2 {
  public Lvl2StrProp?: string;
  public Lvl2ObjProp?: Model3;
}
export class Model3 {
  public Lvl3StrProp?: string;
}

describe("Usage", function () {

  it("Complete picture", function () {

    const model: Model = {
      StringProp: "sergej.popov",
      NumProp: 10,
      BoolProp: false,
      ArrayProp: [1, 2, 3],
      DateProp: new Date("2018-01-01T12:00:00").toISOString() as any,
      ObjProp: {
        Lvl2ObjProp: {
          Lvl3StrProp: "aaa.bbb"
        }
      }
    };


    const schema = new SchemaV2<Model>()
      .with(m => m.StringProp, /^[a-zA-Z]+\.[a-zA-Z]+$/)
      .with(m => m.NumProp, x => x >= 10)
      .with(m => m.BoolProp, false)
      .with(m => m.ArrayProp, x => x.length >= 3, ArrayOptions.UniqueItems)
      .with(m => m.DateProp, new Date("2018-01-01T12:00:00"))
      .with(m => m.ObjProp.Lvl2ObjProp.Lvl3StrProp, /^[a-zA-Z]+\.[a-zA-Z]+$/)
      .build();

    const validator = new Ajv().compile(schema);
    const isValid = validator(model);

    isValid.should.be.eql(true, JSON.stringify(validator.errors));
  });
});

describe("Type safety", function () {

  it("Options Enums should not have clashing numbers", function () {
    // Options enum may mot clash as they help figuring out the type

    const model: Model = {
      StringProp: "sergej.popov"
    };

    const arrayEnumNumbers = Object.values(ArrayOptions).filter(Number.isFinite);
    const dateEnumNumbers = Object.values(DateOptions).filter(Number.isFinite);
    const intersection = arrayEnumNumbers.filter(x => dateEnumNumbers.includes(x));

    intersection.should.be.empty;
  });
});

describe("Structural", function () {

  it("Should not add same field to a required list twice", function () {

    const model: Model = {
      StringProp: "sergej.popov"
    };

    const schema = new SchemaV2<Model>()
      .with(m => m.StringProp, "sergej.popov")
      .with(m => m.StringProp, "sergej.popov")
      .build() as any;

    schema.required.length.should.eq(1);

    const validator = new Ajv().compile(schema);
    const isValid = validator(model);

    isValid.should.be.eql(true);
  });

  it("Should require nested object", function () {

    const model: Model = {
      ObjProp: {
        Lvl2ObjProp: {
        }
      }
    };

    const schema = new SchemaV2<Model>()
      .with(m => m.ObjProp.Lvl2ObjProp.Lvl3StrProp, /^[a-zA-Z]+\.[a-zA-Z]+$/)
      .build();

    const validator = new Ajv().compile(schema);
    const isValid = validator(model);

    isValid.should.be.eql(false, JSON.stringify(validator.errors));
  });
});




describe("Exact string validation", function () {

  it("Should pass when string matches exactly ", function () {

    const model: Model = {
      StringProp: "sergej.popov"
    };

    const schema = new SchemaV2<Model>()
      .with(m => m.StringProp, "sergej.popov")
      .build();

    const validator = new Ajv().compile(schema);
    const isValid = validator(model);

    isValid.should.be.eql(true);
  });

  it("Should fail when string doesn't match exactly", function () {

    const model: Model = {
      StringProp: "sergej.popov"
    };

    const schema = new SchemaV2<Model>()
      .with(m => m.StringProp, "popov.sergej")
      .build();

    const validator = new Ajv().compile(schema);
    const isValid = validator(model);

    isValid.should.be.eql(false);
  });

  it("Should pass when string contains regex special characters", function () {

    const model: Model = {
      StringProp: "Special character: \ ^ $ * + ? . ( ) | { } [ ]"
    };

    const schema = new SchemaV2<Model>()
      .with(m => m.StringProp, "Special character: \ ^ $ * + ? . ( ) | { } [ ]")
      .build();

    const validator = new Ajv().compile(schema);
    const isValid = validator(model);

    isValid.should.be.eql(true, JSON.stringify(validator.errors));
  });

});

describe("RegEx validation", function () {
  it("Should pass when string matches RegEx", function () {

    const model: Model = {
      StringProp: "sergej.popov"
    };

    const schema = new SchemaV2<Model>()
      .with(m => m.StringProp, /^[a-zA-Z]+\.[a-zA-Z]+$/)
      .build();

    const validator = new Ajv().compile(schema);
    const isValid = validator(model);

    isValid.should.be.eql(true);
  });

  it("Should fail when string doesn't match RegEx", function () {

    const model: Model = {
      StringProp: "notvalidname"
    };

    const schema = new SchemaV2<Model>()
      .with(m => m.StringProp, /^[a-zA-Z]+\.[a-zA-Z]+$/)
      .build();

    const validator = new Ajv().compile(schema);
    const isValid = validator(model);

    isValid.should.be.eql(false);
  });


});

describe("Exact number validation", function () {

  it("Should pass when number matches exactly ", function () {

    const model: Model = {
      NumProp: 10
    };

    const schema = new SchemaV2<Model>()
      .with(m => m.NumProp, 10)
      .build();

    const validator = new Ajv().compile(schema);
    const isValid = validator(model);

    isValid.should.be.eql(true);
  });

  it("Should fail when number is smaller than expected", function () {

    const model: Model = {
      NumProp: 10
    };

    const schema = new SchemaV2<Model>()
      .with(m => m.NumProp, 20)
      .build();

    const validator = new Ajv().compile(schema);
    const isValid = validator(model);

    isValid.should.be.eql(false);
  });

  it("Should fail when number is greater than expected", function () {

    const model: Model = {
      NumProp: 30
    };

    const schema = new SchemaV2<Model>()
      .with(m => m.NumProp, 20)
      .build();

    const validator = new Ajv().compile(schema);
    const isValid = validator(model);

    isValid.should.be.eql(false);
  });

});

describe("Range number validation", function () {

  testCase(
    [
      { range: [10, 10], expected: true, reason: "eq" },
      { range: [8, 11], expected: true, reason: "eq" },
      { range: [8, 9], expected: false, reason: "lt" },
      { range: [9, 10], expected: true, reason: "lte" },
      { range: [10, 12], expected: true, reason: "gte" },
      { range: [11, 12], expected: false, reason: "gt" }
    ], c => {
      it(`Should ${c.expected ? "pass" : "fail"} when range is ${c.range}. ${c.reason}`, function () {

        const model: Model = {
          NumProp: 10
        };

        const schema = new SchemaV2<Model>()
          .with(m => m.NumProp, c.range as [number, number])
          .build();

        const validator = new Ajv().compile(schema);
        const isValid = validator(model);

        isValid.should.be.eql(c.expected);
      });
    });

});

describe("Exact Date validation", function () {

  it("Should pass when Date matches exactly ", function () {

    const model: Model = {
      DateProp: new Date("2018-01-01T12:00:00").toISOString()
    } as any;

    const schema = new SchemaV2<Model>()
      .with(m => m.DateProp, new Date("2018-01-01T12:00:00"))
      .build();

    const validator = new Ajv().compile(schema);
    const isValid = validator(model);

    isValid.should.be.eql(true, JSON.stringify(validator.errors));
  });
});

describe("Exact Bool validation", function () {

  it("Should pass when Bool matches exactly ", function () {

    const model: Model = {
      BoolProp: false
    };

    const schema = new SchemaV2<Model>()
      .with(m => m.BoolProp, false)
      .build();

    const validator = new Ajv().compile(schema);
    const isValid = validator(model);

    isValid.should.be.eql(true, JSON.stringify(validator.errors));
  });

  it("Should fail when Bool doesn't match exactly ", function () {

    const model: Model = {
      BoolProp: false
    };

    const schema = new SchemaV2<Model>()
      .with(m => m.BoolProp, true)
      .build();

    const validator = new Ajv().compile(schema);
    const isValid = validator(model);

    isValid.should.be.eql(false, JSON.stringify(validator.errors));
  });
});

describe("Expression string length validation", function () {

  testCase(
    [
      { expression: (x: string) => x.length == 10, expected: true, reason: "eq" },
      { expression: (x: string) => x.length === 10, expected: true, reason: "eq" },
      { expression: (x: string) => x.length == 9, expected: false, reason: "eq" },
      { expression: (x: string) => x.length === 9, expected: false, reason: "eq" },
      { expression: (x: string) => x.length == 11, expected: false, reason: "eq" },
      { expression: (x: string) => x.length === 11, expected: false, reason: "eq" },
      { expression: (x: string) => x.length < 11, expected: true, reason: "lt" },
      { expression: (x: string) => x.length < 10, expected: false, reason: "lt" },
      { expression: (x: string) => x.length <= 10, expected: true, reason: "lte" },
      { expression: (x: string) => x.length <= 9, expected: false, reason: "lte" },
      { expression: (x: string) => x.length > 9, expected: true, reason: "gt" },
      { expression: (x: string) => x.length > 10, expected: false, reason: "gt" },
      { expression: (x: string) => x.length >= 10, expected: true, reason: "gte" },
      { expression: (x: string) => x.length >= 11, expected: false, reason: "gte" },
    ], c => {
      it(`Should ${c.expected ? "pass" : "fail"} when number matches ${c.reason} expression`, function () {

        const model: Model = {
          StringProp: "10CharStr."
        };

        const schema = new SchemaV2<Model>()
          .with(m => m.StringProp, c.expression)
          .build();

        const validator = new Ajv().compile(schema);
        const isValid = validator(model);

        isValid.should.be.eql(c.expected);
      });
    });

});

describe("Expression number validation", function () {

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
          NumProp: 10
        };

        const schema = new SchemaV2<Model>()
          .with(m => m.NumProp, c.expression)
          .build();

        const validator = new Ajv().compile(schema);
        const isValid = validator(model);

        isValid.should.be.eql(c.expected);
      });
    });
});

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

        const schema = new SchemaV2<Model>()
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

    const schema = new SchemaV2<Model>()
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

    const schema = new SchemaV2<Model>()
      .with(m => m.ArrayProp, [], ArrayOptions.UniqueItems)
      .build();

    const validator = new Ajv().compile(schema);
    const isValid = validator(model);

    isValid.should.be.eql(false, JSON.stringify(validator.errors));
  });

});