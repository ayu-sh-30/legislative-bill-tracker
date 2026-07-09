// apps/api/src/controllers/ai-ready-bills.controller.ts
import { NextFunction, Request, Response } from "express";

import { getAiReadyBills } from "../services/ai-ready-bills.service";

export async function listAiReadyBills(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const bills = await getAiReadyBills();

    res.status(200).json({
      data: bills,
    });
  } catch (error) {
    next(error);
  }
}