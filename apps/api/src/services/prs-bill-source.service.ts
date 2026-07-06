import * as cheerio from "cheerio";

const PRS_BILLTRACK_URL = "https://prsindia.org/billtrack";

export type PrsBillListItem = {
  title: string;
  status?: string;
  sourceUrl: string;
  year?: number;
};

function absolutePrsUrl(href: string) {
  return new URL(href, PRS_BILLTRACK_URL).toString();
}

function extractYearFromTitle(title: string) {
  const match = title.match(/\b(19|20)\d{2}\b/);
  return match ? Number(match[0]) : undefined;
}

function cleanText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export async function fetchPrsBillList(limit = 10): Promise<PrsBillListItem[]> {
  const response = await fetch(PRS_BILLTRACK_URL);

  if (!response.ok) {
    throw new Error(`Failed to fetch PRS billtrack page: ${response.status}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  const bills: PrsBillListItem[] = [];

  $("a[href*='/billtrack/']").each((_index, element) => {
    if (bills.length >= limit) {
      return false;
    }

    const link = $(element);
    const title = cleanText(link.text());
    const href = link.attr("href");

    if (!title || !href) {
      return;
    }

    if (title.length < 8) {
      return;
    }

    const sourceUrl = absolutePrsUrl(href);

    if (sourceUrl === PRS_BILLTRACK_URL) {
      return;
    }

    const parentText = cleanText(link.parent().text());
    const statusText = parentText.replace(title, "").trim();

    bills.push({
      title,
      status: statusText || undefined,
      sourceUrl,
      year: extractYearFromTitle(title),
    });
  });

  return bills;
}