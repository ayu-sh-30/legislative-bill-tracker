import { prisma } from "../config/prisma";
import { AppError } from "../middleware/error.middleware";

export async function createStageNotificationsForFollowers(input: {
  billId: string;
  billStageId: string;
}) {
  const [bill, stage, follows] = await Promise.all([
    prisma.bill.findUnique({
      where: { id: input.billId },
      select: { id: true, title: true },
    }),
    prisma.billStage.findUnique({
      where: { id: input.billStageId },
      select: {
        id: true,
        stage: true,
        house: true,
        stageDate: true,
        description: true,
      },
    }),
    prisma.follow.findMany({
      where: { billId: input.billId },
      select: { userId: true },
    }),
  ]);

  if (!bill || !stage || follows.length === 0) {
    return { created: 0 };
  }

  const stageDate = stage.stageDate
    ? ` on ${stage.stageDate.toISOString().slice(0, 10)}`
    : "";

  const house = stage.house ? ` in ${stage.house}` : "";

  const message = `${stage.stage}${house}${stageDate}. ${
    stage.description ?? ""
  }`.trim();

  const result = await prisma.notification.createMany({
    data: follows.map((follow) => ({
      userId: follow.userId,
      billId: bill.id,
      billStageId: stage.id,
      type: "stage_change",
      title: `Stage update: ${bill.title}`,
      message,
    })),
    skipDuplicates: true,
  });

  return { created: result.count };
}

export async function getNotificationsForUser(userId: string) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      bill: {
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
      },
      billStage: true,
    },
  });
}

export async function markNotificationAsRead(userId: string, notificationId: string) {
  const notification = await prisma.notification.findFirst({
    where: {
      id: notificationId,
      userId,
    },
  });

  if (!notification) {
    throw new AppError("Notification not found", 404);
  }

  return prisma.notification.update({
    where: { id: notificationId },
    data: { readAt: new Date() },
  });
}