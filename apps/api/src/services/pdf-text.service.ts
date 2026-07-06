// apps/api/src/services/pdf-text.service.ts
import { PDFParse } from "pdf-parse";

async function fetchWithTimeout(url: string, timeoutMs = 30000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "legislative-bill-tracker/1.0",
      },
    });
  } finally {
    clearTimeout(timeout);
  }
}

function normalizeExtractedText(text: string) {
  return text
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function extractTextFromPdfUrl(pdfUrl: string) {
  const response = await fetchWithTimeout(pdfUrl);

  if (!response.ok) {
    throw new Error(`Failed to fetch PDF: ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();

  const parser = new PDFParse({
    data: arrayBuffer,
  });

  try {
    const result = await parser.getText();
    return normalizeExtractedText(result.text);
  } finally {
    await parser.destroy();
  }
}