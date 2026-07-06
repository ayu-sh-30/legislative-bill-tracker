import { prisma } from "../config/prisma";
import { extractTextFromPdfUrl } from "../services/pdf-text.service";

async function main() {
  const limit = Number(process.env.PDF_TEXT_LIMIT ?? 5);

  const versions = await prisma.billVersion.findMany({
    where: {
      pdfUrl: {
        not: null,
      },
      textContent: null,
    },
    take: limit,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      bill: {
        select: {
          title: true,
        },
      },
    },
  });

  console.log(`Found ${versions.length} bill versions needing text extraction`);

  for (const version of versions) {
    if (!version.pdfUrl) {
      continue;
    }

    console.log(`Extracting PDF text: ${version.bill.title} - ${version.versionLabel}`);

    try {
      const textContent = await extractTextFromPdfUrl(version.pdfUrl);

      await prisma.billVersion.update({
        where: {
          id: version.id,
        },
        data: {
          textContent,
        },
      });

      console.log(`Extracted ${textContent.length} characters`);
    } catch (error) {
      console.warn(
        `Failed to extract text for version ${version.id}`,
        error instanceof Error ? error.message : error
      );
    }
  }

  console.log("PDF text extraction job complete");
}

main()
  .catch((error) => {
    console.error("PDF text extraction job failed", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });