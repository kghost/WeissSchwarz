import { EntityIsCard, Rule } from './rule';
import { Entity } from '../../store';
import { Results } from '../index';

export class RuleText implements Rule {
  public async process(entity: Entity, results: Results): Promise<void> {
    if (!EntityIsCard(entity)) return;
    const entries = await entity.read();
    const result = await results.get(entity);
    const text = (entries.get('text') as any)[0].content;
    if (text !== '-') result.target.text = text;
  }
}

export class RuleFlavor implements Rule {
  public async process(entity: Entity, results: Results): Promise<void> {
    if (!EntityIsCard(entity)) return;
    const entries = await entity.read();
    const result = await results.get(entity);
    const flavor = (entries.get('flavor') as any)[0].content;
    if (flavor !== '-') result.target.flavor = flavor;
  }
}
