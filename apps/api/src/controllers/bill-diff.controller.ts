import type { NextFunction, Request, Response } from "express";

import { AppError } from "../middleware/error.middleware";
import { getBillVersionDiff } from "../services/bill-diff.service";

type BillIdParams = {
  id: string;
};

export async function getBillDiffController(
  req: Request<BillIdParams>,
  res: Response,
  next: NextFunction
) {
  try {
    const fromVersionId =
      typeof req.query.from === "string" ? req.query.from : undefined;
    const toVersionId =
      typeof req.query.to === "string" ? req.query.to : undefined;

    if (!fromVersionId || !toVersionId) {
      throw new AppError("from and to query parameters are required", 400);
    }

    const diff = await getBillVersionDiff({
      billId: req.params.id,
      fromVersionId,
      toVersionId,
    });

    res.status(200).json({
      data: diff,
    });
  } catch (error) {
    next(error);
  }
}