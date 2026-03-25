export type TestVisibility = "public" | "hidden";

export type PythonTestCase = {
  id: string;
  label: string;
  args: unknown[];
  expected: unknown;
  visibility: TestVisibility;
};

export type SqlTestCase = {
  id: string;
  label: string;
  expected: Array<Record<string, unknown>>;
  visibility: TestVisibility;
};

export type AssessmentChallenge =
  | {
      slug: string;
      title: string;
      category: "python";
      difficulty: "Easy" | "Medium" | "Hard";
      summary: string;
      instructions: string[];
      starterCode: string;
      testCases: PythonTestCase[];
      functionName: string;
    }
  | {
      slug: string;
      title: string;
      category: "sql";
      difficulty: "Easy" | "Medium" | "Hard";
      summary: string;
      instructions: string[];
      starterCode: string;
      setupSql: string[];
      testCases: SqlTestCase[];
    };
