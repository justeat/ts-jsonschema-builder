export class Model {
  public StringProp?: string;
  public NumberProp?: number;
  public BooleanProp?: boolean;
  public ArrayProp?: Array<number | string | boolean | any[]>;
  public ObjProp?: Model2;
}

export class Model2 {
  public Lvl2StrProp?: string;
  public Lvl2ObjProp?: Model3;
}
export class Model3 {
  public Lvl3StrProp?: string;
}
