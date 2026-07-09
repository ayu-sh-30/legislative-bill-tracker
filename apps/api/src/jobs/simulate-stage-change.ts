import { prisma } from "../config/prisma";
import { createStageNotificationsForFollowers } from "../services/notification.service";

async function main() {
  const bill = await prisma.bill.findFirst({
    where: {
      source: "demo",
      sourceUrl: "demo://urban-water-security-bill-2026",
    },
    select: {
      id: true,
      title: true,
    },
  });

  if (!bill) {
    throw new Error("Demo bill not found. Run npm.cmd run db:seed:demo-diff first.");
  }

  const timestamp = new Date();
  const suffix = timestamp.toISOString().replace(/[:.]/g, "-");

  const stage = await prisma.billStage.create({
    data: {
      billId: bill.id,
      stage: `Demo stage update ${suffix}`,
      house: "Lok Sabha",
      stageDate: timestamp,
      description: "Local test stage change for notification UI.",
      sourceUrl: `demo://urban-water-security-bill-2026/stage-${suffix}`,
    },
  });

  const result = await createStageNotificationsForFollowers({
    billId: bill.id,
    billStageId: stage.id,
  });

  console.log(`Created stage for: ${bill.title}`);
  console.log(`Stage id: ${stage.id}`);
  console.log(`Notifications created: ${result.created}`);
}

main()
  .catch((error) => {
    console.error("Failed to simulate stage change");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });