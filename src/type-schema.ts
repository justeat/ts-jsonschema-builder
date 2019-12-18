
export interface ISchema {
  required?: boolean;
}
export interface ITypeSchema<T> extends ISchema {
  readonly type?: T;
}

export class PropertySchema implements ISchema {
  public isSchema = true;
  public required?: boolean = true;

  constructor(schema: ISchema) {
    schema = schema || {};
    this.required = typeof schema.required === "undefined" ? this.required : schema.required;
    Object.defineProperty(this, "isSchema", { enumerable: false, writable: true });
    Object.defineProperty(this, "required", { enumerable: false, writable: true });
  }

  public compile() {
    return Object.assign({}, this);
  }
}

export class TypeSchema<T> extends PropertySchema implements ITypeSchema<T> {
  readonly type?: T;

  constructor(schema: ITypeSchema<T>) {
    super(schema);
  }
}
