export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "build",
        "chore",
        "ci",
        "docs",
        "feat",
        "fix",
        "perf",
        "refactor",
        "revert",
        "style",
        "test",
        "assets",
      ],
    ],
    // Asset commits often start with ticket ids (ASSET-015) or acronyms (CDN).
    "subject-case": [0],
  },
};
