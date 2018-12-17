import {
  serialize,
  deserialize,
  getDefaultModelSchema,
  custom,
} from 'serializr';

import { Source } from './Source';
import { ScrapingSource } from '../scraping/ScrapingSource';

export const SourceSchema = custom(
  (v) => serialize(getDefaultModelSchema(v), v),
  (json: any, _0: any, _1: any, done: (err: any, result: any) => void) => {
    if ((json as Source).type === 'scraping') {
      return deserialize(getDefaultModelSchema(ScrapingSource), json, done);
    }
    throw new Error(`Unknown source type ${json.type}`);
  }
);
