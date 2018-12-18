import { Rule, EntityIsCard } from './rule';
import { Entity, EntityRoot, EntityCard } from '../../store';
import { Results } from '../index';
import { Entry } from '../../store/dao';
import './utils';

const titles = {
  MG: ['BM', 'MG', 'NM'],
  FS: ['FH', 'FS', 'FU', 'FZ'],
  MB: ['KK', 'MB'],
  MK: ['MK', 'MK2'],
  P3: ['P3', 'P4', 'P5', 'PQ'],
  SE: ['SE', 'SF', 'SR'],
  DC: ['DC', 'DC3', 'DS'],
  ID: ['ID', 'RG'],
  LB: ['KW', 'LB'],
  MH: ['MH', 'SK'],
  MM: ['MM', 'MR'],
  NA: ['N1', 'N2', 'NA', 'NR', 'NS', 'NV'],
};

const lookup = {};
for (const [k, vs] of Object.entries(titles)) {
  for (const v of vs) (lookup as any)[v] = k;
}

export class RuleTitles implements Rule {
  public async process(entity: Entity, results: Results): Promise<void> {
    if (!EntityIsCard(entity)) return;

    const e = entity as EntityCard;
    const entries = await entity.read();
    const title = (entries.get('title') as Entry[])[0].content as string;
    if (title.length === 0) return;
    const side = (entries.get('side') as Entry[])[0].content as string;

    const result = await results.get(new EntityRoot());
    result.target.titles = titles;
    const t = result.target
      .withDefault('sides', {})
      .withDefault(side, {})
      .withConst(lookup.withDefault(e.title, e.title), title);
  }
}
