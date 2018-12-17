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

    if (!result.target.expansions) result.target.expansions = [];
    const expansions = result.target.expansions as string[];
    if (!expansions.includes(expansion)) expansions.push(expansion);

    result.target.name = (entries.get('title') as any)[0].content;
  }
}
