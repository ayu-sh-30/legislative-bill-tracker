import type { NextFunction, Request, Response } from "express";
import { z } from "zod";

import { AppError } from "../middleware/error.middleware";
import { summarizeBillVersionDiff } from "../services/diff-summary.service";

type BillIdParams = {
  id: string;
};

const diffSummarySchema = z.object({
  fromVersionId: z.string().min(1),
  toVersionId: z.string().min(1),
});

export async function summarizeBillDiffController(
  req: Request<BillIdParams>,
  res: Response,
  next: NextFunction
) {
  try {
    const parsed = diffSummarySchema.safeParse(req.body);

    if (!parsed.success) {
      throw new AppError("fromVersionId and toVersionId are required", 400);
    }

    const summary = await summarizeBillVersionDiff({
      billId: req.params.id,
      fromVersionId: parsed.data.fromVersionId,
      toVersionId: parsed.data.toVersionId,
    });

    res.status(200).json({
      data: summary,
    });
  } catch (error) {
    next(error);
  }
}