export class Model {
  public "Quote-Prop"?: string;
  public StringProp?: string;
  public NumberProp?: number;
  public BooleanProp?: boolean;
  public ArrayProp?: Array<number | string | boolean | Array<any>>;
  public ObjProp?: Model2;
  public ObjArrayProp?: Array<Model2>;
  public DictionaryProp?: {
    [key: string]: DictionaryPropModel
  };
  public NestedDictionaryProp?: {
    [key: string]: NestedDictionaryPropModel
  };
}

export class NestedDictionaryPropModel {
  [key: string]: DictionaryPropModel
}

export class DictionaryPropModel {
  DictionaryChildStringProp?: string;
  DictionaryChildNumberProp?: number;
  DictionaryChildArrayProp?: Array<number>;
  DictionaryChildBoolProp?: boolean;
  DictionaryChildObjectArrayProp?: Array<Model3>;
}

export class Model2 {
  public Lvl2StrProp?: string;
  public Lvl2ObjProp?: Model3;
}
export class Model3 {
  public Lvl3StrProp?: string;
}
