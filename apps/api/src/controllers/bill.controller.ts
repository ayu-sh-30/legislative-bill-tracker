import { Request, Response, NextFunction } from "express";

import { AppError } from "../middleware/error.middleware";

import { getBills, getBillsById, getBillsByTimeLine } from "../services/bills.service";

type BillIdParams = {
    id : string;
};

export async function listBills(req: Request, res:Response, next: NextFunction) {
    try{
        const year = typeof req.query.year === "string" ? Number(req.query.year) : undefined;

        if(req.query.year && Number.isNaN(year)){
            throw new AppError("Year must be a valid number", 400);
        }
        const bills = await getBills({
        status : typeof req.query.status === "string" ? req.query.status : undefined,
        house  : typeof req.query.house === "string" ? req.query.house : undefined,
        year,
        search : typeof req.query.search === "string" ? req.query.search : undefined,
        
    });
    res.status(200).json({
        data : bills,
    });
    }
    catch(error){
        next(error);
    }
}

export async function getBillDetail(req: Request<BillIdParams>, res: Response, next: NextFunction){
    try{
        const bill = await getBillsById(req.params.id);

        if(!bill){
            throw new AppError("Bill not found", 404);
        }

        res.status(200).json({
            data : bill,
        });
    }
    catch(error){
        next(error);
    }
}

export async function getBillTimelineDetail(req: Request<BillIdParams>, res:Response, next : NextFunction) {
    try{
        const bill = await getBillsById(req.params.id);
        if(!bill){
            throw new AppError("Bill not found", 404);
        }
        const timeline = await getBillsByTimeLine(req.params.id);

        res.status(200).json(
            {
                data : timeline,        
            }
        )
    }catch(error){
        next(error);
    }
}