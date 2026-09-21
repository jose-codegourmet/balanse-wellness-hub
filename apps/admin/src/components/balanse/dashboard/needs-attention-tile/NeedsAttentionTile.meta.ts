export type NeedsAttentionItem = {
  id: string;
  href: string;
  title: string;
  count: number;
  waitingLabel: string;
  clearLabel: string;
};

export type NeedsAttentionTileProps = {
  items: NeedsAttentionItem[];
};
