import { prisma } from "../config/prisma";

export type MpListFiletrs = {
    party? : string;
    state? : string;
    house? : string;
    search? : string;
};

export async function getMps(filters : MpListFiletrs) {
    return prisma.mp.findMany({
        where : {
            party : filters.party,
            state : filters.state,
            house : filters.house,
            name : filters.search
            ?{
                contains : filters.search,
                mode : "insensitive"
            }
            : undefined,
        },
        orderBy : {
            name : "asc",
        },
        select : {
            id : true,
            name : true,
            house : true,
            party : true,
            state : true,
            constituency : true,
            source : true,
            createdAt : true,
            updatedAt : true,
        },
    });
}

export async function getMpById(id : string) {
    return prisma.mp.findUnique({
        where : {
            id,
        },
        include : {
            mpActivities : {
                orderBy : [
                    {
                        activityDate : "desc",
                    },
                    {
                        createdAt : "desc"
                    },
                ],
            },
        },
    });
}

export async function getMpActivities(mpId : string) {
    return prisma.mpActivity.findMany({
        where : {
            mpId,
        },
        orderBy : [
            {
                activityDate : "desc",
            },
            {
                createdAt : "desc",
            },
        ],
    });
}