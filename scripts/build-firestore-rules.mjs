import {
  mkdir,
  readFile,
  writeFile,
} from "node:fs/promises";

import {
  dirname,
  resolve,
} from "node:path";

/* ============================================================
   CONFIG
============================================================ */

const projectRoot =
  process.cwd();

const outputFile =
  resolve(
    projectRoot,
    "firestore.rules",
  );

const sourceFiles = [
  "firestore/rules/01-core.rules",
  "firestore/rules/02-users.rules",
  "firestore/rules/03-marketplace.rules",

  "firestore/rules/04-bookings.rules",
  "firestore/rules/11-booking.service.rules",
  "firestore/rules/12-booking.counter.rules",
  "firestore/rules/13-bookings.order.rules",

  "firestore/rules/05-market-orders.rules",
  "firestore/rules/06-calls.rules",
  "firestore/rules/08-shops.rules",
  "firestore/rules/07-misc.rules",
  "firestore/rules/09-reviews.rules",
  "firestore/rules/10-saved-workers.rules",
];

/* ============================================================
   SOURCE VALIDATION
============================================================ */

function validateRuleSource(
  relativePath,
  content,
) {
  const lines =
    content.split(/\r?\n/);

  const forbiddenPatterns = [
    {
      pattern:
        /^\s*import\s+/,

      message:
        "JavaScript/TypeScript import statement",
    },

    {
      pattern:
        /^\s*export\s+/,

      message:
        "JavaScript/TypeScript export statement",
    },

    {
      pattern:
        /^\s*(const|let|var)\s+/,

      message:
        "JavaScript variable declaration",
    },


    {
      pattern:
        /^\s*from\s+["']/,

      message:
        "JavaScript/TypeScript import source",
    },

    {
      pattern:
        /^\s*process\./,

      message:
        "Node.js process API",
    },

    {
      pattern:
        /^\s*console\./,

      message:
        "JavaScript console statement",
    },
  ];

  for (
    let index = 0;
    index < lines.length;
    index += 1
  ) {
    const line =
      lines[index];

    for (
      const rule
      of forbiddenPatterns
    ) {
      if (
        rule.pattern.test(line)
      ) {
        throw new Error(
          [
            `Invalid Firestore Rules source: ${relativePath}`,
            `Line ${index + 1}: ${rule.message}`,
            "",
            line.trim(),
            "",
            "A .rules source file must contain Firestore Security Rules only.",
          ].join("\n"),
        );
      }
    }
  }

  /* ----------------------------------------------------------
     Individual source files must not contain their own wrapper.

     The wrapper belongs in the generated firestore.rules file.
  ---------------------------------------------------------- */

  const forbiddenWrappers = [
    {
      pattern:
        /^\s*rules_version\s*=/m,

      message:
        "rules_version must not be declared inside a partial rules file",
    },

    {
      pattern:
        /^\s*service\s+cloud\.firestore\s*\{/m,

      message:
        "service cloud.firestore wrapper must not exist inside a partial rules file",
    },
  ];

  for (
    const wrapper
    of forbiddenWrappers
  ) {
    if (
      wrapper.pattern.test(
        content,
      )
    ) {
      throw new Error(
        [
          `Invalid Firestore Rules source: ${relativePath}`,
          wrapper.message,
          "",
          "Keep rules_version and service cloud.firestore only in the generated root file.",
        ].join("\n"),
      );
    }
  }
}

/* ============================================================
   READ SOURCE FILE
============================================================ */

async function readRuleFile(
  relativePath,
) {
  const absolutePath =
    resolve(
      projectRoot,
      relativePath,
    );

  try {
    const content =
      await readFile(
        absolutePath,
        "utf8",
      );

    const cleaned =
      content.trim();

    if (!cleaned) {
      throw new Error(
        `Rules file is empty: ${relativePath}`,
      );
    }

    validateRuleSource(
      relativePath,
      cleaned,
    );

    return [
      "/* ============================================================",
      `   SOURCE: ${relativePath}`,
      "============================================================ */",
      "",
      cleaned,
    ].join("\n");
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : String(error);

    throw new Error(
      `Unable to read ${relativePath}:\n${message}`,
    );
  }
}

/* ============================================================
   BUILD
============================================================ */

async function buildFirestoreRules() {
  console.log("");
  console.log(
    "Building Firestore rules...",
  );
  console.log("");

  const parts = [];

  for (
    const sourceFile
    of sourceFiles
  ) {
    const content =
      await readRuleFile(
        sourceFile,
      );

    parts.push(
      content,
    );

    console.log(
      `✓ ${sourceFile}`,
    );
  }

  /* ==========================================================
     ROOT FIRESTORE RULES WRAPPER

     All partial rule files are inserted inside:
     match /databases/{database}/documents
  ========================================================== */

  const generatedHeader = [
    "/*",
    " * ============================================================",
    " * AUTO-GENERATED FIRESTORE RULES",
    " *",
    " * DO NOT EDIT THIS FILE DIRECTLY.",
    " *",
    " * Edit files inside:",
    " * firestore/rules/",
    " *",
    " * Then run:",
    " * npm run rules:build",
    " * ============================================================",
    " */",
    "",
  ].join("\n");

  const body =
    parts
      .join("\n\n")
      .split("\n")
      .map(
        line =>
          line.length > 0
            ? `    ${line}`
            : "",
      )
      .join("\n");

  const output = [
    generatedHeader,
    "rules_version = '2';",
    "",
    "service cloud.firestore {",
    "  match /databases/{database}/documents {",
    "",
    body,
    "",
    "  }",
    "}",
    "",
  ].join("\n");

  await mkdir(
    dirname(
      outputFile,
    ),
    {
      recursive:
        true,
    },
  );

  await writeFile(
    outputFile,
    output,
    "utf8",
  );

  console.log("");
  console.log(
    "✓ firestore.rules generated successfully.",
  );

  console.log(
    `✓ Output: ${outputFile}`,
  );

  console.log("");
}

/* ============================================================
   RUN
============================================================ */

buildFirestoreRules().catch(
  error => {
    console.error("");
    console.error(
      "Failed to build Firestore rules.",
    );

    console.error("");

    console.error(
      error instanceof Error
        ? error.message
        : error,
    );

    console.error("");

    process.exitCode = 1;
  },
);