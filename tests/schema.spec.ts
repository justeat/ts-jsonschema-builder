import Ajv from "ajv";
import { describe, it } from "mocha";
import { should } from "chai";
should();

import { Schema, Model, Model2 } from "../src/schema";


describe("Schema", function () {
  it("should pass", function () {

    const model = {
      propA: "sergej.popov",
      propB: 5,
      propD: {
        propF: "abc"
      } as Model2
    } as Model;

    const j = new Schema<Model>();
    j.with(m => m.propA, /^[a-zA-Z]+\.[a-zA-Z]+$/);
    j.with(m => m.propD.propF, "abc");
    j.with(m => m.propB, 10);
    const jsonSchema = j.build();

    const ajv = new Ajv();
    const validate = ajv.compile(jsonSchema);
    const valid = validate(model);

    console.log("ASSERT", { valid, model, err: validate.errors });

    valid.should.be.eql(true, JSON.stringify(validate.errors));
  });

  it("should fail", function () {

    const model = {
      propD: {
        propF: null
      } as Model2
    } as Model;

    const j = new Schema<Model>();
    j.with(m => { return m.propD.propF; }, "abc");
    const jsonSchema = j.build();

    const ajv = new Ajv();
    const validate = ajv.compile(jsonSchema);
    const valid = validate(model);

    valid.should.be.eql(false, "Because model is invalid");
  });
});