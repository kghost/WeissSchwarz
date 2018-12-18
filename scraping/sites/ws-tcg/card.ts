import { ScrapingResult } from '../../ScrapingResult';
import { ScrapingSite } from '../Site';
import { Source } from '../../../store/Source';
import { Entity, EntityCardFromNo } from '../../../store';
import { Entry, Language } from '../../../store/dao';
import { SourceInfo } from 'store/SourceInfo';

export default new class extends ScrapingSite<void, any> {
  public readonly match = /^https:\/\/ws-tcg.com\/cardlist\/\?cardno=([a-zA-Z0-9\/_%-]*)(?:&.*)?$/;

  protected fetch(u: void): any {
    return {
      cards: [
        {
          no: (document.querySelector(
            '#cardDetail > table > tbody > tr:nth-child(2) > td:nth-child(2)'
          ) as HTMLElement).innerText,
          product: (document.querySelector(
            '#cardDetail > table > tbody > tr:nth-child(3) > td:nth-child(2)'
          ) as HTMLElement).innerText,
          title: (document.querySelector(
            '#cardDetail > table > tbody > tr:nth-child(4) > td:nth-child(2)'
          ) as HTMLElement).innerText,
          kana: (document.querySelector(
            '#cardDetail > table > tbody > tr.first > td:nth-child(3) > span'
          ) as HTMLElement).innerText,
        },
      ],
    };
  }

  protected async afterFetch(
    source: Source,
    { cards }: any
  ): Promise<ScrapingResult> {
    const results = new Map<Entity, Entry[]>();
    cards.map((e: any) => {
      results.set(
        EntityCardFromNo(e.no),
        Object.entries(e)
          .filter(([k, v]) => k !== 'link' && v !== undefined)
          .map(([k, v]) => {
            return new Entry(k, v, [source]);
          })
      );
    });
    return {
      language: Language.japanese,
      results,
    };
  }
}();
