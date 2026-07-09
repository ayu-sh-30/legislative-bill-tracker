// apps/api/src/jobs/seed-demo-diff-bill.ts
import { prisma } from "../config/prisma";
import { ingestBill } from "../services/bill-ingestion.service";

const introducedText = `
Clause 1. Short title and commencement.
This Act may be called the Demo Water Security Bill, 2026.

Clause 2. Definitions.
In this Act, "urban water body" means a lake, pond, canal, wetland, or reservoir located within a municipal area.

Clause 3. Public register.
Every municipal authority shall maintain a public register of urban water bodies under its jurisdiction.

Clause 4. Annual inspection.
Every municipal authority shall conduct one inspection of each registered urban water body every year.

Clause 5. Reporting.
The municipal authority shall publish an annual report on the condition of registered urban water bodies.
`;

const amendedText = `
Clause 1. Short title and commencement.
This Act may be called the Demo Urban Water Security Bill, 2026.

Clause 2. Definitions.
In this Act, "urban water body" means a lake, pond, canal, wetland, reservoir, or storm-water retention area located within a municipal area.

Clause 3. Public register.
Every municipal authority shall maintain a digital public register of urban water bodies under its jurisdiction and update it at least once every six months.

Clause 4. Annual inspection.
Every municipal authority shall conduct two inspections of each registered urban water body every year, including one inspection before the monsoon season.

Clause 5. Reporting.
The municipal authority shall publish an annual report on the condition of registered urban water bodies and include restoration actions taken during the year.

Clause 6. Citizen complaints.
A resident may submit a complaint regarding pollution, encroachment, or obstruction affecting a registered urban water body.
`;

async function main() {
  const bill = await ingestBill({
    title: "Demo Urban Water Security Bill, 2026",
    shortTitle: "Demo Water Security Bill",
    billNumber: "Demo 1 of 2026",
    year: 2026,
    house: "Lok Sabha",
    ministry: "Demo Ministry of Water Resources",
    status: "Demo data",
    introducedDate: new Date("2026-01-15"),
    source: "demo",
    sourceUrl: "demo://urban-water-security-bill-2026",
    rawSourceData: {
      note: "Demo bill for testing deterministic diff and AI summary flows.",
      officialRecord: false,
    },
    stages: [
      {
        stage: "Introduced",
        house: "Lok Sabha",
        stageDate: new Date("2026-01-15"),
        description: "Demo bill introduced for local testing.",
        sourceUrl: "demo://urban-water-security-bill-2026",
      },
      {
        stage: "Committee amendment",
        house: "Lok Sabha",
        stageDate: new Date("2026-02-20"),
        description: "Demo amended version prepared for AI summary testing.",
        sourceUrl: "demo://urban-water-security-bill-2026/amended",
      },
    ],
    versions: [
      {
        versionLabel: "Introduced version",
        versionDate: new Date("2026-01-15"),
        source: "demo",
        textContent: introducedText.trim(),
        rawSourceData: {
          note: "Demo introduced text.",
        },
      },
      {
        versionLabel: "Committee amendment version",
        versionDate: new Date("2026-02-20"),
        source: "demo",
        textContent: amendedText.trim(),
        rawSourceData: {
          note: "Demo amended text.",
        },
      },
    ],
  });

  console.log(`Seeded demo diff bill: ${bill.title}`);
  console.log(`Bill id: ${bill.id}`);
}

main()
  .catch((error) => {
    console.error("Failed to seed demo diff bill");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });