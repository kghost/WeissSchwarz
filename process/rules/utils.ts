import * as _ from 'lodash';

declare global {
  interface Object {
    withDefault<T>(property: string | symbol, v: T): T;
    withConst<T>(property: string | symbol, v: T): T;
  }

  interface Array<T> {
    withDefault(v: T): T;
  }
}

Object.prototype.withConst = function<T>(property: string | symbol, v: T): T {
  if (this.hasOwnProperty(property)) {
    const old = (this as any)[property] as T;
    if (_.isObject(v)) {
      if (!_.isMatch(old as any, v as any)) {
        throw new Error('Const inconsistant');
      }
    } else {
      if (old !== v) throw new Error('Const inconsistant');
    }
    return old;
  } else return ((this as any)[property] = v);
};

Object.prototype.withDefault = function<T>(property: string | symbol, v: T): T {
  if (this.hasOwnProperty(property)) return (this as any)[property] as T;
  else return ((this as any)[property] = v);
};

Array.prototype.withDefault = function<T>(v: T): T {
  const f = this.find(_.matches(v));
  if (f) return f as T;
  else {
    this.push(v);
    return v;
  }
};
