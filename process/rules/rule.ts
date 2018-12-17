import { Entity, EntityCard, EntityTitle, EntityExpansion } from '../../store';
import { Entry } from '../../store/dao';
import { Results } from '../index';

export class Result {
  public target: any;
  constructor(public readonly entity: Entity) {}

  public async init() {
    console.log(`loading ${this.entity.path}`);
    this.target = await this.entity.load();
  }

  public async finalize() {
    await this.entity.save(this.target);
  }
}

export interface Rule {
  process(entity: Entity, results: Results): Promise<void>;
}

export function RuleCopyGeneric(
  filter: (entity: Entity) => boolean,
  name: string,
  test: (entries: Map<string, Entry[]>) => boolean
): Rule {
  return new class implements Rule {
    public async process(entity: Entity, results: Results): Promise<void> {
      if (!filter(entity)) return;
      const entries = await entity.read();
      if (!test(entries)) return;
      const result = await results.get(entity);
      const entry = entries.get(name);
      if (!entry) return;
      const found = entry.find((e) => result.target[name] === e.content);
      if (!found) result.target[name] = entry[0].content;
    }
  }();
}

export function RuleCopy(filter: (entity: Entity) => boolean, name: string) {
  return RuleCopyGeneric(filter, name, () => true);
}

export function RuleCopyIfType(
  filter: (entity: Entity) => boolean,
  name: string,
  type: string
) {
  return RuleCopyGeneric(filter, name, (entries) => {
    const types = entries.get('type');
    return !!types && types[0].content === type;
  });
}

export function EntityIsCard(entity: Entity): boolean {
  return entity instanceof EntityCard;
}

export function EntityIsExpansion(entity: Entity): boolean {
  return entity instanceof EntityExpansion;
}

export function EntityIsTitle(entity: Entity): boolean {
  return entity instanceof EntityTitle;
}
