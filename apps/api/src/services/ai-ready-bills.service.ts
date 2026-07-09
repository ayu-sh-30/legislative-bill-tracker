// apps/api/src/services/ai-ready-bills.service.ts
import { prisma } from "../config/prisma";

export async function getAiReadyBills() {
  const textVersions = await prisma.billVersion.findMany({
    where: {
      textContent: {
        not: null,
      },
    },
    select: {
      id: true,
      billId: true,
      versionLabel: true,
      versionDate: true,
      pdfUrl: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: [
      {
        versionDate: "asc",
      },
      {
        createdAt: "asc",
      },
    ],
  });

  const versionsByBillId = new Map<string, typeof textVersions>();

  for (const version of textVersions) {
    const existingVersions = versionsByBillId.get(version.billId) ?? [];
    existingVersions.push(version);
    versionsByBillId.set(version.billId, existingVersions);
  }

  const eligibleBillIds = Array.from(versionsByBillId.entries())
    .filter(([, versions]) => versions.length >= 2)
    .map(([billId]) => billId);

  if (eligibleBillIds.length === 0) {
    return [];
  }

  const bills = await prisma.bill.findMany({
    where: {
      id: {
        in: eligibleBillIds,
      },
    },
    select: {
      id: true,
      title: true,
      shortTitle: true,
      billNumber: true,
      year: true,
      house: true,
      ministry: true,
      status: true,
      introducedDate: true,
      source: true,
      sourceUrl: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: [
      {
        updatedAt: "desc",
      },
    ],
  });

  return bills.map((bill) => {
    const aiReadyVersions = versionsByBillId.get(bill.id) ?? [];

    return {
      ...bill,
      aiReadyVersionCount: aiReadyVersions.length,
      aiReadyVersions,
    };
  });
}