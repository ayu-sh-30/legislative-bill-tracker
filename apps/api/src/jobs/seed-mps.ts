import { create } from "node:domain";
import { prisma } from "../config/prisma";
import { error } from "node:console";

type SeedMpInput = {
  name: string;
  house?: string;
  party?: string;
  state?: string;
  constituency: string;
  source: string;
  rawSourceData?: {
    note: string;
  };
  activities?: {
    activityType: string;
    title: string;
    activityDate?: Date;
    sourceUrl?: string;
    rawSourceData?: {
      note: string;
    };
  }[];
};

const seedMps: SeedMpInput[] = [
  {
    name: "Rahul Gandhi",
    house: "Lok Sabha",
    party: "Indian National Congress",
    state: "Uttar Pradesh",
    constituency: "Rae Bareli",
    source: "manual-seed",
    rawSourceData: {
      note: "Initial manually curated MP seed record for development",
    },
    activities: [
      {
        activityType: "debate",
        title: "Participated in parliamentary debate",
        activityDate: new Date("2024-07-01"),
        sourceUrl: "https://prsindia.org/",
        rawSourceData: {
          note: "Placeholder activity; replace with PRS/Vonter dataset import later",
        },
      },
    ],
  },
  {
    name: "Amit Shah",
    house: "Lok Sabha",
    party: "Bharatiya Janata Party",
    state: "Gujarat",
    constituency: "Gandhinagar",
    source: "manual-seed",
    rawSourceData: {
      note: "Initial manually curated MP seed record for development",
    },
    activities: [
      {
        activityType: "bill_related",
        title: "Associated with Home Affairs legislation",
        activityDate: new Date("2023-12-20"),
        sourceUrl: "https://sansad.in/",
        rawSourceData: {
          note: "Placeholder activity; replace with official source mapping later",
        },
      },
    ],
  },
];

async function main() {
    console.log(`Starting MP seed job for ${seedMps.length} MPs`);

    for(const mpInput of seedMps){
        const mp = await prisma.mp.upsert({
            where : {
                source_name_constituency: {
                    source: mpInput.source,
                    name: mpInput.name,
                    constituency: mpInput.constituency,
                },
            },
            create: {
                        name: mpInput.name,
                        house: mpInput.house,
                        party: mpInput.party,
                        state: mpInput.state,
                        constituency: mpInput.constituency,
                        source: mpInput.source,
                        rawSourceData: mpInput.rawSourceData,
            },
            update : {
                        house: mpInput.house,
                        party: mpInput.party,
                        state: mpInput.state,
                        constituency: mpInput.constituency,
                        source: mpInput.source,
                        rawSourceData: mpInput.rawSourceData,
            },
        });

        for(const activity of mpInput.activities ?? []){
            await prisma.mpActivity.create({
                data : {
                            mpId: mp.id,
                            activityType: activity.activityType,
                            title: activity.title,
                            activityDate: activity.activityDate,
                            sourceUrl: activity.sourceUrl,
                            rawSourceData: activity.rawSourceData,
                }
            });
        }
        console.log(`Seeded Mp: ${mp.name}`);
    }
    console.log("MP seed job complete");
}

main()
    .catch((error)=>{
        console.error("MP seed job failes", error);
        process.exit(1);
    })
    .finally(async ()=>{
        await prisma.$disconnect();
    });