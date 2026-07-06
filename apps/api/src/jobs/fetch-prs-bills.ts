import { prisma } from "../config/prisma";
import { ingestBill, type NormalizedBillInput } from "../services/bill-ingestion.service";
import {
  fetchPrsBillDetail,
  fetchPrsBillList,
  type PrsBillDetail,
} from "../services/prs-bill-source.service";

function toJsonSafeDetail(detail?: PrsBillDetail) {
  if (!detail) {
    return null;
  }

  return {
    title: detail.title ?? null,
    ministry: detail.ministry ?? null,
    summaryText: detail.summaryText ?? null,
    documentLinks: detail.documentLinks.map((link) => ({
      label: link.label,
      url: link.url,
    })),
    stages: detail.stages.map((stage) => ({
      stage: stage.stage,
      house: stage.house ?? null,
      stageDate: stage.stageDate ? stage.stageDate.toISOString() : null,
    })),
  };
}

function toNormalizedBillInput(
  item: {
    title: string;
    status?: string;
    sourceUrl: string;
    year?: number;
  },
  detail?: PrsBillDetail
): NormalizedBillInput {
  const documentVersions =
    detail?.documentLinks.map((link) => ({
      versionLabel: link.label,
      pdfUrl: link.url,
      source: "prs",
      rawSourceData: {
        source: "prs",
        sourceUrl: item.sourceUrl,
        documentLabel: link.label,
      },
    })) ?? [];

  const detailStages =
    detail?.stages.map((stage) => ({
      stage: stage.stage,
      house: stage.house,
      stageDate: stage.stageDate,
      description: `PRS listed stage: ${stage.stage}`,
      sourceUrl: item.sourceUrl,
    })) ?? [];

  return {
    title: detail?.title ?? item.title,
    year: item.year,
    ministry: detail?.ministry,
    status: item.status,
    source: "prs",
    sourceUrl: item.sourceUrl,
    rawSourceData: {
      source: "prs",
      sourceUrl: item.sourceUrl,
      scrapedAt: new Date().toISOString(),
      listingStatus: item.status ?? null,
      detaildetail: toJsonSafeDetail(detail),
    },
    stages:
      detailStages.length > 0
        ? detailStages
        : item.status
          ? [
              {
                stage: item.status,
                description: `PRS listed status: ${item.status}`,
                sourceUrl: item.sourceUrl,
              },
            ]
          : [],
    versions: documentVersions,
  };
}

async function main() {
  const limit = Number(process.env.PRS_FETCH_LIMIT ?? 10);

  console.log(`Fetching up to ${limit} bills from PRS`);

  const prsBills = await fetchPrsBillList(limit);

  console.log(`Found ${prsBills.length} PRS bills`);

  for (const item of prsBills) {
  console.log(`Fetching detail: ${item.title}`);

  let detail: PrsBillDetail | undefined;

  try {
    detail = await fetchPrsBillDetail(item.sourceUrl);
  } catch (error) {
    console.warn(
      `Could not fetch detail for ${item.title}`,
      error instanceof Error ? error.message : error
    );
  }

  const billInput = toNormalizedBillInput(item, detail);
  const bill = await ingestBill(billInput);

  console.log(`Ingested PRS bill: ${bill.title}`);
}

  console.log("PRS bill fetch job complete");
}

main()
  .catch((error) => {
    console.error("PRS bill fetch job failed", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });