import Ajv from "ajv";
import { should } from "chai";

import { Model } from "./models";
import { Schema } from "../src/schema";
should();

describe("Exact Bool validation", function () {

    it("Should pass when Bool matches exactly ", function () {

        const model: Model = {
            BoolProp: false
        };

        const schema = new Schema<Model>()
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

        const schema = new Schema<Model>()
            .with(m => m.BoolProp, true)
            .build();

        const validator = new Ajv().compile(schema);
        const isValid = validator(model);

        isValid.should.be.eql(false, JSON.stringify(validator.errors));
    });
});
