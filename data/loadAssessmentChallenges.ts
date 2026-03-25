import { readFileSync } from "node:fs";
import path from "node:path";
import {
  type AssessmentChallenge,
  type PythonTestCase,
  type SqlTestCase,
  type TestVisibility,
} from "@/data/assessmentTypes";

type CsvRow = Record<string, string>;

function parseCsv(content: string) {
  const rows: string[][] = [];
  let currentField = "";
  let currentRow: string[] = [];
  let inQuotes = false;

  for (let index = 0; index < content.length; index += 1) {
    const char = content[index];
    const nextChar = content[index + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentField += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      currentRow.push(currentField);
      currentField = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && nextChar === "\n") {
        index += 1;
      }
      currentRow.push(currentField);
      currentField = "";
      if (currentRow.some((field) => field.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      continue;
    }

    currentField += char;
  }

  currentRow.push(currentField);
  if (currentRow.some((field) => field.length > 0)) {
    rows.push(currentRow);
  }

  const [headers = [], ...dataRows] = rows;
  return dataRows.map((row) =>
    headers.reduce<CsvRow>((accumulator, header, index) => {
      accumulator[header] = row[index] ?? "";
      return accumulator;
    }, {})
  );
}

function splitMultiValue(value: string) {
  return value
    .split("||")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseVisibility(value: string): TestVisibility {
  return value === "hidden" ? "hidden" : "public";
}

function getDataPath(fileName: string) {
  return path.join(process.cwd(), "data", "csv", fileName);
}

export function loadAssessmentChallenges() {
  const challengeRows = parseCsv(
    readFileSync(getDataPath("assessment-challenges.csv"), "utf8")
  );
  const testCaseRows = parseCsv(
    readFileSync(getDataPath("assessment-test-cases.csv"), "utf8")
  );

  return challengeRows.map<AssessmentChallenge>((row) => {
    const matchingTests = testCaseRows.filter(
      (testCase) => testCase.challenge_slug === row.slug
    );

    if (row.category === "python") {
      const testCases = matchingTests.map<PythonTestCase>((testCase, index) => ({
        id: `${row.slug}-${index}-${testCase.label}`,
        label: testCase.label,
        args: JSON.parse(testCase.args_json || "[]"),
        expected: JSON.parse(testCase.expected_json || "null"),
        visibility: parseVisibility(testCase.visibility),
      }));

      return {
        slug: row.slug,
        title: row.title,
        category: "python",
        difficulty: (row.difficulty as AssessmentChallenge["difficulty"]) || "Easy",
        summary: row.summary,
        instructions: splitMultiValue(row.instructions),
        starterCode: row.starter_code,
        functionName: row.function_name,
        testCases,
      };
    }

    const testCases = matchingTests.map<SqlTestCase>((testCase, index) => ({
      id: `${row.slug}-${index}-${testCase.label}`,
      label: testCase.label,
      expected: JSON.parse(testCase.expected_json || "[]"),
      visibility: parseVisibility(testCase.visibility),
    }));

    return {
      slug: row.slug,
      title: row.title,
      category: "sql",
      difficulty: (row.difficulty as AssessmentChallenge["difficulty"]) || "Easy",
      summary: row.summary,
      instructions: splitMultiValue(row.instructions),
      starterCode: row.starter_code,
      setupSql: splitMultiValue(row.setup_sql),
      testCases,
    };
  });
}
