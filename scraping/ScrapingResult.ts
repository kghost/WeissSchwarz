import { Entity } from '../store';
import { Entry, Language } from '../store/dao';
import { Source } from '../store/Source';
import { SourceInfo } from '../store/SourceInfo';

export class ScrapingResult {
  public source?: Source;
  public language?: Language;
  public results?: Map<Entity, Entry[]>;
  public follows?: SourceInfo[];
}
