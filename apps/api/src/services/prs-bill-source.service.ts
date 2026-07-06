import * as cheerio from "cheerio";

const PRS_BILLTRACK_URL = "https://prsindia.org/billtrack";

function normalizeUrlForCompare(url: string) {
  return url.replace(/\/$/, "");
}

export type PrsBillListItem = {
  title: string;
  status?: string;
  sourceUrl: string;
  year?: number;
};

export type PrsBillStage = {
  stage: string;
  house?: string;
  stageDate?: Date;
};

export type PrsBillDocumentLink = {
  label: string;
  url: string;
};

export type PrsBillDetail = {
  title?: string;
  ministry?: string;
  stages: PrsBillStage[];
  documentLinks: PrsBillDocumentLink[];
  summaryText?: string;
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

function getBodyLines(html: string) {
  const $ = cheerio.load(html);

  return $("body").text().split("\n").map(cleanText).filter(Boolean);
}

function parsePrsDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  return date;
}

function isStageLabel(value: string) {
  return [
    "Introduced",
    "Passed",
    "Withdrawn",
    "In Committee",
    "Report",
    "Lapsed",
    "Draft",
    "Ordinance: In force",
    "Negatived",
  ].includes(value);
}

function isTimelineStopLine(value: string) {
  return [
    "Highlights of the Bill",
    "Key Issues and Analysis",
    "Relevant Links",
    "DISCLAIMER:",
    "PART A:",
  ].some((marker) => value.startsWith(marker));
}

function extractMinistry(lines: string[]) {
  const ministryIndex = lines.findIndex((line) => line === "Ministry:");

  if (ministryIndex === -1) {
    return undefined;
  }

  return lines[ministryIndex + 1];
}

function extractStages(lines: string[]): PrsBillStage[] {
  const stages: PrsBillStage[] = [];
  const ministryIndex = lines.findIndex((line) => line === "Ministry:");
  const startIndex = ministryIndex === -1 ? 0 : ministryIndex + 2;

  for (let index = startIndex; index < lines.length; index += 1) {
    const line = lines[index];

    if (isTimelineStopLine(line)) {
      break;
    }

    if (!isStageLabel(line)) {
      continue;
    }

    const house = lines[index + 1];
    const dateText = lines[index + 2];
    const stageDate = dateText ? parsePrsDate(dateText) : undefined;

    stages.push({
      stage: line,
      house,
      stageDate,
    });

    index += 2;
  }

  return stages;
}

function extractSummaryText(lines: string[]) {
  const startIndex = lines.findIndex(
    (line) =>
      line === "Highlights of the Bill" || line === "Key Issues and Analysis",
  );

  if (startIndex === -1) {
    return undefined;
  }

  const summaryLines: string[] = [];

  for (let index = startIndex; index < lines.length; index += 1) {
    const line = lines[index];

    if (line === "Relevant Links" || line.startsWith("DISCLAIMER:")) {
      break;
    }

    summaryLines.push(line);
  }

  return summaryLines.join("\n");
}

function extractDocumentLinks(
  html: string,
  sourceUrl: string,
): PrsBillDocumentLink[] {
  const $ = cheerio.load(html);
  const links: PrsBillDocumentLink[] = [];

  $("a[href]").each((_index, element) => {
    const link = $(element);
    const label = cleanText(link.text());
    const href = link.attr("href");

    if (!href || !label) {
      return;
    }

    const absoluteUrl = new URL(href, sourceUrl).toString();
    const lowerUrl = absoluteUrl.toLowerCase();

    if (!lowerUrl.includes(".pdf")) {
      return;
    }

    links.push({
      label,
      url: absoluteUrl,
    });
  });

  return links;
}

async function fetchWithTimeout(url: string, timeoutMs = 15000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchPrsBillList(limit = 10): Promise<PrsBillListItem[]> {
  const response = await fetchWithTimeout(PRS_BILLTRACK_URL);

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
    if (!/\b(19|20)\d{2}\b/.test(title)) {
      return;
    }
    const href = link.attr("href");

    if (!title || !href) {
      return;
    }

    if (title.length < 8) {
      return;
    }

    const sourceUrl = absolutePrsUrl(href);

    const normalizedSourceUrl = normalizeUrlForCompare(sourceUrl);
    const normalizedBilltrackUrl = normalizeUrlForCompare(PRS_BILLTRACK_URL);

    if (normalizedSourceUrl === normalizedBilltrackUrl) {
      return;
    }

    if (title === "Bills Parliament" || title === "Bills & Acts") {
      return;
    }

    const pathname = new URL(sourceUrl).pathname;

    if (!/\/billtrack\/[a-z0-9-]+-\d{4}$/i.test(pathname)) {
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

export async function fetchPrsBillDetail(
  sourceUrl: string,
): Promise<PrsBillDetail> {
  const response = await fetchWithTimeout(sourceUrl);

  if (!response.ok) {
    throw new Error(`Failed to fetch PRS bill detail page: ${response.status}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);
  const lines = getBodyLines(html);

  const title = cleanText($("h1, h2").first().text()) || undefined;
  const ministry = extractMinistry(lines);
  const stages = extractStages(lines);
  const documentLinks = extractDocumentLinks(html, sourceUrl);
  const summaryText = extractSummaryText(lines);

  return {
    title,
    ministry,
    stages,
    documentLinks,
    summaryText,
  };
}
