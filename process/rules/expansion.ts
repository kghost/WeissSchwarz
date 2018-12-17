import { Rule, EntityIsCard } from './rule';
import { Entity, EntityCard, EntityExpansion } from '../../store';
import { Results } from '../index';

export class RuleExpansion implements Rule {
  public async process(entity: Entity, results: Results): Promise<void> {
    if (!EntityIsCard(entity)) return;
    const e = entity as EntityCard;
    const result = await results.get(new EntityExpansion(e.title, e.exp));
    const entries = await entity.read();

    if (!result.target.cards) result.target.cards = [];
    const cards = result.target.cards as string[];
    if (!cards.includes(e.card)) cards.push(e.card);

    const cardType = (entries.get('type') as any)[0].content;
    if (cardType === 'Climax') {
      if (!result.target.climax) result.target.climax = [];
      const climax = result.target.climax as any;
      if (!climax.includes(e.card)) climax.push(e.card);
    } else {
      if (!result.target.levels) result.target.levels = [];
      const levels = result.target.levels as any;
      const cardLevel = (entries.get('level') as any)[0].content;
      if (!levels[cardLevel]) levels[cardLevel] = [];
      if (!levels[cardLevel].includes(e.card)) levels[cardLevel].push(e.card);
    }
  }
}
