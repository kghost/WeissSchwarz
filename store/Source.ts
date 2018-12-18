import { serializable, primitive } from 'serializr';

const sources = './cache/sources';

export abstract class Source {
  @serializable(primitive())
  public type: string;

  constructor(type: string) {
    this.type = type;
  }

  public compare(that: Source): number {
    if (this.type === that.type) return this.compare2(that);
    else return this.type > that.type ? 1 : -1;
  }

  protected abstract compare2(that: Source): number;
  abstract get hash(): number;
  abstract get path(): string;

  public get cachepath() {
    return `${sources}/${(this.hash % 256).toString(16).padStart(2, '0')}/${
      this.path
    }`;
  }
}
