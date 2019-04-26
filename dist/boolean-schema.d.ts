import { ITypeSchema } from "./type-schema";
export interface IBooleanSchema extends ITypeSchema<"boolean"> {
    readonly type?: "boolean";
    /**
     * @description The enum keyword is used to restrict a value to a fixed set of values. It must be an array with at least one element, where each element is unique.
     * @see https://json-schema.org/understanding-json-schema/reference/generic.html#enumerated-values
     */
    enum?: boolean[];
}
export declare class BooleanSchema implements IBooleanSchema {
    readonly type = "boolean";
    enum?: boolean[];
    required: boolean;
    constructor(schema?: IBooleanSchema);
}
