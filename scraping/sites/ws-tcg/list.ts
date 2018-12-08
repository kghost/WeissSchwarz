import { ScrapingResult, ScrapingSource } from '../../ScrapingResult';
import { ScrapingSite } from '../Site';
import { Language, Tag } from '../../../store';

export default new class extends ScrapingSite<void, any> {
  public readonly match = /^https:\/\/ws-tcg\.com\/cardlist\/search\?.*$/;

  protected fetch(u: void): any {
    const next = Array.from(
      document.querySelectorAll('#searchResults > p.pager > span.next > a')
    ).map(e => (e as HTMLAnchorElement).href);
    const cards = Array.from(
      document.querySelectorAll(
        '#searchResults > div > table > tbody > tr > td > h4 > a'
      )
    ).map(e => (e as HTMLAnchorElement).href);
    return { next, cards };
  }

  protected async afterFetch({ next, cards }: any): Promise<ScrapingResult> {
    return {
      language: Language.japanese,
      follows: [
        ...next.map((x: string) => {
          const u = new URL(x);
          u.searchParams.set('show_page_count', '100');
          return new ScrapingSource(u.toString(), [new Tag('list')]);
        }),
        ...cards.map((uri: string) => {
          const cardid = new URL(uri).searchParams.get('cardno');
          return new ScrapingSource(uri, [new Tag('card', { id: cardid })]);
        }),
      ],
    };
  }
}();
