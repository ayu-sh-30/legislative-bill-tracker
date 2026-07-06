import { prisma } from "../config/prisma";
import { ingestBill, type NormalizedBillInput } from "../services/bill-ingestion.service";
import { fetchPrsBillList } from "../services/prs-bill-source.service";

function toNormalizedBillInput(item: {
  title: string;
  status?: string;
  sourceUrl: string;
  year?: number;
}): NormalizedBillInput {
  return {
    title: item.title,
    year: item.year,
    status: item.status,
    source: "prs",
    sourceUrl: item.sourceUrl,
    rawSourceData: {
      source: "prs",
      sourceUrl: item.sourceUrl,
      scrapedAt: new Date().toISOString(),
      listingStatus: item.status ?? null,
    },
    stages: item.status
      ? [
          {
            stage: item.status,
            description: `PRS listed status: ${item.status}`,
            sourceUrl: item.sourceUrl,
          },
        ]
      : [],
  };
}

async function main() {
  const limit = Number(process.env.PRS_FETCH_LIMIT ?? 10);

  console.log(`Fetching up to ${limit} bills from PRS`);

  const prsBills = await fetchPrsBillList(limit);

  console.log(`Found ${prsBills.length} PRS bills`);

  for (const item of prsBills) {
    const billInput = toNormalizedBillInput(item);
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