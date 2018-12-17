import { Rule, EntityIsCard } from './rule';
import { Entity, EntityRoot, EntityCard } from '../../store';
import { Results } from '../index';
import { Entry } from '../../store/dao';

export class RuleTitles implements Rule {
  public async process(entity: Entity, results: Results): Promise<void> {
    if (!EntityIsCard(entity)) return;
    const e = entity as EntityCard;
    const entries = await entity.read();
    const title = (entries.get('title') as Entry[])[0].content as string;
    const side = (entries.get('side') as Entry[])[0].content as string;
    const result = await results.get(new EntityRoot());
    if (!result.target.titles) result.target.titles = [];
    if (!result.target.sides) result.target.sides = { W: [], S: [] };
    if (!result.target.names) result.target.names = {};
    const origTitle = result.target.titles as string[];
    const origSides = result.target.sides as any;
    const origNames = result.target.names as any;
    if (!origTitle.includes(e.title)) origTitle.push(e.title);
    if (!origSides[side].includes(e.title)) origSides[side].push(e.title);
    if (!origNames.hasOwnProperty(e.title)) origNames[e.title] = title;
  }
}
