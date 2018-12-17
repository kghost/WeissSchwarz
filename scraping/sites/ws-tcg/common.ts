export const CardType: any = {
  Character: {
    alias: new Set(['キャラ']),
  },
  Event: {
    alias: new Set(['イベント']),
  },
  Climax: {
    alias: new Set(['クライマックス']),
  },
};

Object.freeze(CardType);

export function getCardType(alias: string) {
  return (Object.entries(CardType).find(([k, v]) =>
    (v as any).alias.has(alias)
  ) as [string, any])[0];
}
