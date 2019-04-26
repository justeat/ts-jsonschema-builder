import { ITypeSchema } from "./type-schema";
export interface IArraySchema extends ITypeSchema<"array"> {
    readonly type?: "array";
    /**
     * @description The length of the array can be specified using the minItems and maxItems keywords. The value of each keyword must be a non-negative number. These keywords work whether doing List validation or Tuple validation.
     * @see https://json-schema.org/understanding-json-schema/reference/array.html#length
     */
    minItems?: number;
    /**
     * @description The length of the array can be specified using the minItems and maxItems keywords. The value of each keyword must be a non-negative number. These keywords work whether doing List validation or Tuple validation.
     * @see  https://json-schema.org/understanding-json-schema/reference/array.html#length
     */
    maxItems?: number;
    /**
     * @description A schema can ensure that each of the items in an array is unique. Simply set the uniqueItems keyword to true.
     * @see https://json-schema.org/understanding-json-schema/reference/array.html#uniqueness
     */
    uniqueItems?: boolean;
    /**
     * @description The length of the array can be specified using Expression. x => x < 10. Supported operators: `==`, `===`, `>=`, `<=`, `>`, `<`
     * @see https://json-schema.org/understanding-json-schema/reference/array.html#length
     */
    length?: (model: number) => boolean;
    /**
     * @description Tuple validation is useful when the array is a collection of items where each has a different schema and the ordinal index of each item is meaningful.
     * @see https://json-schema.org/understanding-json-schema/reference/array.html#tuple-validation
     * @example
     * new ArraySchema({
     *    items: [1, 2],
     *    additionalItems: false
     * }))
     */
    items?: any[];
    /**
     * @description The additionalItems keyword controls whether it’s valid to have additional items in the array beyond what is defined in items.
     * @see https://json-schema.org/understanding-json-schema/reference/array.html#tuple-validation
     */
    additionalItems?: boolean;
}
export declare class ArraySchema {
    readonly type = "array";
    readonly minItems?: number;
    readonly maxItems?: number;
    readonly uniqueItems?: boolean;
    readonly items?: any[];
    readonly additionalItems?: boolean;
    required: boolean;
    constructor(schema?: IArraySchema);
}
