import Ajv from "ajv";
import { should } from "chai";

should();

const ajv = new Ajv({ schemaId: "id" });
ajv.addMetaSchema(require("ajv/lib/refs/json-schema-draft-04.json"));

export function assertValid(schema: Object, model: any) {
  assert(true, schema, model);
}

export function assertInvalid(schema: Object, model: any) {
  assert(false, schema, model);
}

export function assert(expected: boolean, schema: Object, model: any) {
  const validator = ajv.compile(schema);
  const isValid = validator(model);
  isValid.should.be.eql(expected, JSON.stringify(validator.errors));
}
