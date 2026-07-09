import { prisma } from "../config/prisma";
import { createStageNotificationsForFollowers } from "./notification.service";

type JsonPrimitive = string | number | boolean;
type JsonObject = { [key: string]: JsonValue | null };
type JsonArray = Array<JsonValue | null>;
type JsonValue = JsonPrimitive | JsonObject | JsonArray;

export type NormalizedBillStageInput = {
  stage: string;
  house?: string;
  stageDate?: Date;
  description?: string;
  sourceUrl?: string;
};

export type NormalizedBillVersionInput = {
  versionLabel: string;
  versionDate?: Date;
  pdfUrl?: string;
  textContent?: string;
  source: string;
  rawSourceData?: JsonValue;
};

export type NormalizedBillInput = {
  title: string;
  shortTitle?: string;
  billNumber?: string;
  year?: number;
  house?: string;
  ministry?: string;
  status?: string;
  introducedDate?: Date;
  source: string;
  sourceUrl: string;
  rawSourceData?: JsonValue;
  stages?: NormalizedBillStageInput[];
  versions?: NormalizedBillVersionInput[];
};

export async function ingestBill(input: NormalizedBillInput) {
  const bill = await prisma.bill.upsert({
    where: {
      source_sourceUrl: {
        source: input.source,
        sourceUrl: input.sourceUrl,
      },
    },
    create: {
      title: input.title,
      shortTitle: input.shortTitle,
      billNumber: input.billNumber,
      year: input.year,
      house: input.house,
      ministry: input.ministry,
      status: input.status,
      introducedDate: input.introducedDate,
      source: input.source,
      sourceUrl: input.sourceUrl,
      rawSourceData: input.rawSourceData,
    },
    update: {
      title: input.title,
      shortTitle: input.shortTitle,
      billNumber: input.billNumber,
      year: input.year,
      house: input.house,
      ministry: input.ministry,
      status: input.status,
      introducedDate: input.introducedDate,
      rawSourceData: input.rawSourceData,
    },
  });

  if (input.stages?.length) {
    for (const stage of input.stages) {
      // apps/api/src/services/bill-ingestion.service.ts
      const existingStage = await prisma.billStage.findFirst({
        where: {
          billId: bill.id,
          stage: stage.stage,
          stageDate: stage.stageDate ?? null,
        },
        select: { id: true },
      });

      const savedStage = existingStage
        ? await prisma.billStage.update({
            where: { id: existingStage.id },
            data: {
              house: stage.house,
              description: stage.description,
              sourceUrl: stage.sourceUrl,
            },
          })
        : await prisma.billStage.create({
            data: {
              billId: bill.id,
              stage: stage.stage,
              house: stage.house,
              stageDate: stage.stageDate,
              description: stage.description,
              sourceUrl: stage.sourceUrl,
            },
          });

      if (!existingStage) {
        await createStageNotificationsForFollowers({
          billId: bill.id,
          billStageId: savedStage.id,
        });
      }
    }
  }

  if (input.versions?.length) {
    for (const version of input.versions) {
      await prisma.billVersion.upsert({
        where: {
          billId_versionLabel: {
            billId: bill.id,
            versionLabel: version.versionLabel,
          },
        },
        create: {
          billId: bill.id,
          versionLabel: version.versionLabel,
          versionDate: version.versionDate,
          pdfUrl: version.pdfUrl,
          textContent: version.textContent,
          source: version.source,
          rawSourceData: version.rawSourceData,
        },
        update: {
          versionDate: version.versionDate,
          pdfUrl: version.pdfUrl,
          textContent: version.textContent,
          rawSourceData: version.rawSourceData,
        },
      });
    }
  }

  return bill;
}
