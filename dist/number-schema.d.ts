import { ITypeSchema } from "./type-schema";
export interface INumberSchema extends ITypeSchema<"number"> {
    readonly type?: "number";
    /**
     * @description Numbers can be restricted to a multiple of a given number, using the multipleOf keyword. It may be set to any positive number.
     * @see https://json-schema.org/understanding-json-schema/reference/numeric.html#multiples
     */
    multipleOf?: number;
    /**
     * @description Ranges of numbers are specified using a combination of the minimum and maximum keywords
     * @see https://json-schema.org/understanding-json-schema/reference/numeric.html#range
     */
    minimum?: number;
    /**
     * @description Ranges of numbers are specified using a combination of the minimum and maximum keywords
     * @see https://json-schema.org/understanding-json-schema/reference/numeric.html#range
     */
    maximum?: number;
    /**
     * @description Ranges of numbers are specified using Expression. x => x < 10, Supported operators: `==`, `===`, `>=`, `<=`, `>`, `<`
     * @example
     * new NumberSchema({
     *     value: x => x <= 15
     * })
     * @see https://json-schema.org/understanding-json-schema/reference/numeric.html#range
     */
    value?: (model: number) => boolean;
}
export declare class NumberSchema implements INumberSchema {
    readonly type = "number";
    readonly multipleOf?: number;
    readonly minimum?: number;
    readonly maximum?: number;
    required: boolean;
    constructor(schema?: (model: number) => boolean);
    constructor(schema?: INumberSchema);
}
