import Ajv from "ajv";
import { describe, it } from "mocha";
import { should } from "chai";
should();

import { Schema, Model, TypeDefinition, Model2 } from "../src/schema";


describe("Schema", function () {
  it("should return -1 when the value is not present", function () {

    const model = {
      propD: {
        propF: "abc"
      } as Model2
    } as Model;

    TypeDefinition
      .for(Model)
      .add("propA", String)
      .add("propB", Number)
      .add("propC", Boolean)
      .add("propD", Model2);

    TypeDefinition
      .for(Model2)
      .add("propF", String);

    const j = new Schema<Model>(Model);
    j.with(m => m.propD.propF, "abc");
    const jsonSchema = j.build();

    const ajv = new Ajv();
    const validate = ajv.compile(jsonSchema);
    const valid = validate(model);

    valid.should.be.eql(true, JSON.stringify(validate.errors));
  });
});