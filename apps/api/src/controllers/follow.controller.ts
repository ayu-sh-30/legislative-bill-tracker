import { Request, Response, NextFunction } from "express";
import { followBill, getFollowedBill, unfollowBill } from "../services/follow.service";
import { AppError } from "../middleware/error.middleware";

type BillIdParams = {
    id : string;
};
function getAuthenticatedUserId(req : Request) {
    if(!req.user){
        throw new AppError("Authentication Required", 401);
    }
    return req.user.id;
}

export async function followBillController(req : Request<BillIdParams>, res : Response, next : NextFunction) {
    try {
        const userId = getAuthenticatedUserId(req);
        const follow = await followBill(userId, req.params.id);

        res.status(200).json({
            data : follow,
        });

    } catch (error) {
        next(error);
    }
}

export async function unfollowBillController(req : Request<BillIdParams>, res : Response, next : NextFunction) {
    try {
        const userId = getAuthenticatedUserId(req);
        const result = await unfollowBill(userId, req.params.id);

        res.status(200).json({
            data : result,
        });
    } catch (error) {
        next(error);
    }
}

export async function getMyFollowsController(req : Request<BillIdParams>, res : Response, next : NextFunction) {
    try {
        const userId = getAuthenticatedUserId(req);
        const result = await getFollowedBill(userId);

        res.status(200).json({
            data : result,
        });
    } catch (error) {
        next(error);
    }
}