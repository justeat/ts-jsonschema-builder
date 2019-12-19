import Ajv from "ajv";
import { should } from "chai";

should();

const ajv = new Ajv({ schemaId: "id", allErrors: true });
ajv.addMetaSchema(require("ajv/lib/refs/json-schema-draft-04.json"));

export function assertValid(schema: Object, model: any): void {
  assert(true, schema, model);
}

export function assertInvalid(schema: Object, model: any): Ajv.ErrorObject[] {
  return assert(false, schema, model);
}

export function assert(expected: boolean, schema: Object, model: any): Ajv.ErrorObject[] {


  const validator = ajv.compile(schema);
  const isValid = validator(model);
  isValid.should.be.eql(expected, JSON.stringify(validator.errors));
  return validator.errors;
}
