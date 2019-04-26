import { ITypeSchema } from "./type-schema";
export interface IStringSchema extends ITypeSchema<"string"> {
    readonly type?: "string";
    /**
     * @description The format keyword allows for basic semantic validation on certain kinds of string values that are commonly used.
     * Built-in formats: `date-time`, `email`, `hostname`, `ipv4`, `ipv6`, `uri`
     * @example
     * new StringSchema({
     *   format: "date-time"
     * })
     * @see https://json-schema.org/understanding-json-schema/reference/string.html#format
     */
    format?: "date-time" | "email" | "hostname" | "ipv4" | "ipv6" | "uri";
    /**
     * @description The pattern keyword is used to restrict a string to a particular regular expression.
     * @see https://json-schema.org/understanding-json-schema/reference/string.html#regular-expressions
     */
    pattern?: RegExp;
    /**
     * @description The length of a string can be constrained using the minLength and maxLength keywords. For both keywords, the value must be a non-negative number.
     * @see https://json-schema.org/understanding-json-schema/reference/string.html#length
     */
    minLength?: number;
    /**
     * @description The length of a string can be constrained using the minLength and maxLength keywords. For both keywords, the value must be a non-negative number.
     * @see https://json-schema.org/understanding-json-schema/reference/string.html#length
     */
    maxLength?: number;
    /**
     * @description The length of a string can be constrained using Expression. x => x < 10, Supported operators: `==`, `===`, `>=`, `<=`, `>`, `<`
     * @see https://json-schema.org/understanding-json-schema/reference/string.html#length
     */
    length?: (model: number) => boolean;
    /**
     * @description The enum keyword is used to restrict a value to a fixed set of values. It must be an array with at least one element, where each element is unique.
     * @see https://json-schema.org/understanding-json-schema/reference/generic.html#enumerated-values
     */
    enum?: string[];
}
export declare class StringSchema {
    readonly type = "string";
    readonly format?: "date-time" | "email" | "hostname" | "ipv4" | "ipv6" | "uri";
    readonly pattern?: string;
    readonly minLength?: number;
    readonly maxLength?: number;
    enum?: string[];
    required: boolean;
    constructor(schema?: (model: number) => boolean);
    constructor(schema?: IStringSchema);
}
