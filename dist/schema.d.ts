import { StringSchema, INumberSchema, IBooleanSchema, IArraySchema } from "./";
export declare class Schema<T> {
    private schema;
    constructor();
    private getMemberExpression;
    private parse;
    /**
     * @description Specify schema for a string property
     * @param {(model: T) => string} selector String property selector
     * @param {IStringSchema} schema String schema
     * @example
     * .with(m => m.StringProp, new StringSchema({...}));
     */
    with(selector: (model: T) => string, schema: StringSchema): Schema<T>;
    /**
     * @description Specify value or RegExp pattern for a string property
     * @param {(model: T) => string} selector String property selector
     * @param {string | RegExp} schema The pattern is used to restrict a string to a particular regular expression.
     * @example
     * .with(m => m.StringProp, "specificValue");
     * .with(m => m.StringProp, /^[A-z]+\.[A-z]+$/);
     */
    with(selector: (model: T) => string, schema: string | RegExp): Schema<T>;
    /**
     * @description Specify value for a number property
     * @param {(model: T) => number} selector Number property selector
     * @param {number} schema The value is used to restrict number property.
     * @example
     * .with(m => m.NumberProp, 10);
     */
    with(selector: (model: T) => number, schema: number): Schema<T>;
    /**
     * @description Specify range for a number property
     * @param {(model: T) => number} selector Number property selector
     * @param {(model: number) => boolean} schema The range of a number can be constrained using Expression. x => x < 10, Supported operators: `==`, `===`, `>=`, `<=`, `>`, `<`
     * @example
     * .with(m => m.NumberProp, x => x < 10);
     */
    with(selector: (model: T) => number, schema: (model: number) => boolean): Schema<T>;
    /**
     * @description Specify schema for a number property
     * @param {(model: T) => number} selector Number property selector
     * @param {INumberSchema} schema Number schema
     * @example
     * .with(m => m.StringProp, new NumberSchema({...}));
     */
    with(selector: (model: T) => number, schema: INumberSchema): Schema<T>;
    /**
     * @description Specify value for a boolean property
     * @param {(model: T) => boolean} selector Boolean property selector
     * @param {boolean} schema The value is used to restrict boolean property.
     * @example
     * .with(m => m.BooleanProp, 10);
     */
    with(selector: (model: T) => boolean, schema: boolean): Schema<T>;
    /**
     * @description Specify schema for a boolean property
     * @param {(model: T) => boolean} selector Boolean property selector
     * @param {IBooleanSchema} schema Boolean schema
     * @example
     * .with(m => m.StringProp, new BooleanSchema());
     */
    with(selector: (model: T) => boolean, schema: IBooleanSchema): Schema<T>;
    /**
     * @description Specify schema for a array property
     * @param {(model: T) => any[]} selector Array property selector
     * @param {IArraySchema} schema Array schema
     * @example
     * .with(m => m.ArrayProp, new ArraySchema({...}));
     */
    with(selector: (model: T) => any[] | undefined, schema: IArraySchema): Schema<T>;
    build(): Object;
}
