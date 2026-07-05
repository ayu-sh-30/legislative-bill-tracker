import { prisma } from '../config/prisma';

export type BillListFilters = {
    status? : string;
    house?  : string;
    year?   : number;
    search? : string;
};

export async function getBills(filters : BillListFilters) {
    return prisma.bill.findMany({
        where: {
            status: filters.status,
            house : filters.house,
            year  : filters.year,
            title : filters.search
            ?{
                contains : filters.search,
                mode : "insensitive",
            }
            : undefined,
        },
        orderBy:[
            {
                introducedDate : "desc",
            },
            {
                createdAt : "desc",
            }
        ],
        select : {
            id: true,
            title: true,
            shortTitle: true,
            billNumber : true,
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
    });
}

 export async function getBillsById(id: string) {
        return prisma.bill.findUnique({
            where:{
                id,
            },
            include:{
                versions: {
                    orderBy:{
                        versionDate : "desc",
                    },
                },
                stages: {
                    orderBy:{
                        stageDate : "asc",
                    },
                },
            },
        });
    }

    export async function getBillsByTimeLine(id:string) {
        return prisma.billStage.findMany({
            where:{
                billId: id,
            },
            orderBy:[
                {
                    stageDate : "asc",
                },
                {
                    createdAt : "asc",
                },
            ],
        });
    }

