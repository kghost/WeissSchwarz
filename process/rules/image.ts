import { Rule, EntityIsCard } from './rule';
import { Entity } from '../../store';
import { Results } from '../index';

export class RuleImage implements Rule {
  public async process(entity: Entity, results: Results): Promise<void> {
    if (!EntityIsCard(entity)) return;
    const entries = await entity.read();
    const entry = entries.get('image');
    if (!entry) return;
    const result = await results.get(entity);
    const found = entry.find((e) => result.target.image === e.content.uri);
    if (!found) result.target.image = entry[0].content.uri;
  }
}
