
import { prisma } from "../config/prisma";
import { AppError } from "../middleware/error.middleware";


async function ensureBillExists(billId : string) {
    const bill = await prisma.bill.findUnique({
        where : {
            id : billId,
        },
        select : {
            id : true,
        },
    });
    if(!bill){
        throw new AppError("Bill not fount", 404);
    }
}

export async function followBill(userId: string, billId : string) {
    await ensureBillExists(billId);

    return prisma.follow.upsert({
        where : {
            userId_billId : {
                userId,
                billId,
            },
        },
        create : {
            userId,
            billId,
        },
        update : {},
        include : {
            bill : {
                select : {
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
                },
            },
        },
    });

}
export async function unfollowBill(userId : string, billId : string) {
    await ensureBillExists(billId);
    
    await prisma.follow.deleteMany({
        where : {
            userId,
            billId,
        },
    });
    return {
        unfollowed : true,
    };
}
export async function getFollowedBill(userId : string) {
    return prisma.follow.findMany({
        where : {
            userId,
        },
        orderBy : {
            createdAt : "desc",
        },
        include : {
            bill : {
                select : {
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
                }
            },
        },
    });
}