// What sample bills should I send into the ingestion service?

// service = knows how to save one bill
// job = chooses which bills to save and runs the service


import { prisma } from "../config/prisma";
import { ingestBill, type NormalizedBillInput } from "../services/bill-ingestion.service";

const seedBills: NormalizedBillInput[] = [
  {
    title: "The Bharatiya Nyaya Sanhita, 2023",
    shortTitle: "Bharatiya Nyaya Sanhita",
    billNumber: "121 of 2023",
    year: 2023,
    house: "Lok Sabha",
    ministry: "Ministry of Home Affairs",
    status: "Passed",
    introducedDate: new Date("2023-08-11"),
    source: "manual-seed",
    sourceUrl: "https://sansad.in/ls/legislation/bills",
    rawSourceData: {
      note: "Initial manually curated seed record for development",
    },
    stages: [
      {
        stage: "Introduced",
        house: "Lok Sabha",
        stageDate: new Date("2023-08-11"),
        description: "Introduced in Lok Sabha",
        sourceUrl: "https://sansad.in/ls/legislation/bills",
      },
      {
        stage: "Passed",
        house: "Lok Sabha",
        stageDate: new Date("2023-12-20"),
        description: "Passed by Lok Sabha",
        sourceUrl: "https://sansad.in/ls/legislation/bills",
      },
      {
        stage: "Passed",
        house: "Rajya Sabha",
        stageDate: new Date("2023-12-21"),
        description: "Passed by Rajya Sabha",
        sourceUrl: "https://sansad.in/ls/legislation/bills",
      },
    ],
    versions: [
      {
        versionLabel: "Introduced",
        versionDate: new Date("2023-08-11"),
        source: "manual-seed",
        pdfUrl: "https://sansad.in/ls/legislation/bills",
        rawSourceData: {
          note: "PDF URL placeholder to be replaced by official bill PDF later",
        },
      },
    ],
  },
  {
    title: "The Bharatiya Nagarik Suraksha Sanhita, 2023",
    shortTitle: "Bharatiya Nagarik Suraksha Sanhita",
    billNumber: "122 of 2023",
    year: 2023,
    house: "Lok Sabha",
    ministry: "Ministry of Home Affairs",
    status: "Passed",
    introducedDate: new Date("2023-08-11"),
    source: "manual-seed",
    sourceUrl: "https://prsindia.org/billtrack/the-bharatiya-nagarik-suraksha-sanhita-2023",
    rawSourceData: {
      note: "Initial manually curated seed record for development",
    },
    stages: [
      {
        stage: "Introduced",
        house: "Lok Sabha",
        stageDate: new Date("2023-08-11"),
        description: "Introduced in Lok Sabha",
        sourceUrl: "https://prsindia.org/billtrack/the-bharatiya-nagarik-suraksha-sanhita-2023",
      },
      {
        stage: "Passed",
        house: "Lok Sabha",
        stageDate: new Date("2023-12-20"),
        description: "Passed by Lok Sabha",
        sourceUrl: "https://prsindia.org/billtrack/the-bharatiya-nagarik-suraksha-sanhita-2023",
      },
      {
        stage: "Passed",
        house: "Rajya Sabha",
        stageDate: new Date("2023-12-21"),
        description: "Passed by Rajya Sabha",
        sourceUrl: "https://prsindia.org/billtrack/the-bharatiya-nagarik-suraksha-sanhita-2023",
      },
    ],
    versions: [
      {
        versionLabel: "Introduced",
        versionDate: new Date("2023-08-11"),
        source: "manual-seed",
        pdfUrl: "https://prsindia.org/billtrack/the-bharatiya-nagarik-suraksha-sanhita-2023",
      },
    ],
  },
];

async function main() {
  console.log(`Starting bill seed job for ${seedBills.length} bills`);

  for (const billInput of seedBills) {
    const bill = await ingestBill(billInput);
    console.log(`Seeded bill: ${bill.title}`);
  }

  console.log("Bill seed job complete");
}

main()
  .catch((error) => {
    console.error("Bill seed job failed", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });