import { Rule, EntityIsCard } from './rule';
import { Entity, EntityCard, EntityTitle } from '../../store';
import { Results } from '../index';

export class RuleTitle implements Rule {
  public async process(entity: Entity, results: Results): Promise<void> {
    if (!EntityIsCard(entity)) return;
    const e = entity as EntityCard;
    const expansion = e.exp;
    const result = await results.get(new EntityTitle(e.title));
    const entries = await entity.read();
    const title = (entries.get('title') as any)[0].content;
    const product = (entries.get('product') as any)[0].content;
    const no = (entries.get('no') as any)[0].content;

    result.target.withDefault('expansions', []).withDefault(expansion);
    result.target
      .withDefault('products', [])
      .withDefault({ name: product })
      .withDefault('cards', [])
      .withDefault(no);
    result.target.withConst('name', title);
  }
}
