"use server";

import { XMLParser } from "fast-xml-parser";

export interface NewsItem {
  title: string;
  description: string;
  link: string;
  date: string;
  pubDate: Date;
}

interface RSSItem {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  guid?: string;
}

interface RSSChannel {
  title: string;
  link: string;
  description: string;
  item: RSSItem | RSSItem[];
}

interface RSSFeed {
  rss: {
    channel: RSSChannel;
  };
}

// Decode HTML entities (e.g., &#305; → ı)
function decodeHtmlEntities(text: string): string {
  if (!text) return "";
  
  // Decode numeric HTML entities (&#xxx;)
  let decoded = text.replace(/&#(\d+);/g, (_, num) => {
    return String.fromCharCode(parseInt(num, 10));
  });
  
  // Decode hex HTML entities (&#xXXX;)
  decoded = decoded.replace(/&#x([0-9A-Fa-f]+);/g, (_, hex) => {
    return String.fromCharCode(parseInt(hex, 16));
  });
  
  // Decode common named entities
  const entities: Record<string, string> = {
    "&nbsp;": " ",
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&apos;": "'",
    "&copy;": "©",
    "&reg;": "®",
    "&trade;": "™",
    "&ndash;": "–",
    "&mdash;": "—",
    "&lsquo;": "\u2018",
    "&rsquo;": "\u2019",
    "&ldquo;": "\u201C",
    "&rdquo;": "\u201D",
    "&bull;": "•",
    "&hellip;": "…",
    "&uuml;": "ü",
    "&Uuml;": "Ü",
    "&ouml;": "ö",
    "&Ouml;": "Ö",
    "&ccedil;": "ç",
    "&Ccedil;": "Ç",
    "&scedil;": "ş",
    "&Scedil;": "Ş",
    "&gbreve;": "ğ",
    "&Gbreve;": "Ğ",
  };
  
  for (const [entity, char] of Object.entries(entities)) {
    decoded = decoded.split(entity).join(char);
  }
  
  return decoded;
}

// Strip HTML tags and CDATA from content
function stripHtml(html: string): string {
  if (!html) return "";
  return decodeHtmlEntities(
    html
      .replace(/<!\[CDATA\[/g, "")
      .replace(/\]\]>/g, "")
      .replace(/<[^>]*>/g, "")
      .trim()
  );
}

// Format date to relative time (e.g., "2 saat önce")
// Returns empty string if date is invalid
function formatRelativeTime(date: Date | null): string {
  if (!date || isNaN(date.getTime())) return "";
  
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Az önce";
  if (diffMins < 60) return `${diffMins} dk önce`;
  if (diffHours < 24) return `${diffHours} sa önce`;
  if (diffDays < 7) return `${diffDays} gün önce`;

  return date.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
  });
}

export async function getMidasNews(): Promise<NewsItem[]> {
  try {
    const response = await fetch("https://www.getmidas.com/rss", {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      console.error("Failed to fetch Midas RSS:", response.status);
      return [];
    }

    const xmlText = await response.text();

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
      textNodeName: "#text",
    });

    const result: RSSFeed = parser.parse(xmlText);
    const channel = result.rss?.channel;

    if (!channel) {
      console.error("Invalid RSS structure");
      return [];
    }

    // Ensure items is always an array
    const items = Array.isArray(channel.item)
      ? channel.item
      : channel.item
        ? [channel.item]
        : [];

    const newsItems: NewsItem[] = items.map((item: RSSItem) => {
      const pubDate = new Date(item.pubDate);

      return {
        title: stripHtml(item.title),
        description: stripHtml(item.description),
        link: item.link,
        date: formatRelativeTime(pubDate),
        pubDate,
      };
    });

    // Sort by date (newest first) and limit to 10 items
    return newsItems
      .sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime())
      .slice(0, 10);
  } catch (error) {
    console.error("Error fetching Midas news:", error);
    return [];
  }
}
