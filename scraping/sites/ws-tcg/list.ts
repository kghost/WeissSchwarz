import { ScrapingResult, ScrapingSource } from '../../ScrapingResult';
import { ScrapingSite } from '../Site';
import { Entity, EntityCardFromNo } from '../../../store';
import { Tag, SourceInfo, Source } from '../../../store/source';
import { Entry, Language } from '../../../store/dao';
import { getCardType } from './common';

export default new class extends ScrapingSite<void, any> {
  public readonly match = /^https:\/\/ws-tcg\.com\/cardlist\/search\?.*$/;

  protected fetch(u: void): any {
    // links
    const next = Array.from(
      document.querySelectorAll('#searchResults > p.pager > span.next > a')
    ).map((e) => (e as HTMLAnchorElement).href);

    // data
    const img2Trigger: any = {
      SOUL: 'Soul',
      STOCK: 'Pool',
      SALVAGE: 'ComeBack',
      BOUNCE: 'Return',
      DRAW: 'Draw',
      TREASURE: 'Treasure',
      SHOT: 'Shot',
      GATE: 'Gate',
    };

    function imgName(url: string) {
      return (url.split('/').pop() as string).split('.')[0].toUpperCase();
    }

    const textTrans = (node: HTMLSpanElement) => {
      Array.from(node.querySelectorAll('img')).map((i) => {
        const name = imgName(i.src);
        const trigger = img2Trigger[name];
        if (trigger !== undefined) i.replaceWith(`[TRIGGER:${trigger}]`);
        else i.replaceWith(`[IMG:name]`);
      });
      return node.innerText;
    };

    const cards = Array.from(
      document.querySelectorAll('#searchResults > div > table > tbody > tr')
    ).map((e) => {
      return {
        no: (e.querySelector(
          'td > h4 > a > span:nth-child(2)'
        ) as HTMLSpanElement).innerText,
        link: (e.querySelector('td > h4 > a') as HTMLAnchorElement).href,
        name: (e.querySelector(
          'td > h4 > a > span:nth-child(1)'
        ) as HTMLSpanElement).innerText,
        title: ((e.querySelector('td > h4') as HTMLHeadingElement).childNodes[1]
          .textContent as string).replace(/^ -/, ''),
        side: imgName(
          (e.querySelector('td > span:nth-child(2) > img') as HTMLImageElement)
            .src
        ),
        type: (e.querySelector(
          'td > span:nth-child(3)'
        ) as HTMLSpanElement).innerText.replace(/^種類：/, ''),
        level: parseInt(
          (e.querySelector(
            'td > span:nth-child(4)'
          ) as HTMLSpanElement).innerText.replace(/^レベル：/, ''),
          10
        ),
        color: imgName(
          (e.querySelector('td > span:nth-child(6) > img') as HTMLImageElement)
            .src
        ),
        power: parseInt(
          (e.querySelector(
            'td > span:nth-child(7)'
          ) as HTMLSpanElement).innerText.replace(/^パワー：/, ''),
          10
        ),
        soul: Array.from(
          e.querySelectorAll('td > span:nth-child(8) > img')
        ).map((e2) => imgName((e2 as HTMLImageElement).src)).length,
        cost: parseInt(
          (e.querySelector(
            'td > span:nth-child(9)'
          ) as HTMLSpanElement).innerText.replace(/^コスト：/, ''),
          10
        ),
        rarity: (e.querySelector(
          'td > span:nth-child(11)'
        ) as HTMLSpanElement).innerText.replace(/^レアリティ：/, ''),
        trigger: Array.from(
          e.querySelectorAll('td > span:nth-child(12) > img')
        ).map((e2) => imgName((e2 as HTMLImageElement).src)),
        trait: (e.querySelector(
          'td > span:nth-child(13) > span'
        ) as HTMLSpanElement).innerText.split(/・/),
        flavor: (e.querySelector(
          'td > span:nth-child(15)'
        ) as HTMLSpanElement).innerText.replace(/^フレーバー：/, ''),
        text: textTrans(e.querySelector(
          'td > span:nth-child(18)'
        ) as HTMLSpanElement),
      };
    });

    return { next, cards };
  }

  protected async afterFetch(
    source: Source,
    { next, cards }: any
  ): Promise<ScrapingResult> {
    const results = new Map<Entity, Entry[]>();
    cards.map((e: any) => {
      e.type = getCardType(e.type);
      results.set(
        EntityCardFromNo(e.no),
        Object.entries(e)
          .filter(([k, v]) => k !== 'link')
          .map(([k, v]) => {
            return new Entry(k, v, [source]);
          })
      );
    });
    return {
      language: Language.japanese,
      follows: [
        ...next.map((x: string) => {
          const u = new URL(x);
          u.searchParams.set('show_page_count', '100');
          return new SourceInfo(new ScrapingSource(u.toString()), [
            new Tag('list'),
          ]);
        }),
        ...cards.map((o: any) => {
          return new SourceInfo(new ScrapingSource(o.link), [
            new Tag('card', { id: o.no }),
          ]);
        }),
      ],
      results,
    };
  }
}();
