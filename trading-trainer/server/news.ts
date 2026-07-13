/**
 * News-Feed: kostenlose RSS-Quellen (kein API-Key nötig).
 * Ohne Internet gibt es kuratierte Lern-Meldungen als Fallback,
 * klar als Offline-Inhalt gekennzeichnet.
 */

export interface NewsItem {
  title: string;
  link: string;
  source: string;
  publishedAt: string;
  offline?: boolean;
}

const FEEDS: Array<{ url: string; source: string }> = [
  { url: 'https://www.tagesschau.de/wirtschaft/index~rss2.xml', source: 'tagesschau Wirtschaft' },
  { url: 'https://www.coindesk.com/arc/outboundfeeds/rss/', source: 'CoinDesk' },
];

const FALLBACK: NewsItem[] = [
  {
    title: 'Offline-Modus: Keine Internetverbindung — hier ein Lern-Impuls statt News.',
    link: '#',
    source: 'Trading Trainer',
    publishedAt: new Date().toISOString(),
    offline: true,
  },
  {
    title: 'Wusstest du? Über 70 % der Privatanleger verlieren mit CFDs Geld — Risikomanagement ist kein Optional.',
    link: '#',
    source: 'Lernbereich',
    publishedAt: new Date().toISOString(),
    offline: true,
  },
  {
    title: 'Regel Nr. 1: Positionsgröße vor Einstieg berechnen. Wer das Risiko nicht kennt, kennt seinen Trade nicht.',
    link: '#',
    source: 'Lernbereich',
    publishedAt: new Date().toISOString(),
    offline: true,
  },
  {
    title: 'Ein Trading-Journal schlägt jede Intuition: Muster erkennt man erst in der Rückschau.',
    link: '#',
    source: 'Lernbereich',
    publishedAt: new Date().toISOString(),
    offline: true,
  },
  {
    title: 'Hebel vergrößert nicht deine Chancen — er vergrößert deine Fehler. Erst ohne Hebel konstant werden.',
    link: '#',
    source: 'Lernbereich',
    publishedAt: new Date().toISOString(),
    offline: true,
  },
];

let cache: { at: number; items: NewsItem[] } | null = null;

function decodeEntities(s: string): string {
  return s
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&auml;/g, 'ä')
    .replace(/&ouml;/g, 'ö')
    .replace(/&uuml;/g, 'ü')
    .replace(/&szlig;/g, 'ß')
    .trim();
}

function parseRss(xml: string, source: string): NewsItem[] {
  const items: NewsItem[] = [];
  const itemBlocks = xml.match(/<item[\s>][\s\S]*?<\/item>/g) ?? [];
  for (const block of itemBlocks.slice(0, 8)) {
    const title = block.match(/<title[^>]*>([\s\S]*?)<\/title>/)?.[1];
    const link = block.match(/<link[^>]*>([\s\S]*?)<\/link>/)?.[1];
    const pub = block.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/)?.[1];
    if (!title) continue;
    items.push({
      title: decodeEntities(title),
      link: link ? decodeEntities(link) : '#',
      source,
      publishedAt: pub ? new Date(pub.trim()).toISOString() : new Date().toISOString(),
    });
  }
  return items;
}

export async function getNews(): Promise<NewsItem[]> {
  if (cache && Date.now() - cache.at < 5 * 60 * 1000) return cache.items;

  const results = await Promise.all(
    FEEDS.map(async (feed) => {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 5000);
      try {
        const res = await fetch(feed.url, {
          signal: ctrl.signal,
          headers: { 'user-agent': 'trading-trainer-local/1.0' },
        });
        if (!res.ok) return [];
        return parseRss(await res.text(), feed.source);
      } catch {
        return [];
      } finally {
        clearTimeout(timer);
      }
    })
  );

  const merged = results
    .flat()
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 12);

  const items = merged.length > 0 ? merged : FALLBACK;
  cache = { at: Date.now(), items };
  return items;
}
