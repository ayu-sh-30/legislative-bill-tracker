import { Request, Response, NextFunction } from "express";
import { AppError } from "../middleware/error.middleware";
import { getMps, getMpActivities, getMpById } from "../services/mp.service";

type MpIdParams = {
    id : string;
};

export async function listMps(req: Request, res: Response, next: NextFunction) {
    try {
        const mps = await getMps({
            party : typeof req.query.party === "string" ? req.query.party : undefined,
            state : typeof req.query.state === "string" ? req.query.state : undefined,
            house : typeof req.query.house === "string" ? req.query.house : undefined,
            search : typeof req.query.search === "string" ? req.query.search : undefined,
        });

        res.status(200).json({
            data : mps,
        });
        
    } catch (error) {
        next(error);
    }
}
export async function getMpDetails(req: Request<MpIdParams>, res: Response, next: NextFunction) {
    try {
        const mpId = await getMpById(req.params.id);
        if(!mpId){
            throw new AppError("MP not found", 404);
        }
        res.status(200).json(
            {
                data : mpId,
            }
        )
    } catch (error) {
        next(error);
    }
}
export async function getMpActivityList(req: Request<MpIdParams>, res: Response, next: NextFunction) {
    try {
        const mpId = await getMpById(req.params.id);

        if(!mpId){
            throw new AppError("MP not found", 404);
        }
        const activities = await getMpActivities(req.params.id);

        res.status(200).json(
            {
                data : activities,
            }
        )
        
    } catch (error) {
        next(error);
    }
}

