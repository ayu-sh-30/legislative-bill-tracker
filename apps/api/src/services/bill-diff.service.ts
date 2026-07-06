import { diffWords } from "diff";

import { prisma } from "../config/prisma";
import { AppError } from "../middleware/error.middleware";

export type DiffToken = {
  value: string;
  added?: boolean;
  removed?: boolean;
};

export type ClauseUnit = {
  key: string;
  heading: string;
  text: string;
};

export type ClauseDiff = {
  key: string;
  heading: string;
  changeType: "added" | "removed" | "modified" | "unchanged";
  beforeText?: string;
  afterText?: string;
  wordDiff?: DiffToken[];
};

function normalizeText(text: string) {
  return text
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function getClauseHeading(line: string) {
  const trimmed = line.trim();

  const patterns = [
    /^(Clause\s+\d+[A-Z]?\.?)/i,
    /^(Section\s+\d+[A-Z]?\.?)/i,
    /^(\d+[A-Z]?\.)\s+/,
    /^(\d+[A-Z]?)\s*[\).]\s+/,
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);

    if (match) {
      return match[1].replace(/\.$/, "");
    }
  }

  return undefined;
}

function splitIntoClauseUnits(text: string): ClauseUnit[] {
  const normalized = normalizeText(text);
  const lines = normalized.split("\n").map((line) => line.trim()).filter(Boolean);

  const units: ClauseUnit[] = [];
  let currentHeading = "Preamble";
  let currentLines: string[] = [];

  function pushCurrentUnit() {
    const unitText = currentLines.join("\n").trim();

    if (!unitText) {
      return;
    }

    units.push({
      key: currentHeading.toLowerCase(),
      heading: currentHeading,
      text: unitText,
    });
  }

  for (const line of lines) {
    const heading = getClauseHeading(line);

    if (heading) {
      pushCurrentUnit();
      currentHeading = heading;
      currentLines = [line];
    } else {
      currentLines.push(line);
    }
  }

  pushCurrentUnit();

  return units;
}

function createUnitMap(units: ClauseUnit[]) {
  const map = new Map<string, ClauseUnit>();

  for (const unit of units) {
    if (!map.has(unit.key)) {
      map.set(unit.key, unit);
    }
  }

  return map;
}

function textIsSame(beforeText: string, afterText: string) {
  return normalizeText(beforeText) === normalizeText(afterText);
}

export async function getBillVersionDiff(input: {
  billId: string;
  fromVersionId: string;
  toVersionId: string;
}) {
  const [fromVersion, toVersion] = await Promise.all([
    prisma.billVersion.findUnique({
      where: {
        id: input.fromVersionId,
      },
    }),
    prisma.billVersion.findUnique({
      where: {
        id: input.toVersionId,
      },
    }),
  ]);

  if (!fromVersion || !toVersion) {
    throw new AppError("One or both bill versions were not found", 404);
  }

  if (fromVersion.billId !== input.billId || toVersion.billId !== input.billId) {
    throw new AppError("Bill versions do not belong to the requested bill", 400);
  }

  if (!fromVersion.textContent || !toVersion.textContent) {
    throw new AppError("Both bill versions must have extracted text before diffing", 400);
  }

  const beforeUnits = splitIntoClauseUnits(fromVersion.textContent);
  const afterUnits = splitIntoClauseUnits(toVersion.textContent);

  const beforeMap = createUnitMap(beforeUnits);
  const afterMap = createUnitMap(afterUnits);

  const keys = Array.from(new Set([...beforeMap.keys(), ...afterMap.keys()]));

  const clauses: ClauseDiff[] = keys.map((key) => {
    const beforeUnit = beforeMap.get(key);
    const afterUnit = afterMap.get(key);

    if (beforeUnit && !afterUnit) {
      return {
        key,
        heading: beforeUnit.heading,
        changeType: "removed",
        beforeText: beforeUnit.text,
      };
    }

    if (!beforeUnit && afterUnit) {
      return {
        key,
        heading: afterUnit.heading,
        changeType: "added",
        afterText: afterUnit.text,
      };
    }

    if (!beforeUnit || !afterUnit) {
      throw new AppError("Unexpected diff state", 500);
    }

    if (textIsSame(beforeUnit.text, afterUnit.text)) {
      return {
        key,
        heading: afterUnit.heading,
        changeType: "unchanged",
        beforeText: beforeUnit.text,
        afterText: afterUnit.text,
      };
    }

    return {
      key,
      heading: afterUnit.heading,
      changeType: "modified",
      beforeText: beforeUnit.text,
      afterText: afterUnit.text,
      wordDiff: diffWords(beforeUnit.text, afterUnit.text),
    };
  });

  return {
    billId: input.billId,
    fromVersion: {
      id: fromVersion.id,
      label: fromVersion.versionLabel,
      pdfUrl: fromVersion.pdfUrl,
    },
    toVersion: {
      id: toVersion.id,
      label: toVersion.versionLabel,
      pdfUrl: toVersion.pdfUrl,
    },
    summary: {
      added: clauses.filter((clause) => clause.changeType === "added").length,
      removed: clauses.filter((clause) => clause.changeType === "removed").length,
      modified: clauses.filter((clause) => clause.changeType === "modified").length,
      unchanged: clauses.filter((clause) => clause.changeType === "unchanged").length,
    },
    clauses,
  };
}